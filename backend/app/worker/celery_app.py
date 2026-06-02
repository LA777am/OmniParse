"""
Celery application factory.

Configures Celery with Redis as the message broker and result backend.
Critical reliability settings:
  - acks_late: message acknowledged AFTER task completes (not before)
  - reject_on_worker_lost: re-queue task if worker crashes mid-execution
"""

from __future__ import annotations

from celery import Celery

from app.config import settings

celery_app = Celery(
    "omniparse",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.worker.tasks"],
)

# ── Reliability configuration ──
celery_app.conf.update(
    # Acknowledge messages AFTER the task function returns, not when received.
    # If the worker crashes mid-task, Redis retains the message for redelivery.
    task_acks_late=True,

    # If a worker is killed (OOM, SIGKILL), reject the message so another
    # worker can pick it up.
    task_reject_on_worker_lost=True,

    # Serialize everything as JSON for cross-language compatibility and debuggability.
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],

    # Timezone
    timezone="UTC",
    enable_utc=True,

    # Limit prefetch to 1 task per worker to prevent resource hoarding
    # on CPU-heavy parsing tasks.
    worker_prefetch_multiplier=1,

    # Task result expiration (24 hours)
    result_expires=86400,
)
