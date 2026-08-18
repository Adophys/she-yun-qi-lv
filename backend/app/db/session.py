from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.db.base import Base
from app.db.model_registry import import_all_models

settings = get_settings()
engine = create_async_engine(settings.database_url, echo=settings.app_env == "local")
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


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
