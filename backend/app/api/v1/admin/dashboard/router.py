"""管理端：数据看板统计（真实查库）。"""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.db.session import get_db
from app.models.accounts import AdminUser, User
from app.models.cultural import CulturalItem, UserCollection
from app.models.explore import ExploreNode

router = APIRouter()


class DashboardSummary(ApiModel):
    totalUsers: int = 0
    totalItems: int = 0
    totalNodes: int = 0
    totalCollections: int = 0
    todayActiveUsers: int = 0


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
