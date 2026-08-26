"""FastAPI 认证依赖：小程序用户 / 管理端管理员。"""

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db
from app.models.accounts import AdminUser, User

_bearer = HTTPBearer(auto_error=False)


def _decode_token(
    credentials: HTTPAuthorizationCredentials | None, secret: str, audience: str
) -> str:
    if credentials is None:
        raise HTTPException(status_code=401, detail="未提供登录凭证")
    try:
        payload = jwt.decode(
            credentials.credentials,
            secret,
            algorithms=["HS256"],
            audience=audience,
        )
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=401, detail="登录已过期，请重新登录") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="登录凭证无效") from exc
    return str(payload["sub"])


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    session: AsyncSession = Depends(get_db),
) -> User:
    settings = get_settings()
    user_id = _decode_token(credentials, settings.app_jwt_secret, settings.app_jwt_audience)
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    session: AsyncSession = Depends(get_db),
) -> User | None:
    """可选登录：未带 token 或 token 无效时返回 None（浏览类接口用）。"""
    if credentials is None:
        return None
    settings = get_settings()
    try:
        user_id = _decode_token(credentials, settings.app_jwt_secret, settings.app_jwt_audience)
    except HTTPException:
        return None
    return await session.get(User, user_id)


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    session: AsyncSession = Depends(get_db),
) -> AdminUser:
    settings = get_settings()
    admin_id = _decode_token(credentials, settings.admin_jwt_secret, settings.admin_jwt_audience)
    admin = await session.get(AdminUser, admin_id)
    if admin is None or not admin.is_active:
        raise HTTPException(status_code=401, detail="管理员不存在或已禁用")
    return admin
