import { useSessionStore } from '@/stores/session'

export async function bootstrapApp() {
  const { state, setUser } = useSessionStore()
  state.status = 'BOOTSTRAPPING'

  try {
    const token = uni.getStorageSync('access_token')
    if (token) {
      // TODO: fetch current user
      setUser({ id: 'demo', nickname: 'A-Miao' })
    } else {
      setUser(null)
    }
  } catch (error) {
    console.error('Bootstrap failed', error)
    setUser(null)
  }
}
