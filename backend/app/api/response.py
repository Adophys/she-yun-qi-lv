from datetime import UTC, datetime
from typing import TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiResponse[T](BaseModel):
    code: str = "SUCCESS"
    message: str = "ok"
    data: T | None = None
    request_id: str = Field(default="", alias="requestId")
    server_time: str = Field(
        default_factory=lambda: datetime.now(UTC).isoformat(), alias="serverTime"
    )

    @classmethod
    def ok(cls, data: T | None = None, message: str = "ok") -> "ApiResponse[T]":
        return cls(code="SUCCESS", message=message, data=data)

    @classmethod
    def error(cls, code: str, message: str, data: T | None = None) -> "ApiResponse[T]":
        return cls(code=code, message=message, data=data)
