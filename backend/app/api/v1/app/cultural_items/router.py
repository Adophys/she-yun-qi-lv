"""文化图鉴：列表 + 详情（小程序端）。"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_optional_user
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.core.errors import AppError
from app.db.session import get_db
from app.domain.cultural import CulturalCategory
from app.models.accounts import User
from app.models.cultural import CulturalItem, UserCollection

router = APIRouter(prefix="/cultural-items", tags=["app-cultural-items"])


class CulturalItemSummary(ApiModel):
    id: str
    name: str
    category: CulturalCategory
    rarity: str
    imageUrl: str | None = None
    isDiscovered: bool = False


class CulturalItemDetail(CulturalItemSummary):
    pinyin: str | None = None
    origin: str | None = None
    material: str | None = None
    symbolism: str | None = None
    description: str | None = None
    audioUrl: str | None = None


@router.get("", response_model=ApiResponse[list[CulturalItemSummary]])
async def list_cultural_items(
    category: CulturalCategory | None = Query(default=None),
    session: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    stmt = select(CulturalItem).where(CulturalItem.is_published.is_(True))
    if category:
        stmt = stmt.where(CulturalItem.category == category)
    stmt = stmt.order_by(CulturalItem.sort_order, CulturalItem.created_at)
    result = await session.execute(stmt)
    items = result.scalars().all()

    discovered_ids: set[str] = set()
    if user is not None:
        col_result = await session.execute(
            select(UserCollection.cultural_item_id).where(UserCollection.user_id == str(user.id))
        )
        discovered_ids = {row[0] for row in col_result}

    return ApiResponse.ok(
        [
            CulturalItemSummary(
                id=str(i.id),
                name=i.name,
                category=i.category,
                rarity=str(i.rarity),
                imageUrl=i.image_url,
                isDiscovered=str(i.id) in discovered_ids,
            )
            for i in items
        ]
    )


@router.get("/{item_id}", response_model=ApiResponse[CulturalItemDetail])
async def get_cultural_item(
    item_id: str,
    session: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    item = await session.get(CulturalItem, item_id)
    if item is None or not item.is_published:
        raise AppError("CULTURAL_ITEM_NOT_FOUND", "文化条目不存在", status_code=404)

    discovered = False
    if user is not None:
        col_result = await session.execute(
            select(UserCollection).where(
                UserCollection.user_id == str(user.id),
                UserCollection.cultural_item_id == item_id,
            )
        )
        discovered = col_result.scalar_one_or_none() is not None

    return ApiResponse.ok(
        CulturalItemDetail(
            id=str(item.id),
            name=item.name,
            category=item.category,
            rarity=str(item.rarity),
            imageUrl=item.image_url,
            isDiscovered=discovered,
            pinyin=item.pinyin,
            origin=item.origin,
            material=item.material,
            symbolism=item.symbolism,
            description=item.description,
            audioUrl=item.audio_url,
        )
    )
