"""
Task status endpoints — polling for ingestion job progress.

Sprint 1: Stub route.
Sprint 2: Live read from MongoDB ingestion_tasks collection.
"""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/{task_id}/status")
async def get_task_status(task_id: str):
    """Poll the current status of a document processing task. (Sprint 2)"""
    return {"message": f"Task status for {task_id} — implemented in Sprint 2"}
