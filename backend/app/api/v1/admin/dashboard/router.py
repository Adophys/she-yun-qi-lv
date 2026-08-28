"""管理端：数据看板统计（真实查库）。"""

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.db.session import get_db
from app.models.accounts import AdminUser, User
from app.models.cultural import CulturalItem, UserCollection
from app.models.explore import ExploreNode, UserExploreProgress

router = APIRouter()


class DashboardSummary(ApiModel):
    totalUsers: int = 0
    totalItems: int = 0
    totalNodes: int = 0
    totalCollections: int = 0
    todayActiveUsers: int = 0


class ScanTrendPoint(ApiModel):
    date: str = ""
    count: int = 0


class UnlockRankItem(ApiModel):
    id: str = ""
    name: str = ""
    count: int = 0


class UserTrendPoint(ApiModel):
    month: str = ""
    total: int = 0


class CategoryDistItem(ApiModel):
    name: str = ""
    value: int = 0


class DashboardStats(ApiModel):
    totalUsers: int = 0
    todayScans: int = 0
    totalItems: int = 0
    todayActiveUsers: int = 0
    scanTrend: list[ScanTrendPoint] = []
    unlockRank: list[UnlockRankItem] = []
    userTrend: list[UserTrendPoint] = []
    categoryDist: list[CategoryDistItem] = []


@router.get("/summary", response_model=ApiResponse[DashboardSummary])
async def get_summary(
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    total_users = (await session.execute(select(func.count()).select_from(User))).scalar_one()
    total_items = (
        await session.execute(select(func.count()).select_from(CulturalItem))
    ).scalar_one()
    total_nodes = (
        await session.execute(select(func.count()).select_from(ExploreNode))
    ).scalar_one()
    total_collections = (
        await session.execute(select(func.count()).select_from(UserCollection))
    ).scalar_one()

    return ApiResponse.ok(
        DashboardSummary(
            totalUsers=total_users,
            totalItems=total_items,
            totalNodes=total_nodes,
            totalCollections=total_collections,
            todayActiveUsers=0,
        )
    )


@router.get("/stats", response_model=ApiResponse[DashboardStats])
async def get_stats(
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    """看板图表统计：近 7 日扫码趋势 / 解锁 TOP 榜 / 近 12 月用户增长 / 分类占比。"""
    now = datetime.now(UTC).replace(tzinfo=None)
    today = now.date()
    week_ago = today - timedelta(days=6)
    month_ago = today - timedelta(days=365)

    total_users = (await session.execute(select(func.count()).select_from(User))).scalar_one()
    total_items = (
        await session.execute(select(func.count()).select_from(CulturalItem))
    ).scalar_one()

    # 今日扫码/活跃
    today_scans = (
        await session.execute(
            select(func.count())
            .select_from(UserExploreProgress)
            .where(UserExploreProgress.completed_at >= today)
        )
    ).scalar_one()
    today_active = (
        await session.execute(
            select(func.count(func.distinct(UserExploreProgress.user_id))).where(
                UserExploreProgress.completed_at >= today
            )
        )
    ).scalar_one()

    # 近 7 日扫码趋势
    scan_rows = (
        await session.execute(
            select(
                func.to_char(UserExploreProgress.completed_at, "MM-DD").label("d"),
                func.count().label("c"),
            )
            .where(UserExploreProgress.completed_at >= week_ago)
            .group_by("d")
        )
    ).all()
    scan_map = {row.d: row.c for row in scan_rows}
    scan_trend = [
        ScanTrendPoint(
            date=(week_ago + timedelta(days=i)).strftime("%m-%d"),
            count=int(scan_map.get((week_ago + timedelta(days=i)).strftime("%m-%d"), 0)),
        )
        for i in range(7)
    ]

    # 解锁 TOP 榜（按收藏数）
    rank_rows = (
        await session.execute(
            select(
                CulturalItem.id.label("iid"),
                CulturalItem.name.label("n"),
                func.count(UserCollection.id).label("c"),
            )
            .join(UserCollection, UserCollection.cultural_item_id == CulturalItem.id)
            .group_by(CulturalItem.id, CulturalItem.name)
            .order_by(func.count(UserCollection.id).desc())
            .limit(8)
        )
    ).all()
    unlock_rank = [UnlockRankItem(id=row.iid, name=row.n, count=int(row.c)) for row in rank_rows]

    # 近 12 月用户增长
    user_rows = (
        await session.execute(
            select(
                func.to_char(User.created_at, "YYYY-MM").label("m"),
                func.count().label("c"),
            )
            .where(User.created_at >= month_ago)
            .group_by("m")
            .order_by("m")
        )
    ).all()
    user_trend = [UserTrendPoint(month=row.m, total=int(row.c)) for row in user_rows]

    # 分类占比
    cat_rows = (
        await session.execute(
            select(CulturalItem.category, func.count().label("c")).group_by(CulturalItem.category)
        )
    ).all()

    def _category_name(cat: object) -> str:
        return str(cat.value) if hasattr(cat, "value") else str(cat)

    category_dist = [
        CategoryDistItem(name=_category_name(row.category), value=int(row.c)) for row in cat_rows
    ]

    return ApiResponse.ok(
        DashboardStats(
            totalUsers=total_users,
            todayScans=int(today_scans),
            totalItems=total_items,
            todayActiveUsers=int(today_active),
            scanTrend=scan_trend,
            unlockRank=unlock_rank,
            userTrend=user_trend,
            categoryDist=category_dist,
        )
    )
