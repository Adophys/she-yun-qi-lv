"""小程序：首页聚合（用户 + 今日任务 + 章节进度 简化版）。"""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.db.session import get_db
from app.models.accounts import User
from app.models.cultural import UserCollection
from app.models.explore import Chapter, ExploreNode, UserExploreProgress

router = APIRouter(prefix="/home", tags=["app-home"])


class ChapterProgress(ApiModel):
    chapterId: str
    chapterName: str
    totalNodes: int = 0
    completedNodes: int = 0


class HomeSummary(ApiModel):
    user: dict[str, Any]
    dailyTask: dict[str, Any]
    chapterProgress: list[ChapterProgress]


@router.get("/summary", response_model=ApiResponse[HomeSummary])
async def home_summary(
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

    # 章节进度（简化：每章按进度记录数统计）
    chapters = (await session.execute(select(Chapter).order_by(Chapter.sort_order))).scalars().all()
    user_progress = (
        (
            await session.execute(
                select(UserExploreProgress).where(UserExploreProgress.user_id == str(user.id))
            )
        )
        .scalars()
        .all()
    )
    progresses: list[ChapterProgress] = []
    for ch in chapters:
        nodes = (
            (await session.execute(select(ExploreNode).where(ExploreNode.chapter_id == str(ch.id))))
            .scalars()
            .all()
        )
        node_ids = {str(n.id) for n in nodes}
        completed = sum(
            1 for r in user_progress if str(r.node_id) in node_ids and r.status == "completed"
        )
        progresses.append(
            ChapterProgress(
                chapterId=str(ch.id),
                chapterName=ch.name,
                totalNodes=len(nodes),
                completedNodes=completed,
            )
        )

    return ApiResponse.ok(
        HomeSummary(
            user={
                "id": str(user.id),
                "nickname": user.nickname,
                "avatarUrl": user.avatar_url,
                "level": user.level,
                "points": user.points,
            },
            dailyTask={
                "title": "扫码探索",
                "description": "扫描线下二维码解锁畲族文化卡片",
                "doneToday": discovered > 0,
                "progress": discovered,
            },
            chapterProgress=progresses,
        )
    )
