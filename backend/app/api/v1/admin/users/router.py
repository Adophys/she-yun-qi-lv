"""管理端：用户列表。"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.db.session import get_db
from app.models.accounts import AdminUser, User

router = APIRouter(prefix="/users", tags=["admin-users"])


class UserOut(ApiModel):
    id: str
    openid: str | None = None
    nickname: str | None = None
    avatarUrl: str | None = None
    level: int = 1
    points: int = 0
    createdAt: str | None = None


class UserPage(ApiModel):
    items: list[UserOut]
    total: int
    page: int
    pageSize: int


@router.get("", response_model=ApiResponse[UserPage])
async def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    keyword: str | None = Query(default=None),
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    stmt = select(User)
    count_stmt = select(func.count()).select_from(User)
    if keyword:
        like = f"%{keyword}%"
        stmt = stmt.where(User.nickname.like(like) | User.openid.like(like))
        count_stmt = count_stmt.where(User.nickname.like(like) | User.openid.like(like))

    total = (await session.execute(count_stmt)).scalar_one()
    rows = (
        (
            await session.execute(
                stmt.order_by(User.created_at.desc())
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
        )
        .scalars()
        .all()
    )

    return ApiResponse.ok(
        UserPage(
            items=[
                UserOut(
                    id=str(u.id),
                    openid=u.openid,
                    nickname=u.nickname,
                    avatarUrl=u.avatar_url,
                    level=u.level,
                    points=u.points,
                    createdAt=u.created_at.isoformat() if u.created_at else None,
                )
                for u in rows
            ],
            total=total,
            page=page,
            pageSize=page_size,
        )
    )
