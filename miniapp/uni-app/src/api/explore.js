/**
 * 探索节点 API。
 */
import { http } from './http'

/**
 * 探索节点列表（需登录）。
 */
export async function getExploreNodes() {
  return http.get('/explore-nodes')
}

/**
 * 探索节点详情（需登录）。
 * @param {string} id
 */
export async function getExploreNode(id) {
  return http.get(`/explore-nodes/${id}`)
}

/**
 * 完成探索节点（需登录），返回积分奖励。
 * @param {string} id
 * @returns {Promise<{gainedPoints:number, gainedFragment:string|null}>}
 */
export async function completeExploreNode(id) {
  return http.post(`/explore-nodes/${id}/complete`)
}
