"""
Pydantic models for task status tracking.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TaskStatusResponse(BaseModel):
    """Response payload for task status polling."""
    task_id: str
    document_id: str
    original_filename: str
    status: str  # pending | processing | completed | failed
    chunk_count: int = 0
    page_count: int = 0
    error_log: Optional[str] = None
    created_at: datetime
    updated_at: datetime
