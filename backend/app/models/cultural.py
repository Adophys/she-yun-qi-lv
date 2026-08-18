from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.domain.cultural import CulturalCategory, Rarity


class CulturalItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "cultural_item"

    name: Mapped[str] = mapped_column(String(128), comment="名称")
    pinyin: Mapped[str | None] = mapped_column(String(128), comment="拼音")
    category: Mapped[CulturalCategory] = mapped_column(comment="分类")
    rarity: Mapped[Rarity] = mapped_column(default=Rarity.COMMON, comment="稀有度")
    origin: Mapped[str | None] = mapped_column(String(255), comment="发源地")
    material: Mapped[str | None] = mapped_column(String(255), comment="材质")
    symbolism: Mapped[str | None] = mapped_column(String(255), comment="象征意义")
    description: Mapped[str | None] = mapped_column(Text, comment="详细介绍")
    image_url: Mapped[str | None] = mapped_column(String(512), comment="图片 URL")
    audio_url: Mapped[str | None] = mapped_column(String(512), comment="音频 URL")
    sort_order: Mapped[int] = mapped_column(default=0, comment="排序")
    is_published: Mapped[bool] = mapped_column(default=True, comment="是否发布")
