/**
 * 首页聚合 API。
 */
import { http } from './http'

/**
 * 首页聚合：用户 + 今日任务 + 章节进度（需登录）。
 */
export async function getHomeSummary() {
  return http.get('/home/summary')
}
