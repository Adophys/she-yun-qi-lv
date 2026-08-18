import asyncio

from sqlalchemy import select

from app.core.logging import configure_logging, get_logger
from app.db.session import AsyncSessionLocal
from app.domain.cultural import CulturalCategory, Rarity
from app.models.cultural import CulturalItem

configure_logging()
logger = get_logger(__name__)


async def seed_demo_data() -> None:
    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(CulturalItem).limit(1))
        if existing.scalar_one_or_none():
            logger.info("Demo data already seeded")
            return

        items = [
            CulturalItem(
                name="凤凰装",
                pinyin="Feng Huang Zhuang",
                category=CulturalCategory.CLOTHING,
                rarity=Rarity.LEGENDARY,
                origin="景宁",
                material="棉麻、丝线",
                symbolism="吉祥如意、凤凰来仪",
                description="畲族传统盛装，衣襟、领口与袖口均绣有华美凤凰织锦与云水纹。",
                image_url="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400",
            ),
            CulturalItem(
                name="花斗笠",
                pinyin="Hua Dou Li",
                category=CulturalCategory.CLOTHING,
                rarity=Rarity.RARE,
                origin="福建宁德",
                material="竹篾、彩纸",
                symbolism="遮阳避雨、生活智慧",
                description="畲族传统雨具，以竹篾为骨，外糊彩纸，轻巧美观。",
                image_url="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
            ),
        ]
        session.add_all(items)
        await session.commit()
        logger.info("Demo cultural items seeded")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
