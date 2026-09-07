"""
Authentication routes.

POST /api/v1/auth/register  — create a new account
POST /api/v1/auth/login     — exchange credentials for a JWT cookie
POST /api/v1/auth/logout    — clear the JWT cookie
GET  /api/v1/auth/me        — return the authenticated user's profile
"""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------------------------------------------------------
# Cookie configuration
# ---------------------------------------------------------------------------
COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = settings.JWT_EXPIRE_MINUTES * 60  # seconds


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,       # flip to True in production (HTTPS)
        samesite="lax",
        max_age=COOKIE_MAX_AGE,
        path="/",
    )


# ---------------------------------------------------------------------------
# Request body for login
# ---------------------------------------------------------------------------
class LoginBody(BaseModel):
    """Accepts phone_number OR username plus a plain-text password."""
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
    summary="Register a new user account",
)
async def register(
    body: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    # Reject duplicate phone_number
    if body.phone_number:
        row = await db.execute(
            select(User).where(User.phone_number == body.phone_number)
        )
        if row.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Phone number already registered.",
            )

    # Reject duplicate username
    if body.username:
        row = await db.execute(
            select(User).where(User.username == body.username)
        )
        if row.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken.",
            )

    user = User(
        phone_number=body.phone_number,
        username=body.username,
        display_name=body.display_name,
        avatar_url=body.avatar_url,
        status_message=body.status_message,
        password_hash=hash_password(body.password),
        is_online=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    )
    _set_auth_cookie(response, token)
    return UserRead.model_validate(user)


# ---------------------------------------------------------------------------
# POST /login
# ---------------------------------------------------------------------------
@router.post(
    "/login",
    response_model=UserRead,
    summary="Log in and receive an httpOnly JWT cookie",
)
async def login(
    body: LoginBody,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    # Resolve user by phone_number or username
    if body.phone_number:
        result = await db.execute(
            select(User).where(User.phone_number == body.phone_number)
        )
        user = result.scalar_one_or_none()
    elif body.username:
        result = await db.execute(
            select(User).where(User.username == body.username)
        )
        user = result.scalar_one_or_none()
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide phone_number or username.",
        )

    if user is None or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    # Mark online
    user.is_online = True
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id)
    _set_auth_cookie(response, token)
    return UserRead.model_validate(user)


# ---------------------------------------------------------------------------
# POST /logout
# ---------------------------------------------------------------------------
@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Clear the JWT cookie (log out)",
)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    current_user.is_online = False
    await db.commit()
    response.delete_cookie(key=COOKIE_NAME, path="/")


# ---------------------------------------------------------------------------
# GET /me
# ---------------------------------------------------------------------------
@router.get(
    "/me",
    response_model=UserRead,
    summary="Return the currently authenticated user's profile",
)
async def me(
    current_user: User = Depends(get_current_user),
) -> UserRead:
    return UserRead.model_validate(current_user)
