import { API_CONFIG } from '@/config/api'
import { ApiError } from './errors'
import { request } from './transport'

let isRefreshing = false
let refreshPromise = null

function parseResponse(res) {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    const envelope = res.data
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
    refreshPromise = request({
      url: `${API_CONFIG.baseUrl}/auth/refresh`,
      method: 'POST',
    }).finally(() => {
      isRefreshing = false
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function httpRequest(method, path, data) {
  const url = `${API_CONFIG.baseUrl}${path}`
  const token = uni.getStorageSync('access_token')

  const options = {
    url,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
    },
  }

  if (token) {
    options.header.Authorization = `Bearer ${token}`
  }

  try {
    const res = await request(options)
    return parseResponse(res)
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      await refreshSession()
      const res = await request(options)
      return parseResponse(res)
    }
    throw error
  }
}

export const http = {
  get: (path) => httpRequest('GET', path),
  post: (path, data) => httpRequest('POST', path, data),
  put: (path, data) => httpRequest('PUT', path, data),
  delete: (path) => httpRequest('DELETE', path),
}
