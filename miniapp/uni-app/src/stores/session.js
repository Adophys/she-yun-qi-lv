/**
 * 全局登录态 Store（Vue reactive + 本地持久化）。
 * 状态机：BOOTSTRAPPING（启动中）→ ANONYMOUS（游客）| READY（已登录）
 */
import { reactive, readonly } from 'vue'
import { STORAGE_KEYS } from '@/storage/keys'

function readUser() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEYS.USER)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

const state = reactive({
  status: 'BOOTSTRAPPING', // BOOTSTRAPPING | ANONYMOUS | READY
  user: readUser(),
  accessToken: uni.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN) || null,
})

export function useSessionStore() {
  /** 设置完整会话（登录成功后调用） */
  function setSession({ accessToken, refreshToken, user }) {
    if (accessToken) {
      state.accessToken = accessToken
      uni.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    }
    if (refreshToken) {
      uni.setStorageSync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    }
    if (user) {
      state.user = user
      uni.setStorageSync(STORAGE_KEYS.USER, JSON.stringify(user))
    }
    state.status = 'READY'
  }

  function setUser(user) {
    state.user = user
    state.status = user ? 'READY' : 'ANONYMOUS'
    if (user) {
      uni.setStorageSync(STORAGE_KEYS.USER, JSON.stringify(user))
    } else {
      uni.removeStorageSync(STORAGE_KEYS.USER)
    }
  }

  function setToken(token) {
    state.accessToken = token
    uni.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, token)
  }

  /** 更新积分/等级等字段（局部刷新用） */
  function patchUser(patch) {
    if (!state.user) return
    Object.assign(state.user, patch)
    uni.setStorageSync(STORAGE_KEYS.USER, JSON.stringify(state.user))
  }

  function logout() {
    state.user = null
    state.accessToken = null
    state.status = 'ANONYMOUS'
    uni.removeStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
    uni.removeStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
    uni.removeStorageSync(STORAGE_KEYS.USER)
  }

  function isLoggedIn() {
    return state.status === 'READY' && !!state.accessToken
  }

  return {
    state: readonly(state),
    setSession,
    setUser,
    setToken,
    patchUser,
    logout,
    isLoggedIn,
  }
}
