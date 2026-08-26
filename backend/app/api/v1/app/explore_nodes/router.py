"""小程序：探索节点（列表 / 详情 / 完成）。"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.core.errors import AppError
from app.db.session import get_db
from app.domain.explore import NodeStatus
from app.models.accounts import User
from app.models.explore import Chapter, ExploreNode, UserExploreProgress

router = APIRouter(prefix="/explore-nodes", tags=["app-explore-nodes"])

COMPLETE_POINTS = 20  # 完成节点奖励积分


class ExploreNodeOut(ApiModel):
    id: str
    chapterId: str
    chapterName: str | None = None
    name: str
    location: str | None = None
    description: str | None = None
    previewImageUrl: str | None = None
    sortOrder: int = 0
    puzzleImageUrl: str | None = None
    puzzlePieces: int = 9
    status: str = "locked"


class CompleteResult(ApiModel):
    gainedPoints: int = 0
    gainedFragment: str | None = None


@router.get("", response_model=ApiResponse[list[ExploreNodeOut]])
async def list_nodes(
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    nodes = (
        (await session.execute(select(ExploreNode).order_by(ExploreNode.sort_order)))
        .scalars()
        .all()
    )
    chapters = {str(c.id): c.name for c in (await session.execute(select(Chapter))).scalars().all()}
    progress = {
        str(p.node_id): p
        for p in (
            await session.execute(
                select(UserExploreProgress).where(UserExploreProgress.user_id == str(user.id))
            )
        )
        .scalars()
        .all()
    }

    out: list[ExploreNodeOut] = []
    for n in nodes:
        p = progress.get(str(n.id))
        if p is not None:
            status = "completed" if p.status == NodeStatus.COMPLETED else "active"
        else:
            status = "locked"
        out.append(
            ExploreNodeOut(
                id=str(n.id),
                chapterId=n.chapter_id,
                chapterName=chapters.get(n.chapter_id),
                name=n.name,
                location=n.location,
                description=n.description,
                previewImageUrl=n.preview_image_url,
                sortOrder=n.sort_order,
                puzzleImageUrl=n.puzzle_image_url,
                puzzlePieces=n.puzzle_pieces,
                status=status,
            )
        )
    return ApiResponse.ok(out)


@router.get("/{node_id}", response_model=ApiResponse[ExploreNodeOut])
async def get_node(
    node_id: str,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    node = await session.get(ExploreNode, node_id)
    if node is None:
        raise AppError("EXPLORE_NODE_NOT_FOUND", "节点不存在", status_code=404)
    chapter = await session.get(Chapter, node.chapter_id)
    p = await session.execute(
        select(UserExploreProgress).where(
            UserExploreProgress.user_id == str(user.id),
            UserExploreProgress.node_id == node_id,
        )
    )
    progress = p.scalar_one_or_none()
    status = (
        "completed"
        if progress and progress.status == NodeStatus.COMPLETED
        else "active"
        if progress
        else "locked"
    )
    return ApiResponse.ok(
        ExploreNodeOut(
            id=str(node.id),
            chapterId=node.chapter_id,
            chapterName=chapter.name if chapter else None,
            name=node.name,
            location=node.location,
            description=node.description,
            previewImageUrl=node.preview_image_url,
            sortOrder=node.sort_order,
            puzzleImageUrl=node.puzzle_image_url,
            puzzlePieces=node.puzzle_pieces,
            status=status,
        )
    )


@router.post("/{node_id}/complete", response_model=ApiResponse[CompleteResult])
async def complete_node(
    node_id: str,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    node = await session.get(ExploreNode, node_id)
    if node is None:
        raise AppError("EXPLORE_NODE_NOT_FOUND", "节点不存在", status_code=404)

    p = await session.execute(
        select(UserExploreProgress).where(
            UserExploreProgress.user_id == str(user.id),
            UserExploreProgress.node_id == node_id,
        )
    )
    progress = p.scalar_one_or_none()
    if progress is None:
        progress = UserExploreProgress(
            user_id=str(user.id),
            node_id=node_id,
            status=NodeStatus.ACTIVE,
        )
        session.add(progress)

    gained_points = 0
    if progress.status != NodeStatus.COMPLETED:
        progress.status = NodeStatus.COMPLETED
        from datetime import UTC, datetime

        progress.completed_at = datetime.now(UTC).replace(tzinfo=None)  # PG timestamp 为 naive
        user.points = (user.points or 0) + COMPLETE_POINTS
        gained_points = COMPLETE_POINTS

    await session.commit()
    return ApiResponse.ok(CompleteResult(gainedPoints=gained_points))
