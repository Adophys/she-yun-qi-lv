import { post, get, put, ApiError } from './http'
import type {
  AdminProfile,
  AdminProfilePayload,
  ChangePasswordPayload,
} from '@/types/admin'

// ── 类型定义 ──────────────────────────────────────────────────

export interface LoginPayload {
  username: string
  password: string
}

export interface UserInfo {
  id: string
  username: string
  displayName: string
  roles: string[]
  avatar: string
}

export interface LoginResult {
  token: string
  refreshToken: string
  user: UserInfo
  expiresIn: number // 秒
}

// ── 归一化兜底 ─────────────────────────────────────────────────

/** 用户信息归一化：后端缺字段时补默认值 */
function normalizeUser(user: Partial<UserInfo> | null | undefined): UserInfo {
  const u = user ?? {}
  return {
    id: u.id == null ? '' : String(u.id),
    username: u.username == null ? '' : String(u.username),
    displayName: u.displayName == null ? String(u.username ?? '') : String(u.displayName),
    roles: Array.isArray(u.roles) ? u.roles.map((r) => String(r)) : [],
    avatar: u.avatar == null ? '' : String(u.avatar),
  }
}

/** 个人资料归一化：后端缺字段时补默认值 */
function normalizeProfile(data: Partial<AdminProfile> | null | undefined): AdminProfile {
  const p = data ?? {}
  return {
    id: p.id == null ? '' : String(p.id),
    username: p.username == null ? '' : String(p.username),
    realName: p.realName == null ? '' : String(p.realName),
    phone: p.phone == null ? '' : String(p.phone),
    role: p.role === 'super_admin' ? 'super_admin' : 'editor',
    createdAt: p.createdAt == null ? '' : String(p.createdAt),
  }
}

// ── Token 存储（内存 + localStorage 持久化）────────────────────

const TOKEN_KEY = 'sheyun_auth_token'
const USER_KEY = 'sheyun_user_info'

/** 获取存储的 token */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** 获取存储的用户信息 */
export function getStoredUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

/** 保存 token 和用户信息 */
function saveAuth(result: LoginResult): void {
  localStorage.setItem(TOKEN_KEY, result.token)
  localStorage.setItem(USER_KEY, JSON.stringify(result.user))
}

/** 清除认证信息 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/** 检查是否已登录 */
export function isAuthenticated(): boolean {
  return !!getStoredToken()
}

// ── API 接口 ──────────────────────────────────────────────────

/**
 * 登录接口
 * 成功后自动保存 token 和用户信息到 localStorage。
 * 后端响应缺字段 / 无 token 时给出明确错误，避免静默写入脏数据。
 */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  const result = await post<Partial<LoginResult> | null>('/admin/auth/login', payload)
  if (!result || !result.token) {
    throw new ApiError('LOGIN_FAILED', '登录响应缺少令牌，请检查后端登录接口')
  }
  const full: LoginResult = {
    token: String(result.token),
    refreshToken: result.refreshToken == null ? '' : String(result.refreshToken),
    expiresIn:
      typeof result.expiresIn === 'number' && Number.isFinite(result.expiresIn) ? result.expiresIn : 0,
    user: normalizeUser(result.user),
  }
  saveAuth(full)
  return full
}

/**
 * 获取当前登录用户信息
 * 后端返回 null / 缺字段时自动兜底为空用户。
 */
export async function fetchCurrentUser(): Promise<UserInfo> {
  const data = await get<Partial<UserInfo> | null>('/admin/auth/me')
  return normalizeUser(data)
}

/**
 * 退出登录
 */
export async function logout(): Promise<void> {
  try {
    await post('/admin/auth/logout', {})
  } finally {
    clearAuth()
  }
}

// ── 个人资料（当前登录管理员） ─────────────────────────────────

/**
 * 获取当前登录管理员个人资料
 * 后端返回 null / 缺字段时自动兜底为空资料。
 */
export async function fetchProfile(): Promise<AdminProfile> {
  const data = await get<Partial<AdminProfile> | null>('/admin/auth/profile')
  return normalizeProfile(data)
}

/**
 * 更新个人资料（真实姓名 / 手机号）
 * 成功后自动同步 localStorage，侧边栏/顶栏显示随之刷新。
 */
export async function updateProfile(payload: AdminProfilePayload): Promise<AdminProfile> {
  const data = await put<Partial<AdminProfile> | null>('/admin/auth/profile', payload)
  const profile = normalizeProfile(data)
  syncStoredUser({ displayName: profile.realName })
  return profile
}

/**
 * 修改当前登录管理员的登录密码
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await put('/admin/auth/password', payload)
}

/**
 * 合并更新本地存储的用户信息（个人资料修改后调用，保持布局显示同步）
 */
export function syncStoredUser(patch: Partial<UserInfo>): UserInfo | null {
  const stored = getStoredUser()
  const merged: UserInfo = {
    id: patch.id ?? stored?.id ?? '',
    username: patch.username ?? stored?.username ?? '',
    displayName: patch.displayName ?? stored?.displayName ?? '',
    roles: patch.roles ?? stored?.roles ?? [],
    avatar: patch.avatar ?? stored?.avatar ?? '',
  }
  localStorage.setItem(USER_KEY, JSON.stringify(merged))
  return merged
}
