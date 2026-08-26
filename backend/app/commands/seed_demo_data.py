"""Demo 种子数据（幂等）：章节 / 点位 / 图鉴 / 衣橱 / 成就。"""

import asyncio

from sqlalchemy import select

from app.core.logging import configure_logging, get_logger
from app.db.session import AsyncSessionLocal
from app.domain.cultural import CulturalCategory, Rarity
from app.domain.wardrobe import WardrobeCategory
from app.models.achievements import Achievement
from app.models.cultural import CulturalItem
from app.models.explore import Chapter, ExploreNode
from app.models.wardrobe import WardrobeItem

configure_logging()
logger = get_logger(__name__)

CULTURAL_ITEMS = [
    {
        "name": "凤凰装",
        "pinyin": "Feng Huang Zhuang",
        "category": CulturalCategory.CLOTHING,
        "rarity": Rarity.LEGENDARY,
        "origin": "景宁",
        "material": "棉麻、丝线",
        "symbolism": "吉祥如意、凤凰来仪",
        "description": "畲族传统盛装，衣襟、领口与袖口均绣有华美凤凰织锦与云水纹。",
        "image_url": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400",
    },
    {
        "name": "花斗笠",
        "pinyin": "Hua Dou Li",
        "category": CulturalCategory.CLOTHING,
        "rarity": Rarity.RARE,
        "origin": "福建宁德",
        "material": "竹篾、彩纸",
        "symbolism": "遮阳避雨、生活智慧",
        "description": "畲族传统雨具，以竹篾为骨，外糊彩纸，轻巧美观。",
        "image_url": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
    },
    {
        "name": "彩带编织",
        "pinyin": "Cai Dai Bian Zhi",
        "category": CulturalCategory.CRAFT,
        "rarity": Rarity.COMMON,
        "origin": "景宁",
        "material": "丝线、棉线",
        "symbolism": "多彩生活、传承技艺",
        "description": "畲族妇女以五彩丝线编织腰带，图案取材于自然与传说。",
        "image_url": "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400",
    },
    {
        "name": "乌米饭",
        "pinyin": "Wu Mi Fan",
        "category": CulturalCategory.CUISINE,
        "rarity": Rarity.RARE,
        "origin": "闽东",
        "material": "糯米、乌稔叶汁",
        "symbolism": "三月三节庆美食",
        "description": "用乌稔树叶汁浸泡糯米蒸制，清香四溢，是畲族三月三的节庆主食。",
        "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    },
    {
        "name": "盘歌",
        "pinyin": "Pan Ge",
        "category": CulturalCategory.MUSIC,
        "rarity": Rarity.LEGENDARY,
        "origin": "浙南",
        "material": "—",
        "symbolism": "以歌传情、以歌会友",
        "description": "畲族山歌的代表形式，一问一答即兴对唱，是婚恋与节庆的重要载体。",
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    },
    {
        "name": "凤尾纹",
        "pinyin": "Feng Wei Wen",
        "category": CulturalCategory.PATTERN,
        "rarity": Rarity.COMMON,
        "origin": "闽浙赣",
        "material": "刺绣、印染",
        "symbolism": "凤凰图腾、族源记忆",
        "description": "畲族服饰上常见的凤凰尾羽纹样，寄托族人对祖先与美好生活的向往。",
        "image_url": "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400",
    },
]

CHAPTERS = [
    {"name": "衣冠风华", "description": "从凤凰装到花斗笠，走进畲族服饰之美。", "sort_order": 1},
    {"name": "山野风味", "description": "乌米饭、畲家茶，品味山间的烟火气。", "sort_order": 2},
    {"name": "歌舞传情", "description": "盘歌、凤尾纹，听见与看见畲族的故事。", "sort_order": 3},
]

EXPLORE_NODES = [
    {
        "name": "景宁畲族博物馆·凤凰装展区",
        "location": "景宁",
        "description": "扫描展签二维码，解锁凤凰装卡片。",
        "code": "SJZ001",
    },
    {
        "name": "惠明茶田·非遗工坊",
        "location": "景宁",
        "description": "茶田间的扫码点，解锁乌米饭卡片。",
        "code": "SJZ002",
    },
    {
        "name": "三月三歌会·对歌台",
        "location": "闽东",
        "description": "歌会现场扫码，解锁盘歌卡片。",
        "code": "SJZ003",
    },
]

WARDROBE_ITEMS = [
    {
        "name": "凤凰绣衣",
        "category": WardrobeCategory.CLOTHES,
        "rarity": Rarity.LEGENDARY,
        "description": "集齐碎片合成的凤凰绣衣。",
        "total_fragments": 5,
        "sort_order": 1,
    },
    {
        "name": "银凤头饰",
        "category": WardrobeCategory.HEADWEAR,
        "rarity": Rarity.RARE,
        "description": "集齐碎片合成的银凤头饰。",
        "total_fragments": 8,
        "sort_order": 2,
    },
    {
        "name": "彩带腰带",
        "category": WardrobeCategory.ACCESSORIES,
        "rarity": Rarity.COMMON,
        "description": "集齐碎片合成的彩带腰带。",
        "total_fragments": 3,
        "sort_order": 3,
    },
]

ACHIEVEMENTS = [
    {
        "name": "初识畲乡",
        "description": "解锁第一张文化卡片。",
        "unlock_condition": "解锁 1 张图鉴",
    },
    {"name": "图鉴收藏家", "description": "解锁全部文化卡片。", "unlock_condition": "解锁全部图鉴"},
    {"name": "探索达人", "description": "完成 3 个探索节点。", "unlock_condition": "完成 3 个点位"},
    {
        "name": "衣橱主人",
        "description": "合成第一件衣橱道具。",
        "unlock_condition": "合成 1 件道具",
    },
]


async def seed_demo_data() -> None:
    async with AsyncSessionLocal() as session:
        # 图鉴（按名称幂等）
        existing_names = set((await session.execute(select(CulturalItem.name))).scalars().all())
        new_items = []
        for item in CULTURAL_ITEMS:
            if item["name"] not in existing_names:
                new_items.append(CulturalItem(**item))
        if new_items:
            session.add_all(new_items)
            await session.flush()
            logger.info("Seeded %d cultural items", len(new_items))

        # 章节
        existing_chapters = set((await session.execute(select(Chapter.name))).scalars().all())
        for ch in CHAPTERS:
            if ch["name"] not in existing_chapters:
                session.add(Chapter(**ch))
        await session.flush()

        # 点位（按 code 幂等），绑定卡片
        chapters = (await session.execute(select(Chapter))).scalars().all()
        chapter_by_name = {c.name: c for c in chapters}
        items_by_name = {
            i.name: i for i in (await session.execute(select(CulturalItem))).scalars().all()
        }
        existing_codes = set((await session.execute(select(ExploreNode.code))).scalars().all())
        node_bindings = [  # (node, chapter_name, cultural_item_name)
            (EXPLORE_NODES[0], "衣冠风华", "凤凰装"),
            (EXPLORE_NODES[1], "山野风味", "乌米饭"),
            (EXPLORE_NODES[2], "歌舞传情", "盘歌"),
        ]
        for idx, (node_data, chapter_name, item_name) in enumerate(node_bindings, start=1):
            if node_data["code"] in existing_codes:
                continue
            chapter = chapter_by_name.get(chapter_name)
            cultural_item = items_by_name.get(item_name)
            if chapter is None:
                continue
            session.add(
                ExploreNode(
                    **node_data,
                    chapter_id=str(chapter.id),
                    cultural_item_id=str(cultural_item.id) if cultural_item else None,
                    sort_order=idx,
                )
            )
        await session.flush()

        # 衣橱
        existing_wardrobe = set((await session.execute(select(WardrobeItem.name))).scalars().all())
        for w in WARDROBE_ITEMS:
            if w["name"] not in existing_wardrobe:
                session.add(WardrobeItem(**w))
        await session.flush()

        # 成就
        existing_ach = set((await session.execute(select(Achievement.name))).scalars().all())
        for a in ACHIEVEMENTS:
            if a["name"] not in existing_ach:
                session.add(Achievement(**a))

        await session.commit()
        logger.info("Demo data seeded (idempotent)")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
