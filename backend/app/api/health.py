from fastapi import APIRouter, status

from app.api.response import ApiResponse

health_router = APIRouter(tags=["health"])


@health_router.get("/health/live", status_code=status.HTTP_200_OK)
async def health_live():
    return ApiResponse.ok({"status": "alive"})


@health_router.get("/health/ready", status_code=status.HTTP_200_OK)
async def health_ready():
    return ApiResponse.ok({"status": "ready"})
