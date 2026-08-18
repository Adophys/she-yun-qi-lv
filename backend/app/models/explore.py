from sqlalchemy import ForeignKey, Integer, String, Text
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
