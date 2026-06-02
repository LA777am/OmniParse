"""
Database connection module.

Provides two MongoDB client strategies:
  - `motor` (async) for FastAPI request handlers
  - `pymongo` (sync) for Celery worker tasks

Both connect to the same MongoDB Atlas cluster using the same URI.
"""

from __future__ import annotations

import motor.motor_asyncio
import pymongo

from app.config import settings


# ────────────────────────────────────────────────────
#  Async client (FastAPI — used in request handlers)
# ────────────────────────────────────────────────────
_async_client: motor.motor_asyncio.AsyncIOMotorClient | None = None


def get_async_client() -> motor.motor_asyncio.AsyncIOMotorClient:
    """Return the singleton async MongoDB client, creating it on first call."""
    global _async_client
    if _async_client is None:
        _async_client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_uri)
    return _async_client


def get_async_db():
    """Return the async database handle."""
    return get_async_client()[settings.mongodb_db_name]


# ────────────────────────────────────────────────────
#  Sync client (Celery workers — blocking context)
# ────────────────────────────────────────────────────
_sync_client: pymongo.MongoClient | None = None


def get_sync_client() -> pymongo.MongoClient:
    """Return the singleton sync MongoDB client, creating it on first call."""
    global _sync_client
    if _sync_client is None:
        _sync_client = pymongo.MongoClient(settings.mongodb_uri)
    return _sync_client


def get_sync_db():
    """Return the sync database handle."""
    return get_sync_client()[settings.mongodb_db_name]


# ────────────────────────────────────────────────────
#  Health check utility
# ────────────────────────────────────────────────────
async def check_mongodb_health() -> bool:
    """Ping MongoDB Atlas to verify connectivity."""
    try:
        client = get_async_client()
        await client.admin.command("ping")
        return True
    except Exception:
        return False
