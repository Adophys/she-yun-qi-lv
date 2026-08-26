"""管理端：文化图鉴 CRUD。"""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.core.errors import AppError
from app.db.session import get_db
from app.domain.cultural import CulturalCategory, Rarity
from app.models.accounts import AdminUser
from app.models.cultural import CulturalItem

router = APIRouter(prefix="/cultural-items", tags=["admin-cultural-items"])


class CulturalItemCreate(BaseModel):
    name: str
    pinyin: str | None = None
    category: CulturalCategory
    rarity: Rarity = Rarity.COMMON
    origin: str | None = None
    material: str | None = None
    symbolism: str | None = None
    description: str | None = None
    image_url: str | None = None
    audio_url: str | None = None
    sort_order: int = 0
    is_published: bool = True


class CulturalItemUpdate(CulturalItemCreate):
    pass


class CulturalItemOut(ApiModel):
    id: str
    name: str
    pinyin: str | None = None
    category: CulturalCategory
    rarity: str
    origin: str | None = None
    material: str | None = None
    symbolism: str | None = None
    description: str | None = None
    imageUrl: str | None = None
    audioUrl: str | None = None
    sortOrder: int = 0
    isPublished: bool = True


class CulturalItemPage(ApiModel):
    items: list[CulturalItemOut]
    total: int
    page: int
    pageSize: int


def _to_out(item: CulturalItem) -> CulturalItemOut:
    return CulturalItemOut(
        id=str(item.id),
        name=item.name,
        pinyin=item.pinyin,
        category=item.category,
        rarity=str(item.rarity),
        origin=item.origin,
        material=item.material,
        symbolism=item.symbolism,
        description=item.description,
        imageUrl=item.image_url,
        audioUrl=item.audio_url,
        sortOrder=item.sort_order,
        isPublished=item.is_published,
    )


@router.get("", response_model=ApiResponse[CulturalItemPage])
async def list_items(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    keyword: str | None = Query(default=None),
    category: CulturalCategory | None = Query(default=None),
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    stmt = select(CulturalItem)
    count_stmt = select(func.count()).select_from(CulturalItem)
    if keyword:
        like = f"%{keyword}%"
        stmt = stmt.where(CulturalItem.name.like(like))
        count_stmt = count_stmt.where(CulturalItem.name.like(like))
    if category:
        stmt = stmt.where(CulturalItem.category == category)
        count_stmt = count_stmt.where(CulturalItem.category == category)

    total = (await session.execute(count_stmt)).scalar_one()
    rows = (
        (
            await session.execute(
                stmt.order_by(CulturalItem.sort_order, CulturalItem.created_at)
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
        )
        .scalars()
        .all()
    )

    return ApiResponse.ok(
        CulturalItemPage(
            items=[_to_out(i) for i in rows],
            total=total,
            page=page,
            pageSize=page_size,
        )
    )


@router.post("", response_model=ApiResponse[CulturalItemOut])
async def create_item(
    body: CulturalItemCreate,
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    item = CulturalItem(**body.model_dump())
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return ApiResponse.ok(_to_out(item))


@router.put("/{item_id}", response_model=ApiResponse[CulturalItemOut])
async def update_item(
    item_id: str,
    body: CulturalItemUpdate,
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    item = await session.get(CulturalItem, item_id)
    if item is None:
        raise AppError("CULTURAL_ITEM_NOT_FOUND", "文化条目不存在", status_code=404)
    for key, value in body.model_dump().items():
        setattr(item, key, value)
    await session.commit()
    await session.refresh(item)
    return ApiResponse.ok(_to_out(item))


@router.delete("/{item_id}", response_model=ApiResponse[dict[str, bool]])
async def delete_item(
    item_id: str,
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    item = await session.get(CulturalItem, item_id)
    if item is None:
        raise AppError("CULTURAL_ITEM_NOT_FOUND", "文化条目不存在", status_code=404)
    await session.delete(item)
    await session.commit()
    return ApiResponse.ok({"deleted": True})
