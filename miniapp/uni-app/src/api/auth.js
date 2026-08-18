import { http } from './http'

export async function wxLogin(code) {
  return http.post('/auth/wx-login', { code })
}

export async function refreshToken() {
  return http.post('/auth/refresh')
}
