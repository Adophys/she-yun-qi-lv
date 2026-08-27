import { get, put } from './http'
import type { Order, OrderPage, OrderQuery, OrderStatus } from '@/types/admin'

/** 拼接查询参数（忽略空值） */
function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  })
  const str = search.toString()
  return str ? `?${str}` : ''
}

// ── 归一化兜底 ─────────────────────────────────────────────────
// 后端返回 null / 缺字段 / 空数组时，统一补成安全默认值，
// 保证页面空数据时展示 0 / 空列表，不出现报错崩溃。

/** 安全数字：undefined / null / NaN / 非法字符串一律归 0 */
function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 订单商品明细归一化 */
function normalizeOrderItem(item: Partial<Order['items'][number]> | null | undefined): Order['items'][number] {
  const i = item ?? {}
  return {
    productId: i.productId == null ? '' : String(i.productId),
    productName: i.productName == null ? '' : String(i.productName),
    productImage: i.productImage == null ? '' : String(i.productImage),
    price: num(i.price),
    quantity: num(i.quantity),
  }
}

/** 订单归一化：缺字段补默认值，items 保证为数组 */
function normalizeOrder(order: Partial<Order> | null | undefined): Order {
  const o = order ?? {}
  return {
    id: o.id == null ? '' : String(o.id),
    orderNo: o.orderNo == null ? '' : String(o.orderNo),
    buyerName: o.buyerName == null ? '' : String(o.buyerName),
    buyerPhone: o.buyerPhone == null ? '' : String(o.buyerPhone),
    address: o.address == null ? '' : String(o.address),
    items: Array.isArray(o.items) ? o.items.map(normalizeOrderItem) : [],
    totalAmount: num(o.totalAmount),
    status: (o.status as OrderStatus) || 'pending',
    createdAt: o.createdAt == null ? '' : String(o.createdAt),
    updatedAt: o.updatedAt == null ? '' : String(o.updatedAt),
  }
}

/** 分页结果归一化：空数据返回空列表 + 0 总数 */
function normalizePage(data: Partial<OrderPage> | null | undefined): OrderPage {
  const d = data ?? {}
  return {
    items: Array.isArray(d.items) ? d.items.map(normalizeOrder) : [],
    total: num(d.total),
    page: num(d.page) || 1,
    pageSize: num(d.pageSize) || 10,
  }
}

/**
 * 分页查询订单（支持订单号/买家关键词与状态筛选）
 * 后端无数据时自动兜底为空列表与 0 总数。
 */
export async function getOrders(query: OrderQuery): Promise<OrderPage> {
  const qs = buildQuery({
    page: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword,
    status: query.status,
  })
  const data = await get<Partial<OrderPage> | null>(`/admin/orders${qs}`)
  return normalizePage(data)
}

/**
 * 获取订单详情
 * 后端返回 null / 缺字段时自动兜底为空订单。
 */
export async function getOrderDetail(id: string): Promise<Order> {
  const data = await get<Partial<Order> | null>(`/admin/orders/${id}`)
  return normalizeOrder(data)
}

/**
 * 更新订单状态（发货 / 完成 / 取消等流转）
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const data = await put<Partial<Order> | null>(`/admin/orders/${id}/status`, { status })
  return normalizeOrder(data)
}
