from enum import StrEnum


class NodeStatus(StrEnum):
    COMPLETED = "completed"
    ACTIVE = "active"
    LOCKED = "locked"
