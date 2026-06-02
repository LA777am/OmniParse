"""
Pydantic models for document-related request and response payloads.

These models are shared between routers and services to ensure consistent
serialization and validation at API boundaries.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


# ─── Nested sub-models ───

class SpatialCoordinates(BaseModel):
    """Pixel-precise bounding box in PDF coordinate space (top-left origin)."""
    x0: float
    y0: float
    x1: float
    y1: float


class PageDimensions(BaseModel):
    """Native PDF page dimensions in points (72 DPI)."""
    width: float
    height: float


# ─── Response models ───

class UploadResponse(BaseModel):
    """Returned immediately on successful upload dispatch."""
    task_id: str
    document_id: str
    status: str = "pending"


class ChunkOut(BaseModel):
    """A single document chunk with spatial metadata."""
    document_id: str
    page_number: int
    page_dimensions: PageDimensions
    chunk_text: str
    chunk_type: str
    spatial_coordinates: SpatialCoordinates
    created_at: datetime


class Citation(BaseModel):
    """A citation linking an LLM answer back to a source chunk."""
    source_index: int
    page_number: int
    page_dimensions: PageDimensions
    bounding_box: list[float] = Field(..., min_length=4, max_length=4)
    chunk_text: str
    chunk_type: str
    relevance_score: float = 0.0


class QueryRequest(BaseModel):
    """User question payload."""
    question: str = Field(..., min_length=1, max_length=2000)


class QueryResponse(BaseModel):
    """Full answer payload with grounded citations."""
    answer: str
    citations: list[Citation]
    model: str
    chunks_retrieved: int
