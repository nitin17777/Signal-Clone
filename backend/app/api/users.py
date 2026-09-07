"""
Users router — spec: docs/api-contract.md

Endpoints (prefix /api/v1/users):
  GET   /search?q=   — Search users by phone/username/display name
  PATCH /me          — Update display name, avatar, status
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/search", response_model=list[UserRead], summary="Search users by phone/username/display_name")
async def search_users(
    q: str = Query("", description="Search term"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[UserRead]:
    stmt = select(User).where(User.id != current_user.id)
    if q.strip():
        term = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                User.username.ilike(term),
                User.phone_number.ilike(term),
                User.display_name.ilike(term),
            )
        )
    stmt = stmt.limit(50)
    result = await db.execute(stmt)
    users = result.scalars().all()
    return [UserRead.model_validate(u) for u in users]


@router.patch("/me", response_model=UserRead, summary="Update current user profile")
async def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    if body.display_name is not None:
        current_user.display_name = body.display_name.strip()
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    if body.status_message is not None:
        current_user.status_message = body.status_message
    if body.username is not None:
        current_user.username = body.username.strip()

    await db.commit()
    await db.refresh(current_user)
    return UserRead.model_validate(current_user)
