/**
 * 登录拦截工具：需要登录的操作统一走这里。
 * 返回 true 表示已登录；否则跳转登录页并返回 false。
 */
import { useSessionStore } from '@/stores/session'
import { ROUTE_PATHS } from '@/router/routes'

export function requireLogin() {
  const { isLoggedIn } = useSessionStore()
  if (isLoggedIn()) return true

  const pages = getCurrentPages()
  const current = pages.length ? pages[pages.length - 1].route : ''
  uni.navigateTo({
    url: ROUTE_PATHS.LOGIN + (current ? `?redirect=${encodeURIComponent('/' + current)}` : ''),
  })
  return false
}
