"""管理端认证：用户名密码登录。"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select

from app.api.deps import get_current_admin
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.core.config import get_settings
from app.core.errors import AppError
from app.db.session import AsyncSessionLocal
from app.models.accounts import AdminUser
from app.services.security import create_access_token, create_refresh_token, verify_password

router = APIRouter(prefix="/auth", tags=["admin-auth"])


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(ApiModel):
    accessToken: str
    refreshToken: str
    expiresIn: int


class AdminMeResponse(ApiModel):
    id: str
    username: str


@router.post("/login", response_model=ApiResponse[AdminLoginResponse])
async def login(body: AdminLoginRequest):
    settings = get_settings()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(AdminUser).where(AdminUser.username == body.username))
        admin = result.scalar_one_or_none()
        if (
            admin is None
            or not admin.is_active
            or not verify_password(body.password, admin.hashed_password)
        ):
            raise AppError("AUTH_INVALID_CREDENTIALS", "用户名或密码错误", status_code=401)
        admin_id = str(admin.id)

    data = AdminLoginResponse(
        accessToken=create_access_token(admin_id, "admin", settings),
        refreshToken=create_refresh_token(admin_id, "admin", settings),
        expiresIn=settings.access_token_ttl_minutes * 60,
    )
    return ApiResponse.ok(data)


@router.get("/me", response_model=ApiResponse[AdminMeResponse])
async def me(admin: AdminUser = Depends(get_current_admin)):
    return ApiResponse.ok(AdminMeResponse(id=str(admin.id), username=admin.username))
