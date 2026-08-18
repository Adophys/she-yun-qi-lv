from fastapi import APIRouter

from app.api.response import ApiResponse
from app.api.schema import ApiModel


class DashboardSummary(ApiModel):
    total_users: int = 0
    total_items: int = 0
    total_nodes: int = 0
    today_active_users: int = 0


dashboard_router = APIRouter()


@dashboard_router.get("/summary", response_model=ApiResponse[DashboardSummary])
async def get_summary():
    return ApiResponse.ok(DashboardSummary())
