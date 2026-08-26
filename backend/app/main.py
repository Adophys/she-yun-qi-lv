from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import health_router
from app.api.v1.router import api_v1_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.core.middleware import RequestContextMiddleware
from app.db.session import verify_db_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    await verify_db_connection()  # schema 由 Alembic 管理，此处仅校验连接
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="畲韵奇旅 API",
        description="大学生创新创业大赛 - 畲族文化数字化体验平台",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.app_env != "production" else [],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(api_v1_router, prefix="/api/v1")

    return app


app = create_app()
