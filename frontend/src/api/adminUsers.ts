import { get, post, put } from './http'
import type {
  AdminAccount,
  AdminAccountPage,
  AdminAccountPayload,
  AdminAccountQuery,
  AdminRole,
} from '@/types/admin'

// ── 归一化兜底（空数据 / 缺字段时返回安全默认值）──────────────

/** 安全数字：undefined / null / NaN 一律归 0 */
function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 安全字符串：null / undefined 一律归空串 */
function str(v: unknown): string {
  return v == null ? '' : String(v)
}

/** 安全布尔：仅 true / 'true' 视为启用，其余归 false */
function bool(v: unknown): boolean {
  return v === true || v === 'true'
}

/** 角色归一化：未知值兜底为 editor，避免页面渲染崩溃 */
function normalizeRole(v: unknown): AdminRole {
  return v === 'super_admin' ? 'super_admin' : 'editor'
}

/** 管理员账号归一化：后端缺字段时补默认值 */
function normalizeAccount(data: Partial<AdminAccount> | null | undefined): AdminAccount {
  const u = data ?? {}
  return {
    id: str(u.id),
    username: str(u.username),
    realName: str(u.realName),
    phone: str(u.phone),
    role: normalizeRole(u.role),
    isActive: bool(u.isActive),
    createdAt: str(u.createdAt),
    updatedAt: str(u.updatedAt),
  }
}

/** 分页结果归一化：空数据时返回空列表 + 0 总数 */
function normalizePage(
  data: Partial<AdminAccountPage> | null | undefined,
  fallbackPage: number,
  fallbackPageSize: number,
): AdminAccountPage {
  const d = data ?? {}
  return {
    items: Array.isArray(d.items) ? d.items.map(normalizeAccount) : [],
    total: num(d.total),
    page: num(d.page) || fallbackPage,
    pageSize: num(d.pageSize) || fallbackPageSize,
  }
}

// ── 查询参数 ──────────────────────────────────────────────────

/** 拼接查询参数（忽略空值） */
function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  })
  const s = search.toString()
  return s ? `?${s}` : ''
}

// ── API 接口 ──────────────────────────────────────────────────

/**
 * 分页查询管理员账号（支持关键词 / 角色 / 启用状态筛选）
 */
export async function getAdminAccounts(query: AdminAccountQuery): Promise<AdminAccountPage> {
  const qs = buildQuery({
    page: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword,
    role: query.role,
    status: query.status,
  })
  const data = await get<Partial<AdminAccountPage> | null>(`/admin/users${qs}`)
  return normalizePage(data, query.page, query.pageSize)
}

/**
 * 新增管理员账号
 */
export async function createAdminAccount(payload: AdminAccountPayload): Promise<AdminAccount> {
  const data = await post<Partial<AdminAccount> | null>('/admin/users', payload)
  return normalizeAccount(data)
}

/**
 * 编辑管理员账号（password 留空表示不修改密码）
 */
export async function updateAdminAccount(
  id: string,
  payload: AdminAccountPayload,
): Promise<AdminAccount> {
  const data = await put<Partial<AdminAccount> | null>(`/admin/users/${id}`, payload)
  return normalizeAccount(data)
}

/**
 * 启用 / 禁用管理员账号
 */
export async function toggleAdminAccountStatus(
  id: string,
  isActive: boolean,
): Promise<AdminAccount> {
  const data = await put<Partial<AdminAccount> | null>(`/admin/users/${id}/status`, { isActive })
  return normalizeAccount(data)
}
