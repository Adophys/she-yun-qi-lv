from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "user"

    openid: Mapped[str | None] = mapped_column(String(64), unique=True, comment="微信 openid")
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, comment="手机号")
    nickname: Mapped[str | None] = mapped_column(String(64), comment="昵称")
    avatar_url: Mapped[str | None] = mapped_column(String(512), comment="头像 URL")
    level: Mapped[int] = mapped_column(default=1, comment="等级")
    title: Mapped[str | None] = mapped_column(String(64), comment="称号")
    points: Mapped[int] = mapped_column(default=0, comment="积分")


class AdminUser(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "admin_user"

    username: Mapped[str] = mapped_column(String(64), unique=True, comment="用户名")
    hashed_password: Mapped[str] = mapped_column(String(255), comment="密码哈希")
    is_active: Mapped[bool] = mapped_column(default=True, comment="是否启用")
