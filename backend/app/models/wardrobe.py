from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.domain.cultural import Rarity
from app.domain.wardrobe import WardrobeCategory


class WardrobeItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "wardrobe_item"

    name: Mapped[str] = mapped_column(String(128), comment="名称")
    category: Mapped[WardrobeCategory] = mapped_column(comment="分类")
    rarity: Mapped[Rarity] = mapped_column(default=Rarity.COMMON, comment="稀有度")
    description: Mapped[str | None] = mapped_column(String(512), comment="描述")
    image_url: Mapped[str | None] = mapped_column(String(512), comment="图片 URL")
    total_fragments: Mapped[int] = mapped_column(default=10, comment="合成所需碎片数")
    sort_order: Mapped[int] = mapped_column(default=0, comment="排序")


class UserWardrobe(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """用户拥有的衣橱道具及已收集碎片数"""

    __tablename__ = "user_wardrobe"
    __table_args__ = (
        UniqueConstraint("user_id", "wardrobe_item_id", name="uq_user_wardrobe_user_item"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), comment="用户 ID")
    wardrobe_item_id: Mapped[str] = mapped_column(
        ForeignKey("wardrobe_item.id"), comment="衣橱道具 ID"
    )
    fragments: Mapped[int] = mapped_column(default=0, comment="已收集碎片数")
    is_completed: Mapped[bool] = mapped_column(default=False, comment="是否合成完成")
