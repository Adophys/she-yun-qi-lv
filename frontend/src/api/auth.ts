import { post } from './http'

export interface LoginPayload {
  username: string
  password: string
}

export async function login(payload: LoginPayload): Promise<void> {
  await post('/admin/auth/login', payload)
}
