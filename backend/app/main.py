"""
Lean OmniParse — FastAPI Application Entry Point.

This is the API Gateway tier. It handles:
  - File upload acceptance and dispatch to Celery
  - Task status polling
  - Query vectorization, vector search, and LLM generation
  - Static file serving for uploaded PDFs

The API Gateway is STATELESS with respect to document processing.
All heavy compute runs on Celery workers.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import check_mongodb_health, get_async_client
from app.routers import documents, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup / shutdown lifecycle.
    - On startup: verify MongoDB and Redis connectivity.
    - On shutdown: close database connections.
    """
    # Startup: ensure upload directory exists
    settings.upload_path  # triggers mkdir

    yield

    # Shutdown: close the async MongoDB client
    client = get_async_client()
    client.close()


app = FastAPI(
    title="Lean OmniParse",
    description="Distributed Multimodal RAG Platform with Spatial Metadata Extraction",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──
app.include_router(documents.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")

# ── Static file serving for uploaded PDFs ──
# Allows the React frontend to fetch PDFs at /uploads/{filename}
app.mount("/uploads", StaticFiles(directory=str(settings.upload_path)), name="uploads")


# ── Health Check ──
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """
    Liveness + dependency check.
    Returns the connectivity status of MongoDB and Redis.
    """
    # MongoDB
    mongo_ok = await check_mongodb_health()

    # Redis
    redis_ok = False
    try:
        r = aioredis.from_url(settings.redis_url)
        redis_ok = await r.ping()
        await r.aclose()
    except Exception:
        redis_ok = False

    status = "ok" if (mongo_ok and redis_ok) else "degraded"

    return {
        "status": status,
        "mongodb": "connected" if mongo_ok else "disconnected",
        "redis": "connected" if redis_ok else "disconnected",
    }
