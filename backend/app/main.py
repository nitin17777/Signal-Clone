from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Primary auth router (per api-contract.md spec)
from app.api.auth import router as auth_router

app = FastAPI(
    title="Signal Clone API",
    version="1.0.0",
    description="FastAPI backend for Signal Clone. Auth via httpOnly JWT cookie.",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
