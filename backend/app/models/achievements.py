from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Achievement(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "achievement"

    name: Mapped[str] = mapped_column(String(128), comment="成就名称")
    description: Mapped[str | None] = mapped_column(String(512), comment="描述")
    icon_url: Mapped[str | None] = mapped_column(String(512), comment="图标 URL")
    unlock_condition: Mapped[str | None] = mapped_column(String(255), comment="解锁条件")


class UserAchievement(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """用户已获得的成就（创建时间即解锁时间）"""

    __tablename__ = "user_achievement"
    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement_user_ach"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), comment="用户 ID")
    achievement_id: Mapped[str] = mapped_column(ForeignKey("achievement.id"), comment="成就 ID")
