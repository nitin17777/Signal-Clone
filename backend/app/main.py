import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.conversations import router as conversations_router
from app.api.messages import router as messages_router
from app.api.users import router as users_router
from app.ws.router import router as ws_router
from app.core.config import settings

logger = logging.getLogger(__name__)


def _run_migrations() -> None:
    """Run alembic upgrade head synchronously at startup."""
    import subprocess
    import sys
    from pathlib import Path

    backend_root = Path(__file__).resolve().parents[1]
    try:
        logger.info("Running alembic upgrade head...")
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=str(backend_root),
            capture_output=True,
            text=True,
        )
        if result.stdout:
            logger.info(result.stdout)
        if result.returncode != 0:
            logger.error("alembic upgrade head failed:\n%s", result.stderr)
        else:
            logger.info("DB migrations applied successfully.")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Could not run migrations: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _run_migrations()
    yield


app = FastAPI(
    title="Signal Clone API",
    version="1.0.0",
    description="FastAPI backend for Signal Clone. Auth via httpOnly JWT cookie.",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https:\/\/.*\.vercel\.app" if settings.ENVIRONMENT.lower() == "production" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(conversations_router, prefix="/api/v1")
app.include_router(messages_router, prefix="/api/v1")
app.include_router(ws_router)  # WS /ws?token=<jwt>  (no prefix)


# ---------------------------------------------------------------------------
# Health & Root
# ---------------------------------------------------------------------------
@app.get("/", tags=["root"])
async def root():
    return {
        "status": "online",
        "message": "Signal Clone Backend API is running successfully!",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}

