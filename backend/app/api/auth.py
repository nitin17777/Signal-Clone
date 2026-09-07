"""
Auth router — spec: docs/api-contract.md

Endpoints (all under prefix /api/v1/auth):
  POST /register       — create account + issue JWT cookie
  POST /request-otp    — mock-send OTP (always "123456" in dev)
  POST /verify-otp     — verify OTP + issue JWT cookie
  POST /login          — password login + issue JWT cookie
  POST /logout         — clear JWT cookie + mark offline
  GET  /me             — return current user profile
"""

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import (
    clear_auth_cookie,
    register_user,
    login_user,
    request_otp,
    verify_otp_and_issue_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Request bodies
# ---------------------------------------------------------------------------

class RequestOtpBody(BaseModel):
    """Phone number to send OTP to."""
    phone_number: str = Field(..., description="E.164 phone number, e.g. +919876543210")


class VerifyOtpBody(BaseModel):
    """OTP verification payload."""
    phone_number: str
    code: str = Field(..., description="6-digit OTP; always '123456' in dev")


class LoginBody(BaseModel):
    """Password login — accepts phone_number OR username."""
    phone_number: str | None = None
    username: str | None = None
    password: str


# ---------------------------------------------------------------------------
# POST /register
# ---------------------------------------------------------------------------
@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register with phone/username + display name. Issues JWT cookie.",
)
async def register(
    body: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    return await register_user(db, response, body)


# ---------------------------------------------------------------------------
# POST /request-otp
# ---------------------------------------------------------------------------
@router.post(
    "/request-otp",
    summary="Send a mocked OTP to the given phone number (always '123456' in dev)",
)
async def request_otp_route(body: RequestOtpBody) -> dict:
    code = request_otp(body.phone_number)
    return {"detail": "OTP sent.", "dev_only_code": code}


# ---------------------------------------------------------------------------
# POST /verify-otp
# ---------------------------------------------------------------------------
@router.post(
    "/verify-otp",
    response_model=UserRead,
    summary="Verify OTP; issues JWT cookie on success.",
)
async def verify_otp_route(
    body: VerifyOtpBody,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    return await verify_otp_and_issue_token(
        db,
        response,
        phone_number=body.phone_number,
        code=body.code,
    )


# ---------------------------------------------------------------------------
# POST /login
# ---------------------------------------------------------------------------
@router.post(
    "/login",
    response_model=UserRead,
    summary="Log in with password (phone_number or username). Issues JWT cookie.",
)
async def login(
    body: LoginBody,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    return await login_user(
        db,
        response,
        phone_number=body.phone_number,
        username=body.username,
        password=body.password,
    )


# ---------------------------------------------------------------------------
# POST /logout
# ---------------------------------------------------------------------------
@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Clear the JWT cookie and mark the user offline.",
)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    current_user.is_online = False
    await db.commit()
    clear_auth_cookie(response)


# ---------------------------------------------------------------------------
# GET /me
# ---------------------------------------------------------------------------
@router.get(
    "/me",
    response_model=UserRead,
    summary="Return the currently authenticated user's profile.",
)
async def me(
    current_user: User = Depends(get_current_user),
) -> UserRead:
    return UserRead.model_validate(current_user)
