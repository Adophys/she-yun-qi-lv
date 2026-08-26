"""扫码解锁：二维码码值 → 解锁文化卡片（幂等 + 积分/碎片奖励）。"""

import random

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.core.errors import AppError
from app.db.session import get_db
from app.models.accounts import User
from app.models.cultural import CulturalItem, UserCollection
from app.models.explore import ExploreNode
from app.models.wardrobe import UserWardrobe, WardrobeItem

router = APIRouter(prefix="/scan", tags=["app-scan"])

SCAN_POINTS = 10  # 每次新解锁奖励积分
FRAGMENT_CHANCE = 0.8  # 解锁时掉落衣橱碎片的概率


class ScanRequest(BaseModel):
    code: str


class ScanResponse(ApiModel):
    matchedItemId: str | None = None
    matchedItemName: str | None = None
    nodeId: str | None = None
    nodeName: str | None = None
    isNew: bool = False
    gainedPoints: int = 0
    gainedFragment: str | None = None


@router.post("/recognize", response_model=ApiResponse[ScanResponse])
async def recognize(
    body: ScanRequest,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    code = body.code.strip()
    if not code:
        raise AppError("SCAN_INVALID_CODE", "二维码内容为空", status_code=400)

    # 1) 按码值查点位；兼容码值直接是 cultural_item.id 的直连方式
    node: ExploreNode | None = None
    stmt = select(ExploreNode).where(ExploreNode.code == code)
    result = await session.execute(stmt)
    node = result.scalar_one_or_none()

    item_id: str | None = None
    if node is not None:
        item_id = node.cultural_item_id
        if item_id is None:
            raise AppError("SCAN_NODE_NO_ITEM", "该点位尚未绑定文化卡片", status_code=400)
    else:
        # 直连：码值即文化条目 ID
        direct_item = await session.get(CulturalItem, code)
        if direct_item is not None:
            item_id = str(direct_item.id)

    if item_id is None:
        raise AppError("SCAN_CODE_NOT_MATCHED", "未识别该二维码", status_code=404)

    item = await session.get(CulturalItem, item_id)
    if item is None:
        raise AppError("CULTURAL_ITEM_NOT_FOUND", "文化条目不存在", status_code=404)

    # 2) 幂等：已解锁过则不再发奖励
    existing = await session.execute(
        select(UserCollection).where(
            UserCollection.user_id == str(user.id),
            UserCollection.cultural_item_id == item_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        return ApiResponse.ok(
            ScanResponse(
                matchedItemId=item_id,
                matchedItemName=item.name,
                nodeId=str(node.id) if node else None,
                nodeName=node.name if node else None,
                isNew=False,
                gainedPoints=0,
            )
        )

    # 3) 首次解锁：加积分 + 建收藏记录（唯一约束兜底防并发重复）
    session.add(UserCollection(user_id=str(user.id), cultural_item_id=item_id))
    user.points = (user.points or 0) + SCAN_POINTS

    # 4) 随机掉落衣橱碎片（首次收集该衣橱道具才建记录）
    gained_fragment: str | None = None
    w_items = await session.execute(select(WardrobeItem))
    candidates = list(w_items.scalars().all())
    if candidates:
        target = random.choice(candidates)
        uw = await session.execute(
            select(UserWardrobe).where(
                UserWardrobe.user_id == str(user.id),
                UserWardrobe.wardrobe_item_id == str(target.id),
            )
        )
        user_wardrobe = uw.scalar_one_or_none()
        if user_wardrobe is None:
            user_wardrobe = UserWardrobe(
                user_id=str(user.id),
                wardrobe_item_id=str(target.id),
                fragments=0,
                is_completed=False,
            )
            session.add(user_wardrobe)
        user_wardrobe.fragments = (user_wardrobe.fragments or 0) + 1
        if user_wardrobe.fragments >= target.total_fragments:
            user_wardrobe.is_completed = True
        gained_fragment = target.name

    await session.commit()

    return ApiResponse.ok(
        ScanResponse(
            matchedItemId=item_id,
            matchedItemName=item.name,
            nodeId=str(node.id) if node else None,
            nodeName=node.name if node else None,
            isNew=True,
            gainedPoints=SCAN_POINTS,
            gainedFragment=gained_fragment,
        )
    )
