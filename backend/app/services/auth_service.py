"""
Auth service — business logic layer separating DB operations from route handlers.

Responsibilities:
  - lookup / create users
  - OTP generation & validation (mocked: always "123456" in dev)
  - password verification
  - token issuance via security helpers
"""

from datetime import timedelta

from fastapi import HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

# ---------------------------------------------------------------------------
# Cookie constants (shared with the router)
# ---------------------------------------------------------------------------
COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = settings.JWT_EXPIRE_MINUTES * 60  # seconds

# ---------------------------------------------------------------------------
# OTP store: phone_number -> code
# In production replace this with Redis / a DB table.
# ---------------------------------------------------------------------------
_OTP_STORE: dict[str, str] = {}

# The only valid OTP code in dev/mock mode.
MOCK_OTP = "123456"


# ---------------------------------------------------------------------------
# Cookie helper
# ---------------------------------------------------------------------------
def set_auth_cookie(response: Response, token: str) -> None:
    """Write the JWT into an httpOnly cookie."""
    is_prod = settings.ENVIRONMENT.lower() == "production"
    is_secure = settings.COOKIE_SECURE if settings.COOKIE_SECURE is not None else is_prod
    samesite_val = settings.COOKIE_SAMESITE if settings.COOKIE_SAMESITE is not None else ("none" if is_prod else "lax")
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=is_secure,
        samesite=samesite_val,
        max_age=COOKIE_MAX_AGE,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    """Delete the auth cookie."""
    is_prod = settings.ENVIRONMENT.lower() == "production"
    is_secure = settings.COOKIE_SECURE if settings.COOKIE_SECURE is not None else is_prod
    samesite_val = settings.COOKIE_SAMESITE if settings.COOKIE_SAMESITE is not None else ("none" if is_prod else "lax")
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        secure=is_secure,
        samesite=samesite_val,
    )


# ---------------------------------------------------------------------------
# OTP helpers
# ---------------------------------------------------------------------------
def request_otp(phone_number: str) -> str:
    """
    'Send' an OTP to the given phone number.

    In dev this is mocked: the code is always MOCK_OTP and we just store it
    in-memory.  Returns the code (so callers can log it during testing).
    """
    _OTP_STORE[phone_number] = MOCK_OTP
    return MOCK_OTP


def validate_otp(phone_number: str, code: str) -> bool:
    """
    Return True if *code* matches the stored OTP for *phone_number*.
    Consumes the OTP on success (one-time use).
    """
    stored = _OTP_STORE.get(phone_number)
    if stored and stored == code:
        del _OTP_STORE[phone_number]
        return True
    return False


# ---------------------------------------------------------------------------
# User helpers
# ---------------------------------------------------------------------------
async def get_user_by_phone(db: AsyncSession, phone_number: str) -> User | None:
    result = await db.execute(select(User).where(User.phone_number == phone_number))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# Service actions
# ---------------------------------------------------------------------------
async def register_user(
    db: AsyncSession,
    response: Response,
    body: UserCreate,
) -> UserRead:
    """
    Create a new user, issue a JWT cookie, return UserRead.

    Raises 409 on duplicate phone_number or username.
    """
    if body.phone_number and await get_user_by_phone(db, body.phone_number):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already registered.",
        )
    if body.username and await get_user_by_username(db, body.username):
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
    set_auth_cookie(response, token)
    return UserRead.model_validate(user)


async def login_user(
    db: AsyncSession,
    response: Response,
    *,
    phone_number: str | None = None,
    username: str | None = None,
    password: str,
) -> UserRead:
    """
    Authenticate with password, issue JWT cookie, return UserRead.

    Raises 401 on bad credentials, 422 if neither identifier is provided.
    """
    if phone_number:
        user = await get_user_by_phone(db, phone_number)
    elif username:
        user = await get_user_by_username(db, username)
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
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    user.is_online = True
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id)
    set_auth_cookie(response, token)
    return UserRead.model_validate(user)


async def verify_otp_and_issue_token(
    db: AsyncSession,
    response: Response,
    *,
    phone_number: str,
    code: str,
) -> UserRead:
    """
    Validate OTP for *phone_number*, issue JWT cookie, return UserRead.

    Raises 400 if OTP is wrong, 404 if the user doesn't exist yet.
    """
    if not validate_otp(phone_number, code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    user = await get_user_by_phone(db, phone_number)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Register first.",
        )

    user.is_online = True
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id)
    set_auth_cookie(response, token)
    return UserRead.model_validate(user)
