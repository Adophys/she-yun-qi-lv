from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.domain.explore import NodeStatus


class Chapter(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "chapter"

    name: Mapped[str] = mapped_column(String(128), comment="章节名称")
    description: Mapped[str | None] = mapped_column(Text, comment="章节介绍")
    sort_order: Mapped[int] = mapped_column(default=0, comment="排序")


class ExploreNode(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "explore_node"

    chapter_id: Mapped[str] = mapped_column(ForeignKey("chapter.id"), comment="章节 ID")
    name: Mapped[str] = mapped_column(String(128), comment="节点名称")
    location: Mapped[str | None] = mapped_column(String(255), comment="地点")
    description: Mapped[str | None] = mapped_column(Text, comment="节点介绍")
    preview_image_url: Mapped[str | None] = mapped_column(String(512), comment="预览图")
    sort_order: Mapped[int] = mapped_column(default=0, comment="排序")
    puzzle_image_url: Mapped[str | None] = mapped_column(String(512), comment="拼图底图")
    puzzle_pieces: Mapped[int] = mapped_column(default=9, comment="拼图块数")
    code: Mapped[str | None] = mapped_column(
        String(64), unique=True, comment="二维码/NFC 码值（扫码识别用）"
    )
    cultural_item_id: Mapped[str | None] = mapped_column(
        ForeignKey("cultural_item.id"), comment="绑定解锁的文化卡片 ID"
    )


class UserExploreProgress(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """用户探索节点进度（拼图关卡记录）"""

    __tablename__ = "user_explore_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "node_id", name="uq_user_explore_progress_user_node"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), comment="用户 ID")
    node_id: Mapped[str] = mapped_column(ForeignKey("explore_node.id"), comment="探索节点 ID")
    status: Mapped[NodeStatus] = mapped_column(default=NodeStatus.ACTIVE, comment="节点进度状态")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, comment="完成时间")
