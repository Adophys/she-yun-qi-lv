"""管理端：探索点位 CRUD（含二维码码值、绑定卡片）。"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.api.response import ApiResponse
from app.api.schema import ApiModel
from app.core.errors import AppError
from app.db.session import get_db
from app.models.accounts import AdminUser
from app.models.cultural import CulturalItem
from app.models.explore import ExploreNode

router = APIRouter(prefix="/explore-nodes", tags=["admin-explore-nodes"])


class ExploreNodeCreate(BaseModel):
    chapter_id: str
    name: str
    location: str | None = None
    description: str | None = None
    preview_image_url: str | None = None
    sort_order: int = 0
    puzzle_image_url: str | None = None
    puzzle_pieces: int = 9
    code: str | None = None
    cultural_item_id: str | None = None


class ExploreNodeUpdate(ExploreNodeCreate):
    pass


class ExploreNodeOut(ApiModel):
    id: str
    chapterId: str
    name: str
    location: str | None = None
    description: str | None = None
    previewImageUrl: str | None = None
    sortOrder: int = 0
    puzzleImageUrl: str | None = None
    puzzlePieces: int = 9
    code: str | None = None
    culturalItemId: str | None = None
    culturalItemName: str | None = None


def _to_out(node: ExploreNode, item_name: str | None = None) -> ExploreNodeOut:
    return ExploreNodeOut(
        id=str(node.id),
        chapterId=node.chapter_id,
        name=node.name,
        location=node.location,
        description=node.description,
        previewImageUrl=node.preview_image_url,
        sortOrder=node.sort_order,
        puzzleImageUrl=node.puzzle_image_url,
        puzzlePieces=node.puzzle_pieces,
        code=node.code,
        culturalItemId=node.cultural_item_id,
        culturalItemName=item_name,
    )


@router.get("", response_model=ApiResponse[list[ExploreNodeOut]])
async def list_nodes(
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    rows = (
        (await session.execute(select(ExploreNode).order_by(ExploreNode.sort_order)))
        .scalars()
        .all()
    )
    item_ids = {n.cultural_item_id for n in rows if n.cultural_item_id}
    names: dict[str, str] = {}
    if item_ids:
        items = (
            (await session.execute(select(CulturalItem).where(CulturalItem.id.in_(item_ids))))
            .scalars()
            .all()
        )
        names = {str(i.id): i.name for i in items}
    return ApiResponse.ok([_to_out(n, names.get(str(n.cultural_item_id))) for n in rows])


@router.post("", response_model=ApiResponse[ExploreNodeOut])
async def create_node(
    body: ExploreNodeCreate,
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    node = ExploreNode(**body.model_dump())
    session.add(node)
    await session.commit()
    await session.refresh(node)
    return ApiResponse.ok(_to_out(node))


@router.put("/{node_id}", response_model=ApiResponse[ExploreNodeOut])
async def update_node(
    node_id: str,
    body: ExploreNodeUpdate,
    session: AsyncSession = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    node = await session.get(ExploreNode, node_id)
    if node is None:
        raise AppError("EXPLORE_NODE_NOT_FOUND", "点位不存在", status_code=404)
    for key, value in body.model_dump().items():
        setattr(node, key, value)
    await session.commit()
    await session.refresh(node)
    return ApiResponse.ok(_to_out(node))
