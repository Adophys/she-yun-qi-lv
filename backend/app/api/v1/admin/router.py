from fastapi import APIRouter

from app.api.v1.admin.auth.router import router as auth_router
from app.api.v1.admin.cultural_items.router import router as cultural_items_router
from app.api.v1.admin.dashboard.router import router as dashboard_router
from app.api.v1.admin.explore_nodes.router import router as explore_nodes_router
from app.api.v1.admin.users.router import router as users_router

admin_router = APIRouter()

admin_router.include_router(auth_router)
admin_router.include_router(dashboard_router, prefix="/dashboard")
admin_router.include_router(cultural_items_router)
admin_router.include_router(explore_nodes_router)
admin_router.include_router(users_router)


@admin_router.get("/ping")
async def admin_ping():
    return {"message": "pong from admin api"}
