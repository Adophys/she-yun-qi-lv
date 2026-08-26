"""小程序：我的信息。"""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.db.session import get_db
from app.models.accounts import User
from app.models.cultural import UserCollection
from app.models.explore import UserExploreProgress

router = APIRouter(prefix="/users", tags=["app-users"])


class UserMe(ApiModel):
    id: str
    nickname: str | None = None
    avatarUrl: str | None = None
    level: int = 1
    points: int = 0
    discoveredCount: int = 0
    exploreCompleted: int = 0


@router.get("/me", response_model=ApiResponse[UserMe])
async def get_me(
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    discovered = (
        await session.execute(
            select(func.count())
            .select_from(UserCollection)
            .where(UserCollection.user_id == str(user.id))
        )
    ).scalar_one()
    completed = (
        await session.execute(
            select(func.count())
            .select_from(UserExploreProgress)
            .where(
                UserExploreProgress.user_id == str(user.id),
                UserExploreProgress.status == "completed",
            )
        )
    ).scalar_one()

    return ApiResponse.ok(
        UserMe(
            id=str(user.id),
            nickname=user.nickname,
            avatarUrl=user.avatar_url,
            level=user.level,
            points=user.points,
            discoveredCount=discovered,
            exploreCompleted=completed,
        )
    )
