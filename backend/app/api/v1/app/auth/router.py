"""小程序认证：wx-login。"""

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select

from app.api.response import ApiResponse
from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.models.accounts import User
from app.services.security import create_access_token, create_refresh_token
from app.services.wechat import code2session

router = APIRouter(prefix="/auth", tags=["app-auth"])


class WxLoginRequest(BaseModel):
    code: str


class WxLoginResponse(BaseModel):
    accessToken: str
    refreshToken: str
    expiresIn: int
    isNewUser: bool


@router.post("/wx-login", response_model=ApiResponse[WxLoginResponse])
async def wx_login(body: WxLoginRequest):
    settings = get_settings()
    session_data = await code2session(body.code)
    openid: str = session_data["openid"]

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.openid == openid))
        user = result.scalar_one_or_none()
        is_new = user is None
        if user is None:
            user = User(openid=openid, nickname=f"畲客{openid[-4:]}", points=0)
            session.add(user)
            await session.commit()
            await session.refresh(user)
        user_id = str(user.id)

    data = WxLoginResponse(
        accessToken=create_access_token(user_id, "app", settings),
        refreshToken=create_refresh_token(user_id, "app", settings),
        expiresIn=settings.access_token_ttl_minutes * 60,
        isNewUser=is_new,
    )
    return ApiResponse.ok(data)
