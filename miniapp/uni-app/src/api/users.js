/**
 * 用户相关 API。
 */
import { http } from './http'

/**
 * 获取当前登录用户信息（需登录）。
 * @returns {Promise<{id:string, nickname:string, avatarUrl:string, level:number, points:number, discoveredCount:number, exploreCompleted:number}>}
 */
export async function getMe() {
  return http.get('/users/me')
}
