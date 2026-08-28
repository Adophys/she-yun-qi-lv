/**
 * IP 衣橱 API。
 */
import { http } from './http'

/**
 * 衣橱道具列表（需登录）。
 */
export async function getWardrobeItems() {
  return http.get('/wardrobe')
}

/**
 * 合成衣橱道具（需登录）。
 * @param {string} id
 * @returns {Promise<{crafted:boolean, remainingFragments:number}>}
 */
export async function craftWardrobeItem(id) {
  return http.post(`/wardrobe/${id}/craft`)
}

/**
 * 穿戴衣橱道具（后端实现 equip 后调用）。
 * @param {string} id
 */
export async function equipWardrobeItem(id) {
  return http.post(`/wardrobe/${id}/equip`)
}
