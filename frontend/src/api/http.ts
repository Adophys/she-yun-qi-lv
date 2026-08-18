import type { ApiEnvelope } from '@/types/admin'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

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

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
  })
  return parseResponse<T>(response)
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return parseResponse<T>(response)
}
