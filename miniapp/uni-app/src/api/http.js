/**
 * HTTP 客户端：统一信封解析、Token 注入、401 单飞刷新。
 * 页面禁止直接拼 URL 或读写 Token，一律走本模块。
 */
import { API_CONFIG } from '@/config/api'
import { STORAGE_KEYS } from '@/storage/keys'
import { ApiError } from './errors'
import { request } from './transport'

let isRefreshing = false
let refreshPromise = null

/** 登录态失效回调（由 app-bootstrap 注册，用于跳转登录页） */
let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

function parseResponse(res) {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    const envelope = res.data
    if (!envelope || typeof envelope !== 'object') {
      throw new ApiError('HTTP_ERROR', '响应格式异常', res.statusCode)
    }
    if (envelope.code !== 'SUCCESS') {
      throw ApiError.fromEnvelope(envelope)
    }
    return envelope.data
  }
  throw new ApiError('HTTP_ERROR', `HTTP ${res.statusCode}`, res.statusCode)
}

async function refreshSession() {
  if (!isRefreshing) {
    isRefreshing = true
    const refreshToken = uni.getStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
    refreshPromise = request({
      url: `${API_CONFIG.baseUrl}/auth/refresh`,
      method: 'POST',
      data: refreshToken ? { refreshToken } : {},
    })
      .then((res) => {
        const data = parseResponse(res)
        if (data && data.accessToken) {
          uni.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken)
          if (data.refreshToken) {
            uni.setStorageSync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)
          }
        }
        return data
      })
      .finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function handleUnauthorized() {
  // 清除本地登录态
  uni.removeStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
  uni.removeStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
  uni.removeStorageSync(STORAGE_KEYS.USER)
  if (unauthorizedHandler) {
    unauthorizedHandler()
  }
}

async function httpRequest(method, path, data, extraOptions = {}) {
  const url = `${API_CONFIG.baseUrl}${path}`
  const token = uni.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN)

  const options = {
    url,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
    },
    ...extraOptions,
  }

  if (token) {
    options.header.Authorization = `Bearer ${token}`
  }

  try {
    const res = await request(options)
    return parseResponse(res)
  } catch (error) {
    // 仅对带 Token 的请求做刷新重试；401 时单飞刷新一次后重放原请求
    if (token && error instanceof ApiError && error.statusCode === 401) {
      try {
        await refreshSession()
        // 刷新成功后使用新 Token 重放原请求
        const newToken = uni.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
        if (newToken) {
          options.header.Authorization = `Bearer ${newToken}`
        }
        const res = await request(options)
        return parseResponse(res)
      } catch (refreshError) {
        await handleUnauthorized()
        throw refreshError
      }
    }
    throw error
  }
}

export const http = {
  get: (path, data) => httpRequest('GET', path, data),
  post: (path, data) => httpRequest('POST', path, data),
  put: (path, data) => httpRequest('PUT', path, data),
  delete: (path) => httpRequest('DELETE', path),
  request: httpRequest,
}

