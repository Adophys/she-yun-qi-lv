/**
 * 应用启动引导：
 * 1. 恢复本地登录态；
 * 2. 有 Token 时拉取 /users/me 刷新用户信息；
 * 3. 注册 401 全局回调（跳登录页）。
 */
import { useSessionStore } from '@/stores/session'
import { setUnauthorizedHandler } from '@/api/http'
import { getMe } from '@/api/users'
import { ROUTE_PATHS } from '@/router/routes'
import { STORAGE_KEYS } from '@/storage/keys'

let redirecting = false

export async function bootstrapApp() {
  const { state, setUser, logout } = useSessionStore()
  state.status = 'BOOTSTRAPPING'

  // 登录态失效：清理并跳转登录页（避免重复跳转）
  setUnauthorizedHandler(() => {
    logout()
    if (!redirecting) {
      redirecting = true
      const pages = getCurrentPages()
      const current = pages.length ? pages[pages.length - 1].route : ''
      uni.navigateTo({
        url: ROUTE_PATHS.LOGIN + (current ? `?redirect=${encodeURIComponent('/' + current)}` : ''),
        complete: () => {
          redirecting = false
        },
      })
    }
  })

  try {
    const token = uni.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      try {
        const me = await getMe()
        setUser({
          id: me.id,
          nickname: me.nickname,
          avatarUrl: me.avatarUrl,
          level: me.level,
          points: me.points,
          discoveredCount: me.discoveredCount,
          exploreCompleted: me.exploreCompleted,
        })
      } catch (error) {
        // Token 无效：清理登录态，降级为游客模式
        console.warn('Bootstrap: token invalid, fallback to guest', error)
        logout()
      }
    } else {
      setUser(null)
    }
  } catch (error) {
    console.error('Bootstrap failed', error)
    setUser(null)
  }
}
