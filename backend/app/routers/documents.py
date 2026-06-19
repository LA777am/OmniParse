"""
Document endpoints — upload and query.

Sprint 1: Stub routes returning placeholder responses.
Sprint 2: Synchronous upload + parse pipeline.
Sprint 3: Async dispatch to Celery.
Sprint 4: Query endpoint with vector search + LLM.
"""

from __future__ import annotations
import aiofiles
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status, Depends
from uuid import uuid4
from datetime import datetime
from slugify import slugify
from pydantic import BaseModel

from app.config import settings
from app.database import get_async_db
from app.services.parser import extract_chunks_with_coordinates
from app.services.embeddings import generate_embeddings_batch, find_similar_chunks
from app.services.llm import generate_answer
from app.auth import get_optional_user

router = APIRouter(prefix="/documents", tags=["Documents"])
db = get_async_db()

@router.get("/")
async def list_documents(user_id: str | None = Depends(get_optional_user)):
    """Retrieve the 10 most recent document ingestion tasks."""
    if not user_id:
        return [] # Anonymous users have no history
        
    cursor = db.ingestion_tasks.find({"user_id": user_id}).sort("created_at", -1).limit(10)
    tasks = await cursor.to_list(length=10)
    
    return [
        {
            "document_id": t.get("document_id"),
            "original_filename": t.get("original_filename"),
            "status": t.get("status"),
            "created_at": t.get("created_at")
        }
        for t in tasks
    ]

@router.post("/upload", status_code=202)
async def upload_document(
    file: UploadFile = File(...),
    document_name: str = Form(None),
    user_id: str | None = Depends(get_optional_user)
):
    """Accept a PDF upload and parse it synchronously for Sprint 2."""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    
    if file.size and file.size > settings.max_file_size_bytes:
        raise HTTPException(status_code=413, detail="File exceeds size limit.")
    
    task_id = str(uuid4())
    document_id = slugify(document_name or file.filename) + f"_{task_id[:8]}"
    file_path = settings.upload_path / f"{task_id}.pdf"
    
    async with aiofiles.open(file_path, "wb") as dest:
        content = await file.read()
        await dest.write(content)
        
    task_record = {
        "task_id": task_id,
        "document_id": document_id,
        "user_id": user_id,
        "original_filename": file.filename,
        "file_path": str(file_path),
        "status": "processing",
        "chunk_count": 0,
        "error_log": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await db.ingestion_tasks.insert_one(task_record)
    
    from app.worker.tasks import process_document
    
    # Sprint 3: Asynchronous dispatch to Celery
    process_document.delay(task_id, str(file_path), document_id)
    
    return {"task_id": task_id, "document_id": document_id, "status": "processing"}

class QueryRequest(BaseModel):
    query: str
    top_k: int = 15

@router.post("/{document_id}/query")
async def query_document(document_id: str, req: QueryRequest, user_id: str | None = Depends(get_optional_user)):
    """Semantic search + LLM answer generation. (Sprint 4)"""
    # 1. Ensure document exists and is completely processed
    task = await db.ingestion_tasks.find_one({"document_id": document_id})
    if not task:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    if task.get("user_id") and task.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this document.")
        
    if task.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Document is still processing or failed.")
        
    # 2. Find similar chunks using exact KNN vector search
    best_chunks = await find_similar_chunks(db, document_id, req.query, req.top_k)
    if not best_chunks:
        return {"answer": "No relevant text found in the document.", "sources": []}
        
    # 3. Generate answer using Gemini 2.5 Flash
    answer = await generate_answer(req.query, best_chunks)
    
    return {
        "answer": answer,
        "sources": best_chunks
    }

@router.get("/{document_id}/stats")
async def get_document_stats(document_id: str, user_id: str | None = Depends(get_optional_user)):
    """Retrieve document metadata and parsing statistics."""
    task = await db.ingestion_tasks.find_one({"document_id": document_id})
    if not task:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    if task.get("user_id") and task.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this document.")

    pipeline = [
        {"$match": {"document_id": document_id}},
        {"$group": {
            "_id": "$chunk_type",
            "count": {"$sum": 1},
            "avg_length": {"$avg": {"$strLenCP": "$chunk_text"}}
        }}
    ]
    chunk_stats_cursor = db.document_chunks.aggregate(pipeline)
    chunk_stats = await chunk_stats_cursor.to_list(length=None)

    page_pipeline = [
        {"$match": {"document_id": document_id}},
        {"$group": {"_id": "$page_number"}}
    ]
    pages_cursor = db.document_chunks.aggregate(page_pipeline)
    pages = await pages_cursor.to_list(length=None)

    return {
        "document_id": document_id,
        "original_filename": task.get("original_filename"),
        "status": task.get("status"),
        "total_chunks": task.get("chunk_count"),
        "total_pages": len(pages),
        "chunk_breakdown": {
            stat["_id"]: {
                "count": stat["count"],
                "avg_length": round(stat["avg_length"], 2) if stat.get("avg_length") is not None else 0
            } for stat in chunk_stats
        },
        "created_at": task.get("created_at"),
        "pdf_url": f"/api/v1/uploads/{task.get('task_id')}.pdf" if task.get("task_id") else None,
    }
