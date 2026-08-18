from datetime import datetime
from uuid import uuid4

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column


class UUIDPrimaryKeyMixin:
    id: Mapped[str] = mapped_column(
        primary_key=True,
        default=lambda: str(uuid4()),
        comment="主键 UUID",
    )


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        default=func.now(),
        nullable=False,
        comment="创建时间",
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="更新时间",
    )


class VersionMixin:
    version: Mapped[int] = mapped_column(
        default=1,
        nullable=False,
        comment="乐观锁版本号",
    )
