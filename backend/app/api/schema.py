from datetime import UTC, datetime
from typing import Any, cast

from pydantic import BaseModel, ConfigDict


def _to_camel(snake: str) -> str:
    parts = snake.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=_to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    def model_dump(self, **kwargs) -> dict[str, Any]:
        kwargs.setdefault("by_alias", True)
        data = super().model_dump(**kwargs)
        return cast(dict[str, Any], self._serialize_datetime(data))

    @staticmethod
    def _serialize_datetime(value: Any) -> Any:
        if isinstance(value, datetime):
            return value.astimezone(UTC).isoformat()
        if isinstance(value, dict):
            return {k: ApiModel._serialize_datetime(v) for k, v in value.items()}
        if isinstance(value, list):
            return [ApiModel._serialize_datetime(v) for v in value]
        return value
