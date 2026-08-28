import type {
  CategoryDistItem,
  DashboardStats,
  DashboardSummary,
  ScanTrendPoint,
  UnlockRankItem,
  UserTrendPoint,
} from '@/types/admin'
import { get } from './http'

// ── 归一化工具 ─────────────────────────────────────────────────
// 目的：后端返回 null / 缺字段 / 空数组 / 非法数值时，统一补成
// 安全默认值（0 / 空字符串 / 空数组），保证页面无需判空即可渲染。

/** 安全数字：undefined / null / NaN / 字符串一律归 0 */
function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 安全字符串 */
function str(v: unknown): string {
  return v == null ? '' : String(v)
}

function normalizeScanTrend(list: unknown): ScanTrendPoint[] {
  if (!Array.isArray(list)) return []
  return list.map((p) => {
    const item = (p ?? {}) as Partial<ScanTrendPoint>
    return { date: str(item.date), count: num(item.count) }
  })
}

function normalizeUnlockRank(list: unknown): UnlockRankItem[] {
  if (!Array.isArray(list)) return []
  return list.map((r) => {
    const item = (r ?? {}) as Partial<UnlockRankItem>
    return { id: str(item.id), name: str(item.name), count: num(item.count) }
  })
}

function normalizeUserTrend(list: unknown): UserTrendPoint[] {
  if (!Array.isArray(list)) return []
  return list.map((p) => {
    const item = (p ?? {}) as Partial<UserTrendPoint>
    return { month: str(item.month), total: num(item.total) }
  })
}

function normalizeCategoryDist(list: unknown): CategoryDistItem[] {
  if (!Array.isArray(list)) return []
  return list.map((c) => {
    const item = (c ?? {}) as Partial<CategoryDistItem>
    return { name: str(item.name), value: num(item.value) }
  })
}

/** 数据看板统计归一化兜底：所有字段均为安全默认值 */
function normalizeStats(data: Partial<DashboardStats> | null | undefined): DashboardStats {
  const d = data ?? {}
  return {
    totalUsers: num(d.totalUsers),
    todayScans: num(d.todayScans),
    totalItems: num(d.totalItems),
    todayActiveUsers: num(d.todayActiveUsers),
    scanTrend: normalizeScanTrend(d.scanTrend),
    unlockRank: normalizeUnlockRank(d.unlockRank),
    userTrend: normalizeUserTrend(d.userTrend),
    categoryDist: normalizeCategoryDist(d.categoryDist),
  }
}

/**
 * 获取数据看板概要（总用户 / 图鉴 / 点位 / 今日活跃）
 * 空数据时自动兜底为 0。
 */
export async function getSummary(): Promise<DashboardSummary> {
  const data = await get<Partial<DashboardSummary> | null>('/admin/dashboard/summary')
  const d = data ?? {}
  return {
    totalUsers: num(d.totalUsers),
    totalItems: num(d.totalItems),
    totalNodes: num(d.totalNodes),
    todayActiveUsers: num(d.todayActiveUsers),
  }
}

/**
 * 获取数据看板统计（用户数 / 扫码数 / 解锁TOP榜 / 趋势）
 * 空数据时自动兜底为 0 / 空数组，页面不会因缺字段崩溃。
 */
export async function getStats(): Promise<DashboardStats> {
  const data = await get<Partial<DashboardStats> | null>('/admin/dashboard/stats')
  return normalizeStats(data)
}
