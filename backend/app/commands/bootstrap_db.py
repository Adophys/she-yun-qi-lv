import asyncio
import os

from app.commands.init_db import init_db
from app.commands.seed_demo_data import seed_demo_data
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)


async def bootstrap() -> None:
    await init_db()
    if os.getenv("SEED_DEMO_DATA", "true").lower() == "true":
        await seed_demo_data()
    logger.info("Database bootstrap complete")


if __name__ == "__main__":
    asyncio.run(bootstrap())
