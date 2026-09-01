"""
Configuration module — loads all settings from environment variables.

Uses pydantic-settings for type-safe, validated configuration with
automatic .env file loading.
"""

from __future__ import annotations

import json
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── MongoDB Atlas ──
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "omniparse"

    # ── Redis ──
    redis_url: str = "redis://localhost:6379/0"

    # ── Gemini API (LLM generation only) ──
    gemini_api_key: str = ""

    # ── File Storage ──
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 50

    # ── Embedding Model ──
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimensions: int = 384

    # ── FastAPI ──
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = '["http://localhost:5173","http://localhost:3000"]'

    # ── JWT Auth ──
    jwt_secret_key: str = "your-super-secret-jwt-key-replace-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080 # 7 days

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @property
    def upload_path(self) -> Path:
        path = Path(self.upload_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse CORS origins from JSON string or comma-separated values."""
        try:
            return json.loads(self.cors_origins)
        except (json.JSONDecodeError, TypeError):
            return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


# Singleton — imported throughout the app
settings = Settings()
