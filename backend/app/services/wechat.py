"""微信开放能力集成：code2session（含本地 mock 模式）。"""

from typing import Any

import httpx

from app.core.config import get_settings
from app.core.errors import AppError


async def code2session(code: str) -> dict[str, Any]:
    """用 wx.login 的 code 换取 openid/session_key。

    未配置 WECHAT_APPID/WECHAT_SECRET 时进入 mock 模式：
    - 任意 code 都能换取一个稳定 openid（`mock_<code>`），方便本地联调；
    - 同一 code 每次返回同一 openid，保证登录幂等。
    """
    settings = get_settings()
    if not settings.wechat_app_id or not settings.wechat_secret:
        return {"openid": f"mock_{code}", "session_key": "mock_session", "mock": True}

    params = {
        "appid": settings.wechat_app_id,
        "secret": settings.wechat_secret,
        "js_code": code,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get("https://api.weixin.qq.com/sns/jscode2session", params=params)
        data: dict[str, Any] = resp.json()

    if "openid" not in data:
        raise AppError(
            "WX_LOGIN_FAILED",
            f"微信登录失败: {data.get('errmsg', 'unknown error')}",
            status_code=400,
        )
    return data
