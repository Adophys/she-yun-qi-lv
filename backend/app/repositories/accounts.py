from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.accounts import AdminUser, User


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_openid(self, openid: str) -> User | None:
        result = await self.session.execute(select(User).where(User.openid == openid))
        return result.scalar_one_or_none()


class AdminUserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_username(self, username: str) -> AdminUser | None:
        result = await self.session.execute(select(AdminUser).where(AdminUser.username == username))
        return result.scalar_one_or_none()
