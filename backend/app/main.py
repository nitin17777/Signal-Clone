from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.conversations import router as conversations_router
from app.api.messages import router as messages_router
from app.api.users import router as users_router
from app.ws.router import router as ws_router

app = FastAPI(
    title="Signal Clone API",
    version="1.0.0",
    description="FastAPI backend for Signal Clone. Auth via httpOnly JWT cookie.",
)

from app.core.config import settings

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
# Health
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
