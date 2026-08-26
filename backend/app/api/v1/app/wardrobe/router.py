"""小程序：衣橱（列表 / 装备 / 合成）。"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.core.errors import AppError
from app.db.session import get_db
from app.models.accounts import User
from app.models.wardrobe import UserWardrobe, WardrobeItem

router = APIRouter(prefix="/wardrobe", tags=["app-wardrobe"])


class WardrobeOut(ApiModel):
    id: str
    name: str
    category: str
    rarity: str
    imageUrl: str | None = None
    fragments: int = 0
    totalFragments: int = 0
    isCompleted: bool = False
    isEquipped: bool = False


class CraftResult(ApiModel):
    crafted: bool = False
    remainingFragments: int = 0


@router.get("", response_model=ApiResponse[list[WardrobeOut]])
async def list_wardrobe(
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items = (
        (await session.execute(select(WardrobeItem).order_by(WardrobeItem.sort_order)))
        .scalars()
        .all()
    )
    owned = {
        str(w.wardrobe_item_id): w
        for w in (
            await session.execute(select(UserWardrobe).where(UserWardrobe.user_id == str(user.id)))
        )
        .scalars()
        .all()
    }
    out: list[WardrobeOut] = []
    for item in items:
        w = owned.get(str(item.id))
        out.append(
            WardrobeOut(
                id=str(item.id),
                name=item.name,
                category=str(item.category),
                rarity=str(item.rarity),
                imageUrl=item.image_url,
                fragments=w.fragments if w else 0,
                totalFragments=item.total_fragments,
                isCompleted=w.is_completed if w else False,
                isEquipped=False,
            )
        )
    return ApiResponse.ok(out)


@router.post("/{item_id}/craft", response_model=ApiResponse[CraftResult])
async def craft_item(
    item_id: str,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = await session.get(WardrobeItem, item_id)
    if item is None:
        raise AppError("WARDROBE_ITEM_NOT_FOUND", "衣橱道具不存在", status_code=404)

    p = await session.execute(
        select(UserWardrobe).where(
            UserWardrobe.user_id == str(user.id),
            UserWardrobe.wardrobe_item_id == item_id,
        )
    )
    w = p.scalar_one_or_none()
    if w is None:
        w = UserWardrobe(
            user_id=str(user.id), wardrobe_item_id=item_id, fragments=0, is_completed=False
        )
        session.add(w)

    if w.is_completed:
        raise AppError("WARDROBE_ALREADY_CRAFTED", "该道具已合成", status_code=400)
    if w.fragments < item.total_fragments:
        raise AppError("WARDROBE_NOT_ENOUGH_FRAGMENTS", "碎片不足", status_code=400)

    w.fragments -= item.total_fragments
    w.is_completed = True
    await session.commit()
    return ApiResponse.ok(CraftResult(crafted=True, remainingFragments=w.fragments))
