/**
 * 文化图鉴 API。
 */
import { http } from './http'

/**
 * 图鉴列表（游客可浏览，登录后附带解锁状态）。
 * @param {Object} params { category?: string }
 */
export async function getCulturalItems(params = {}) {
  const query = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')
  return http.get(query ? `/cultural-items?${query}` : '/cultural-items')
}

/**
 * 图鉴详情（游客可浏览）。
 * @param {string} id
 */
export async function getCulturalItem(id) {
  return http.get(`/cultural-items/${id}`)
}
