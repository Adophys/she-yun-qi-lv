from enum import StrEnum


class ProductStatus(StrEnum):
    DRAFT = "draft"
    ON_SALE = "on_sale"
    OFF_SALE = "off_sale"


class OrderStatus(StrEnum):
    PENDING_PAYMENT = "pending_payment"
    PAID = "paid"
    SHIPPED = "shipped"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDING = "refunding"
    REFUNDED = "refunded"


class PayStatus(StrEnum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class RefundStatus(StrEnum):
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"


class StockLogReason(StrEnum):
    RESERVE = "reserve"
    DEDUCT = "deduct"
    RELEASE = "release"
    RESTOCK = "restock"
