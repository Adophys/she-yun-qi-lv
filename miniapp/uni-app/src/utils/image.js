/**
 * 图片地址解析：后端返回相对路径时拼接 mediaBaseUrl。
 */
import { API_CONFIG } from '@/config/api'

export function resolveImage(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (/^\//.test(url)) {
    // 小程序本地静态资源（/static/...）原样返回
    if (url.startsWith('/static/')) return url
    return `${API_CONFIG.mediaBaseUrl}${url}`
  }
  return `${API_CONFIG.mediaBaseUrl}/${url}`
}
