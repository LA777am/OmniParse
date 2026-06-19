"""
Document endpoints — upload and query.

Sprint 1: Stub routes returning placeholder responses.
Sprint 2: Synchronous upload + parse pipeline.
Sprint 3: Async dispatch to Celery.
Sprint 4: Query endpoint with vector search + LLM.
"""

from __future__ import annotations
import aiofiles
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from uuid import uuid4
from datetime import datetime
from slugify import slugify

from app.config import settings
from app.database import get_async_db
from app.services.parser import extract_chunks_with_coordinates
from app.services.embeddings import generate_embeddings_batch

router = APIRouter(prefix="/documents", tags=["Documents"])
db = get_async_db()

@router.post("/upload", status_code=202)
async def upload_document(
    file: UploadFile = File(...),
    document_name: str = Form(None)
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

@router.post("/{document_id}/query")
async def query_document(document_id: str):
    """Semantic search + LLM answer generation. (Sprint 4)"""
    return {"message": f"Query endpoint for {document_id} — implemented in Sprint 4"}

@router.get("/{document_id}/stats")
async def get_document_stats(document_id: str):
    """Retrieve document metadata and parsing statistics."""
    task = await db.ingestion_tasks.find_one({"document_id": document_id})
    if not task:
        raise HTTPException(status_code=404, detail="Document not found.")

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
    }
