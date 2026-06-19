"""Celery worker tasks — processing documents in the background (Sprint 3)."""
from __future__ import annotations

import logging
from datetime import datetime

from app.worker.celery_app import celery_app
from app.database import get_sync_db
from app.services.parser import extract_chunks_with_coordinates
from app.services.embeddings import generate_embeddings_batch

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def process_document(self, task_id: str, file_path: str, document_id: str):
    """
    Background task: parse a PDF, generate embeddings, store chunks in MongoDB.
    """
    logger.info(f"Starting Celery task for document {document_id}")
    db = get_sync_db()
    
    try:
        # 1. Parse the PDF spatially
        chunks = extract_chunks_with_coordinates(file_path, document_id)
        logger.info(f"Extracted {len(chunks)} chunks from {document_id}")
        
        # 2. Generate local sentence embeddings
        enriched_chunks = generate_embeddings_batch(chunks)
        logger.info(f"Generated embeddings for {len(enriched_chunks)} chunks")
        
        # 3. Store chunks in MongoDB (Synchronous bulk insert)
        if enriched_chunks:
            db.document_chunks.insert_many(enriched_chunks, ordered=False)
            
        # 4. Mark task as completed
        db.ingestion_tasks.update_one(
            {"task_id": task_id},
            {"$set": {
                "status": "completed",
                "chunk_count": len(enriched_chunks),
                "updated_at": datetime.utcnow(),
            }}
        )
        logger.info(f"Successfully processed {document_id}")
        return {"status": "completed", "chunk_count": len(enriched_chunks)}
        
    except Exception as exc:
        logger.error(f"Failed to process {document_id}: {exc}", exc_info=True)
        # Mark task as failed
        db.ingestion_tasks.update_one(
            {"task_id": task_id},
            {"$set": {
                "status": "failed",
                "error_log": str(exc),
                "updated_at": datetime.utcnow(),
            }}
        )
        # We don't automatically retry for parsing logic errors (e.g. bad PDF)
        # but you can use `self.retry(exc=exc)` here for network/transient DB errors.
        raise exc
