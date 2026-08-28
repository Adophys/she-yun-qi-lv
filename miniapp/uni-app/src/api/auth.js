/**
 * 认证相关 API。
 * wx-login 为微信静默登录；refresh 用于刷新 access token。
 */
import { http } from './http'

/**
 * 微信登录：使用 wx.login 拿到的 code 换取 accessToken。
 * @param {string} code
 * @returns {Promise<{accessToken:string, refreshToken:string, expiresIn:number, isNewUser:boolean}>}
 */
export async function wxLogin(code) {
  return http.post('/auth/wx-login', { code })
}

/**
 * 刷新 access token（后端实现后生效；当前后端未提供时会被 401 处理流程兜底）。
 * @param {string} refreshToken
 */
export async function refreshToken(refreshToken) {
  return http.post('/auth/refresh', { refreshToken })
}

/**
 * 注销当前账号（后端提供 DELETE /users/me 后即可真实删除；
 * 当前后端未提供时仅清理本地登录态，并提示联系客服）。
 */
export async function deleteAccount() {
  return http.delete('/users/me')
}
