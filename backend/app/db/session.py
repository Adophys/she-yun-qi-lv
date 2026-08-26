from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.db.base import Base
from app.db.model_registry import import_all_models

settings = get_settings()
engine = create_async_engine(settings.database_url, echo=settings.app_env == "local")
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def verify_db_connection() -> None:
    """校验数据库可达（schema 由 Alembic 管理，启动不再自动 create_all）。"""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(
            "数据库连接失败，请确认："
            "1) 数据库已启动（docker compose up -d）；"
            "2) 已应用迁移（cd backend && uv run alembic upgrade head）"
        ) from exc


async def create_tables() -> None:
    import_all_models()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_tables() -> None:
    import_all_models()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
