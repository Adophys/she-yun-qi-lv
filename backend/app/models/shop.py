from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    JSON,
    BigInteger,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from app.domain.shop import (
    OrderStatus,
    PayStatus,
    ProductStatus,
    RefundStatus,
    StockLogReason,
)


class ProductCategory(Base, TimestampMixin):
    """商品分类（INT 自增主键）"""

    __tablename__ = "product_category"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="主键")
    name: Mapped[str] = mapped_column(String(64), comment="分类名")
    icon_url: Mapped[str | None] = mapped_column(String(512), comment="分类图标")
    sort_order: Mapped[int] = mapped_column(default=0, comment="排序")
    is_enabled: Mapped[bool] = mapped_column(default=True, comment="是否启用")


class Product(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """商品 SPU"""

    __tablename__ = "product"

    category_id: Mapped[int] = mapped_column(ForeignKey("product_category.id"), comment="分类 ID")
    name: Mapped[str] = mapped_column(String(128), comment="商品名")
    subtitle: Mapped[str | None] = mapped_column(String(255), comment="副标题")
    main_image: Mapped[str | None] = mapped_column(String(512), comment="主图")
    images: Mapped[list[str] | None] = mapped_column(JSON, comment="详情图列表")
    description: Mapped[str | None] = mapped_column(Text, comment="图文详情")
    is_blind_box: Mapped[bool] = mapped_column(default=False, comment="是否盲盒类商品")
    blind_box_odds: Mapped[list[dict[str, Any]] | None] = mapped_column(
        JSON, comment="盲盒款式概率公示 [{sku_id, name, probability}]"
    )
    status: Mapped[ProductStatus] = mapped_column(default=ProductStatus.DRAFT, comment="商品状态")
    total_stock: Mapped[int] = mapped_column(default=0, comment="总库存（冗余=SUM sku.stock）")
    total_sold: Mapped[int] = mapped_column(default=0, comment="总销量")


class ProductSku(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """商品 SKU（规格+价格+库存）"""

    __tablename__ = "product_sku"

    product_id: Mapped[str] = mapped_column(ForeignKey("product.id"), comment="商品 ID")
    specs: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, comment='规格组合 {"款式":"凤凰装","尺寸":"10cm"}'
    )
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), comment="售价（元）")
    stock: Mapped[int] = mapped_column(default=0, comment="库存（下单预占，支付扣减）")
    image: Mapped[str | None] = mapped_column(String(512), comment="款式图")


class CartItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """购物车项"""

    __tablename__ = "cart_item"
    __table_args__ = (UniqueConstraint("user_id", "sku_id", name="uq_cart_item_user_sku"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), comment="用户 ID")
    sku_id: Mapped[str] = mapped_column(ForeignKey("product_sku.id"), comment="SKU ID")
    quantity: Mapped[int] = mapped_column(default=1, comment="数量（1-99）")
    checked: Mapped[bool] = mapped_column(default=True, comment="是否勾选结算")


class UserAddress(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """用户收货地址"""

    __tablename__ = "user_address"

    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), comment="用户 ID")
    receiver: Mapped[str] = mapped_column(String(64), comment="收货人")
    phone: Mapped[str] = mapped_column(String(20), comment="手机号")
    province: Mapped[str] = mapped_column(String(32), comment="省")
    city: Mapped[str] = mapped_column(String(32), comment="市")
    district: Mapped[str] = mapped_column(String(32), comment="区")
    detail: Mapped[str] = mapped_column(String(255), comment="详细地址")
    is_default: Mapped[bool] = mapped_column(default=False, comment="默认地址")


class Order(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """订单（表名避开 SQL 关键字，模型类名 Order）"""

    __tablename__ = "order"

    order_no: Mapped[str] = mapped_column(String(32), unique=True, comment="订单号 SY20260818xxxx")
    user_id: Mapped[str] = mapped_column(ForeignKey("user.id"), comment="用户 ID")
    status: Mapped[OrderStatus] = mapped_column(
        default=OrderStatus.PENDING_PAYMENT, comment="订单状态"
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), comment="商品总额")
    freight_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0"), comment="运费"
    )
    pay_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), comment="实付金额")
    address_snapshot: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, comment="下单地址快照（收货人/电话/地址）"
    )
    remark: Mapped[str | None] = mapped_column(String(255), comment="买家留言")
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, comment="支付时间")
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime, comment="发货时间")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, comment="完成时间")
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime, comment="取消时间")
    cancel_reason: Mapped[str | None] = mapped_column(String(255), comment="取消/关闭原因")
    expired_at: Mapped[datetime | None] = mapped_column(
        DateTime, comment="支付过期时间（下单+30min）"
    )


class OrderItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """订单项（商品快照，防止商品改动影响历史订单）"""

    __tablename__ = "order_item"

    order_id: Mapped[str] = mapped_column(ForeignKey("order.id"), comment="订单 ID")
    product_id: Mapped[str] = mapped_column(ForeignKey("product.id"), comment="商品 ID")
    sku_id: Mapped[str] = mapped_column(ForeignKey("product_sku.id"), comment="SKU ID")
    product_snapshot: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, comment="商品快照（名称/主图/规格/单价）"
    )
    quantity: Mapped[int] = mapped_column(comment="数量")
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), comment="成交单价快照")
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), comment="小计")


class Shipment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """物流发货单"""

    __tablename__ = "shipment"

    order_id: Mapped[str] = mapped_column(ForeignKey("order.id"), comment="订单 ID")
    carrier: Mapped[str | None] = mapped_column(String(64), comment="快递公司")
    tracking_no: Mapped[str | None] = mapped_column(String(64), comment="运单号")
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime, comment="发货时间")


class Payment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """支付流水（微信支付）"""

    __tablename__ = "payment"

    order_id: Mapped[str] = mapped_column(ForeignKey("order.id"), comment="订单 ID")
    transaction_id: Mapped[str | None] = mapped_column(
        String(64), unique=True, comment="微信支付订单号（回调回填）"
    )
    prepay_id: Mapped[str | None] = mapped_column(String(64), comment="预支付 ID")
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), comment="支付金额")
    status: Mapped[PayStatus] = mapped_column(default=PayStatus.PENDING, comment="支付状态")
    raw_notify: Mapped[dict[str, Any] | None] = mapped_column(JSON, comment="微信回调原文（排障）")
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, comment="支付成功时间")


class Refund(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """退款单"""

    __tablename__ = "refund"

    order_id: Mapped[str] = mapped_column(ForeignKey("order.id"), comment="订单 ID")
    refund_no: Mapped[str] = mapped_column(String(32), unique=True, comment="商户退款单号")
    refund_id: Mapped[str | None] = mapped_column(String(64), comment="微信退款单号（回调回填）")
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), comment="退款金额")
    reason: Mapped[str | None] = mapped_column(String(255), comment="退款原因")
    status: Mapped[RefundStatus] = mapped_column(
        default=RefundStatus.PROCESSING, comment="退款状态"
    )
    operator_id: Mapped[str | None] = mapped_column(
        ForeignKey("admin_user.id"), comment="操作管理员 ID"
    )


class StockLog(Base):
    """库存流水（排障与对账，append-only，仅 created_at）"""

    __tablename__ = "stock_log"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="主键"
    )
    sku_id: Mapped[str] = mapped_column(ForeignKey("product_sku.id"), comment="SKU ID")
    delta: Mapped[int] = mapped_column(comment="变动量（正增负减）")
    reason: Mapped[StockLogReason] = mapped_column(comment="变动原因")
    order_no: Mapped[str | None] = mapped_column(String(32), comment="关联订单号")
    created_at: Mapped[datetime] = mapped_column(default=func.now(), nullable=False, comment="时间")
