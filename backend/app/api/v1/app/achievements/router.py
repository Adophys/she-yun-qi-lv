"""小程序：成就（全部成就 + 我的解锁状态）。"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.db.session import get_db
from app.models.accounts import User
from app.models.achievements import Achievement, UserAchievement

router = APIRouter(prefix="/achievements", tags=["app-achievements"])


class AchievementOut(ApiModel):
    id: str
    name: str
    description: str | None = None
    iconUrl: str | None = None
    unlockCondition: str | None = None
    unlocked: bool = False
    unlockedAt: str | None = None


@router.get("", response_model=ApiResponse[list[AchievementOut]])
async def list_achievements(
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    achievements = (
        (await session.execute(select(Achievement).order_by(Achievement.created_at)))
        .scalars()
        .all()
    )
    mine = {
        str(ua.achievement_id): ua
        for ua in (
            await session.execute(
                select(UserAchievement).where(UserAchievement.user_id == str(user.id))
            )
        )
        .scalars()
        .all()
    }
    out: list[AchievementOut] = []
    for a in achievements:
        ua = mine.get(str(a.id))
        out.append(
            AchievementOut(
                id=str(a.id),
                name=a.name,
                description=a.description,
                iconUrl=a.icon_url,
                unlockCondition=a.unlock_condition,
                unlocked=ua is not None,
                unlockedAt=ua.created_at.isoformat() if ua and ua.created_at else None,
            )
        )
    return ApiResponse.ok(out)
