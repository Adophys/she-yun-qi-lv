from fastapi import APIRouter

from app.api.v1.admin.dashboard.router import dashboard_router

admin_router = APIRouter()
admin_router.include_router(dashboard_router, prefix="/dashboard")


@admin_router.get("/ping")
async def admin_ping():
    return {"message": "pong from admin api"}
