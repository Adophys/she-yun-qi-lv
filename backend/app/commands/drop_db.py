import asyncio

from app.core.logging import configure_logging, get_logger
from app.db.session import drop_tables

configure_logging()
logger = get_logger(__name__)


async def drop_db() -> None:
    await drop_tables()
    logger.info("All tables dropped")


if __name__ == "__main__":
    asyncio.run(drop_db())
