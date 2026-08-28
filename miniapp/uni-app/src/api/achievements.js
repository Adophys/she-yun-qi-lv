/**
 * 成就 API。
 */
import { http } from './http'

/**
 * 成就列表（含我的解锁状态，需登录）。
 */
export async function getAchievements() {
  return http.get('/achievements')
}
