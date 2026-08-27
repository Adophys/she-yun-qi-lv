import { get, post, put, del } from './http'
import type {
  CulturalItem,
  CulturalItemPage,
  CulturalItemPayload,
  CulturalItemQuery,
  UploadResult,
} from '@/types/admin'

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

/** 图鉴条目归一化：缺字段补默认值 */
function normalizeItem(item: Partial<CulturalItem> | null | undefined): CulturalItem {
  const i = item ?? {}
  return {
    id: i.id == null ? '' : String(i.id),
    name: i.name == null ? '' : String(i.name),
    pinyin: i.pinyin == null ? '' : String(i.pinyin),
    category: i.category == null ? '' : String(i.category),
    rarity: i.rarity == null ? '' : String(i.rarity),
    origin: i.origin == null ? '' : String(i.origin),
    description: i.description == null ? '' : String(i.description),
    image: i.image == null ? '' : String(i.image),
    viewCount: num(i.viewCount),
    isPublished: Boolean(i.isPublished),
    createdAt: i.createdAt == null ? '' : String(i.createdAt),
    updatedAt: i.updatedAt == null ? '' : String(i.updatedAt),
  }
}

/** 分页结果归一化：空数据返回空列表 + 0 总数 */
function normalizePage(data: Partial<CulturalItemPage> | null | undefined): CulturalItemPage {
  const d = data ?? {}
  return {
    items: Array.isArray(d.items) ? d.items.map(normalizeItem) : [],
    total: num(d.total),
    page: num(d.page) || 1,
    pageSize: num(d.pageSize) || 10,
  }
}

/**
 * 分页查询文化图鉴（支持关键词 / 分类 / 稀有度 / 上下架筛选）
 * 后端无数据时自动兜底为空列表与 0 总数。
 */
export async function getItems(query: CulturalItemQuery): Promise<CulturalItemPage> {
  const qs = buildQuery({
    page: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword,
    category: query.category,
    rarity: query.rarity,
    status: query.status,
  })
  const data = await get<Partial<CulturalItemPage> | null>(`/admin/cultural-items${qs}`)
  return normalizePage(data)
}

/**
 * 获取单个图鉴详情
 * 后端返回 null / 缺字段时自动兜底为空条目。
 */
export async function getItemDetail(id: string): Promise<CulturalItem> {
  const data = await get<Partial<CulturalItem> | null>(`/admin/cultural-items/${id}`)
  return normalizeItem(data)
}

/**
 * 新增图鉴
 */
export async function createItem(payload: CulturalItemPayload): Promise<CulturalItem> {
  return post<CulturalItem>('/admin/cultural-items', payload)
}

/**
 * 编辑图鉴
 */
export async function updateItem(id: string, payload: CulturalItemPayload): Promise<CulturalItem> {
  return put<CulturalItem>(`/admin/cultural-items/${id}`, payload)
}

/**
 * 上下架（切换发布状态）
 */
export async function toggleItemStatus(id: string, isPublished: boolean): Promise<CulturalItem> {
  return put<CulturalItem>(`/admin/cultural-items/${id}/status`, { isPublished })
}

/**
 * 删除图鉴
 */
export async function deleteItem(id: string): Promise<void> {
  return del<void>(`/admin/cultural-items/${id}`)
}

/** 读取文件为 Data URL */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

/**
 * 上传图片
 * Mock 阶段：前端转 base64 走 JSON 上传；
 * 后端就绪后：可将此处替换为 FormData 的 multipart 上传。
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const data = await readFileAsDataURL(file)
  return post<UploadResult>('/admin/upload/image', {
    filename: file.name,
    data,
  })
}
