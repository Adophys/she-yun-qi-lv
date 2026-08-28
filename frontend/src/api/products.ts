import { get, post, put, del } from './http'
import type { Product, ProductPage, ProductPayload, ProductQuery } from '@/types/admin'

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

/** 商品归一化：缺字段补默认值 */
function normalizeProduct(item: Partial<Product> | null | undefined): Product {
  const p = item ?? {}
  return {
    id: p.id == null ? '' : String(p.id),
    name: p.name == null ? '' : String(p.name),
    category: p.category == null ? '' : String(p.category),
    price: num(p.price),
    originalPrice: num(p.originalPrice),
    stock: num(p.stock),
    sales: num(p.sales),
    image: p.image == null ? '' : String(p.image),
    description: p.description == null ? '' : String(p.description),
    isActive: Boolean(p.isActive),
    createdAt: p.createdAt == null ? '' : String(p.createdAt),
    updatedAt: p.updatedAt == null ? '' : String(p.updatedAt),
  }
}

/** 分页结果归一化：空数据返回空列表 + 0 总数 */
function normalizePage(data: Partial<ProductPage> | null | undefined): ProductPage {
  const d = data ?? {}
  return {
    items: Array.isArray(d.items) ? d.items.map(normalizeProduct) : [],
    total: num(d.total),
    page: num(d.page) || 1,
    pageSize: num(d.pageSize) || 10,
  }
}

/**
 * 分页查询商品（支持关键词 / 分类 / 上下架筛选）
 * 后端无数据时自动兜底为空列表与 0 总数。
 */
export async function getProducts(query: ProductQuery): Promise<ProductPage> {
  const qs = buildQuery({
    page: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword,
    category: query.category,
    status: query.status,
  })
  const data = await get<Partial<ProductPage> | null>(`/admin/products${qs}`)
  return normalizePage(data)
}

/**
 * 新增商品
 */
export async function createProduct(payload: ProductPayload): Promise<Product> {
  return post<Product>('/admin/products', payload)
}

/**
 * 编辑商品
 */
export async function updateProduct(id: string, payload: ProductPayload): Promise<Product> {
  return put<Product>(`/admin/products/${id}`, payload)
}

/**
 * 上下架（切换启用状态）
 */
export async function toggleProductStatus(id: string, isActive: boolean): Promise<Product> {
  return put<Product>(`/admin/products/${id}/status`, { isActive })
}

/**
 * 删除商品
 */
export async function deleteProduct(id: string): Promise<void> {
  return del<void>(`/admin/products/${id}`)
}
