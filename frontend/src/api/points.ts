import { get, post, put, del } from './http'
import type { Point, PointPage, PointPayload, PointQuery } from '@/types/admin'

/** 拼接查询参数（忽略空值） */
function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  })
  const str = search.toString()
  return str ? `?${str}` : ''
}

// ── 归一化兜底 ─────────────────────────────────────────────────
// 后端返回 null / 缺字段 / 空数组时，统一补成安全默认值，
// 保证页面空数据时展示 0 / 空列表，不出现报错崩溃。

/** 安全数字：undefined / null / NaN / 非法字符串一律归 0 */
function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 点位归一化：缺字段补默认值 */
function normalizePoint(point: Partial<Point> | null | undefined): Point {
  const p = point ?? {}
  return {
    id: p.id == null ? '' : String(p.id),
    name: p.name == null ? '' : String(p.name),
    description: p.description == null ? '' : String(p.description),
    address: p.address == null ? '' : String(p.address),
    nfcTagId: p.nfcTagId == null ? '' : String(p.nfcTagId),
    image: p.image == null ? '' : String(p.image),
    isActive: Boolean(p.isActive),
    createdAt: p.createdAt == null ? '' : String(p.createdAt),
    updatedAt: p.updatedAt == null ? '' : String(p.updatedAt),
  }
}

/** 分页结果归一化：空数据返回空列表 + 0 总数 */
function normalizePage(data: Partial<PointPage> | null | undefined): PointPage {
  const d = data ?? {}
  return {
    items: Array.isArray(d.items) ? d.items.map(normalizePoint) : [],
    total: num(d.total),
    page: num(d.page) || 1,
    pageSize: num(d.pageSize) || 10,
  }
}

/**
 * 分页查询点位（支持关键词 / 启用状态筛选）
 * 后端无数据时自动兜底为空列表与 0 总数。
 */
export async function getPoints(query: PointQuery): Promise<PointPage> {
  const qs = buildQuery({
    page: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword,
    status: query.status,
  })
  const data = await get<Partial<PointPage> | null>(`/admin/points${qs}`)
  return normalizePage(data)
}

/**
 * 新增点位
 */
export async function createPoint(payload: PointPayload): Promise<Point> {
  return post<Point>('/admin/points', payload)
}

/**
 * 编辑点位
 */
export async function updatePoint(id: string, payload: PointPayload): Promise<Point> {
  return put<Point>(`/admin/points/${id}`, payload)
}

/**
 * 启用 / 停用点位
 */
export async function togglePointStatus(id: string, isActive: boolean): Promise<Point> {
  return put<Point>(`/admin/points/${id}/status`, { isActive })
}

/**
 * 删除点位
 */
export async function deletePoint(id: string): Promise<void> {
  return del<void>(`/admin/points/${id}`)
}
