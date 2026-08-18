from fastapi import APIRouter

from app.api.v1.admin.router import admin_router
from app.api.v1.app.router import app_router

api_v1_router = APIRouter()
api_v1_router.include_router(app_router, prefix="/app")
api_v1_router.include_router(admin_router, prefix="/admin")
