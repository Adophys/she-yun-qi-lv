import type { ApiEnvelope } from '@/types/admin'
import { getStoredToken } from './auth'

/**
 * API 基础地址：
 * - 默认 `/api/v1`（开发时被 Mock 服务器拦截，生产时走同域 nginx 转发）
 * - 设置 `VITE_API_BASE_URL` 后（如 `.env` 或 `.env.development` 中写
 *   `VITE_API_BASE_URL=https://your-backend.com/api/v1`），所有请求直接
 *   发往真实后端，绕过 Mock —— 页面代码无需任何改动即可无缝切换。
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

if (import.meta.env.DEV && import.meta.env.VITE_API_BASE_URL) {
  console.info(`[api] 已启用真实后端数据源 → ${API_BASE_URL}`)
} else if (import.meta.env.DEV) {
  console.info('[api] 当前使用 Mock 模拟数据源（设置 VITE_API_BASE_URL 可切换真实后端）')
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const envelope: ApiEnvelope<T> = await response.json()
  if (envelope.code !== 'SUCCESS') {
    throw new ApiError(envelope.code, envelope.message)
  }
  return envelope.data
}

/** 构建请求头（含 Authorization） */
function buildHeaders(custom?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...custom,
  }

  // 自动附加 Bearer Token
  const token = getStoredToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: buildHeaders({ 'Content-Type': 'text/plain' }), // GET 不需要 Content-Type
  })
  return parseResponse<T>(response)
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

export async function del<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
    credentials: 'include',
  })
  return parseResponse<T>(response)
}
