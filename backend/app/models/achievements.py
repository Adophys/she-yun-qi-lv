from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Achievement(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "achievement"

    name: Mapped[str] = mapped_column(String(128), comment="成就名称")
    description: Mapped[str | None] = mapped_column(String(512), comment="描述")
    icon_url: Mapped[str | None] = mapped_column(String(512), comment="图标 URL")
    unlock_condition: Mapped[str | None] = mapped_column(String(255), comment="解锁条件")
