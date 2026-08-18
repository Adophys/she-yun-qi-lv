import { reactive, readonly } from 'vue'

const state = reactive({
  status: 'ANONYMOUS', // BOOTSTRAPPING | ANONYMOUS | READY
  user: null,
  accessToken: null,
})

export function useSessionStore() {
  function setUser(user) {
    state.user = user
    state.status = user ? 'READY' : 'ANONYMOUS'
  }

  function setToken(token) {
    state.accessToken = token
    uni.setStorageSync('access_token', token)
  }

  function logout() {
    state.user = null
    state.accessToken = null
    state.status = 'ANONYMOUS'
    uni.removeStorageSync('access_token')
  }

  return {
    state: readonly(state),
    setUser,
    setToken,
    logout,
  }
}
