/**
 * 统一业务错误类型。
 * 后端所有失败响应均为 { code, message, requestId, serverTime } 信封，此处映射为 ApiError。
 */
export class ApiError extends Error {
  constructor(code, message, statusCode = 0) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
  }

  static fromEnvelope(envelope) {
    return new ApiError(envelope.code, envelope.message)
  }
}

/**
 * 根据错误码返回对用户更友好的提示文案。
 */
export function friendlyMessage(error, fallback = '操作失败，请稍后重试') {
  if (!error) return fallback
  if (error instanceof ApiError) {
    const map = {
      AUTH_INVALID_CREDENTIALS: '账号或密码错误',
      AUTH_TOKEN_EXPIRED: '登录已过期，请重新登录',
      AUTH_UNAUTHORIZED: '请先登录后再操作',
      NETWORK_ERROR: '网络开小差了，请检查网络后重试',
      HTTP_ERROR: '服务繁忙，请稍后重试',
      CULTURAL_ITEM_NOT_FOUND: '文化条目不存在或已下架',
      EXPLORE_NODE_NOT_FOUND: '关卡不存在',
      EXPLORE_NODE_LOCKED: '该关卡尚未解锁',
      SCAN_INVALID_CODE: '二维码内容为空',
      SCAN_CODE_NOT_MATCHED: '未识别该二维码，请确认后重试',
      SCAN_NODE_NO_ITEM: '该点位尚未绑定文化卡片',
      WARDROBE_ITEM_NOT_FOUND: '衣橱道具不存在',
      WARDROBE_NOT_ENOUGH_FRAGMENTS: '碎片不足，暂无法合成',
      WARDROBE_ALREADY_CRAFTED: '该道具已合成',
      SHOP_PRODUCT_NOT_FOUND: '商品不存在或已下架',
      SHOP_SKU_OUT_OF_STOCK: '库存不足',
      SHOP_CART_SKU_NOT_FOUND: '购物车条目不存在',
      SHOP_ADDRESS_NOT_FOUND: '收货地址不存在',
      SHOP_ORDER_NOT_FOUND: '订单不存在',
      SHOP_ORDER_STATUS_INVALID: '当前订单状态不允许该操作',
      SHOP_PAYMENT_DISABLED: '支付功能即将开放，敬请期待',
      SHOP_REFUND_AMOUNT_EXCEEDED: '退款金额超出可退金额',
    }
    return map[error.code] || error.message || fallback
  }
  return error.message || fallback
}
