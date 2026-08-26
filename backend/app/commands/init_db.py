import asyncio

from sqlalchemy import select

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.db.session import AsyncSessionLocal, verify_db_connection
from app.models.accounts import AdminUser
from app.services.security import hash_password

configure_logging()
logger = get_logger(__name__)


async def init_db() -> None:
    # schema 由 Alembic 管理（uv run alembic upgrade head），此处仅初始化种子数据
    await verify_db_connection()
    settings = get_settings()
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(AdminUser).where(AdminUser.username == settings.initial_admin_username)
        )
        if result.scalar_one_or_none() is None:
            admin = AdminUser(
                username=settings.initial_admin_username,
                hashed_password=hash_password(settings.initial_admin_password),
            )
            session.add(admin)
            await session.commit()
            logger.info("Initial admin user created: %s", settings.initial_admin_username)
        else:
            logger.info("Admin user already exists")


if __name__ == "__main__":
    asyncio.run(init_db())
