"""
Task status endpoints — polling for ingestion job progress.

Sprint 1: Stub route.
Sprint 2: Live read from MongoDB ingestion_tasks collection.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.database import get_async_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/{task_id}/status")
async def get_task_status(task_id: str):
    """Poll the current status of a document processing task."""
    db = get_async_db()
    task = await db.ingestion_tasks.find_one(
        {"task_id": task_id},
        {"_id": 0, "task_id": 1, "document_id": 1, "status": 1,
         "chunk_count": 1, "error_log": 1, "created_at": 1, "updated_at": 1},
    )
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found.")
    return task
