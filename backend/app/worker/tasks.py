"""Celery worker tasks — stubs for Sprint 1, implemented in Sprint 3."""
from __future__ import annotations

from app.worker.celery_app import celery_app


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def process_document(self, task_id: str, file_path: str, document_id: str):
    """
    Background task: parse a PDF, generate embeddings, store chunks in MongoDB.

    Implemented in Sprint 3. This stub exists so Celery's task autodiscovery
    can register the task name at startup.
    """
    raise NotImplementedError("process_document will be implemented in Sprint 3")
