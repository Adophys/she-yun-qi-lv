/**
 * 商城 API（与接口契约 V1.0 对齐；后端实现后即可联调）。
 */
import { http } from './http'

/* ---------- 分类 ---------- */
export async function getShopCategories() {
  return http.get('/shop/categories')
}

/* ---------- 商品 ---------- */
export async function getShopProducts(params = {}) {
  const query = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')
  return http.get(query ? `/shop/products?${query}` : '/shop/products')
}

export async function getShopProduct(id) {
  return http.get(`/shop/products/${id}`)
}

/* ---------- 购物车 ---------- */
export async function getCart() {
  return http.get('/shop/cart')
}

export async function addCartItem(skuId, quantity) {
  return http.post('/shop/cart/items', { skuId, quantity })
}

export async function updateCartItem(skuId, data) {
  return http.put(`/shop/cart/items/${skuId}`, data)
}

export async function removeCartItem(skuId) {
  return http.delete(`/shop/cart/items/${skuId}`)
}

/* ---------- 收货地址 ---------- */
export async function getAddresses() {
  return http.get('/shop/addresses')
}

export async function createAddress(data) {
  return http.post('/shop/addresses', data)
}

export async function updateAddress(id, data) {
  return http.put(`/shop/addresses/${id}`, data)
}

export async function deleteAddress(id) {
  return http.delete(`/shop/addresses/${id}`)
}

/* ---------- 订单与支付 ---------- */
export async function createOrder(data) {
  return http.post('/shop/orders', data)
}

export async function getOrders(params = {}) {
  const query = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')
  return http.get(query ? `/shop/orders?${query}` : '/shop/orders')
}

export async function getOrder(id) {
  return http.get(`/shop/orders/${id}`)
}

export async function cancelOrder(id) {
  return http.post(`/shop/orders/${id}/cancel`)
}

export async function confirmOrder(id) {
  return http.post(`/shop/orders/${id}/confirm`)
}

export async function requestRefund(id) {
  return http.post(`/shop/orders/${id}/refund`)
}
