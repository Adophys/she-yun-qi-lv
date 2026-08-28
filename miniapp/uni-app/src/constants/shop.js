/**
 * 商城领域常量（与接口契约 V1.0 对齐）。
 */
export const SHOP_CATEGORY_ALL = { key: '', label: '全部' }

export const ORDER_STATUS_META = {
  pending_payment: { label: '待付款', color: '#B8860B' },
  paid: { label: '待发货', color: '#2563EB' },
  shipped: { label: '待收货', color: '#7C3AED' },
  completed: { label: '已完成', color: '#16A34A' },
  cancelled: { label: '已取消', color: '#9CA3AF' },
  refunding: { label: '退款中', color: '#EA580C' },
  refunded: { label: '已退款', color: '#9CA3AF' },
}

export function orderStatusLabel(key) {
  return (ORDER_STATUS_META[key] || {}).label || key || '未知状态'
}

export function orderStatusColor(key) {
  return (ORDER_STATUS_META[key] || {}).color || '#9CA3AF'
}
