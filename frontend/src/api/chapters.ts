import { get, post, put, del } from './http'
import type { ChapterPayload, ChapterWithLevels, Level, LevelPayload } from '@/types/admin'

// ── 归一化兜底 ─────────────────────────────────────────────────
// 后端返回 null / 缺字段 / 空数组时，统一补成安全默认值，
// 保证页面空数据时展示空列表，不出现报错崩溃。

/** 安全数字：undefined / null / NaN / 非法字符串一律归 0 */
function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 关卡归一化：缺字段补默认值 */
function normalizeLevel(level: Partial<Level> | null | undefined): Level {
  const l = level ?? {}
  return {
    id: l.id == null ? '' : String(l.id),
    chapterId: l.chapterId == null ? '' : String(l.chapterId),
    title: l.title == null ? '' : String(l.title),
    description: l.description == null ? '' : String(l.description),
    order: num(l.order),
    isPublished: Boolean(l.isPublished),
    createdAt: l.createdAt == null ? '' : String(l.createdAt),
  }
}

/** 章节归一化：缺字段补默认值，levels 保证为数组 */
function normalizeChapter(chapter: Partial<ChapterWithLevels> | null | undefined): ChapterWithLevels {
  const c = chapter ?? {}
  return {
    id: c.id == null ? '' : String(c.id),
    title: c.title == null ? '' : String(c.title),
    subtitle: c.subtitle == null ? '' : String(c.subtitle),
    order: num(c.order),
    isPublished: Boolean(c.isPublished),
    createdAt: c.createdAt == null ? '' : String(c.createdAt),
    levels: Array.isArray(c.levels) ? c.levels.map(normalizeLevel) : [],
  }
}

/**
 * 获取全部章节（含关卡列表）
 * 后端返回 null / 非数组时自动兜底为空列表。
 */
export async function getChapters(): Promise<ChapterWithLevels[]> {
  const data = await get<Partial<ChapterWithLevels>[] | null>('/admin/chapters')
  return Array.isArray(data) ? data.map(normalizeChapter) : []
}

/**
 * 新增章节
 */
export async function createChapter(payload: ChapterPayload): Promise<ChapterWithLevels> {
  return await post<ChapterWithLevels>('/admin/chapters', payload)
}

/**
 * 更新章节
 */
export async function updateChapter(id: string, payload: Partial<ChapterPayload>): Promise<ChapterWithLevels> {
  return await put<ChapterWithLevels>(`/admin/chapters/${id}`, payload)
}

/**
 * 删除章节（级联删除其下所有关卡）
 */
export async function deleteChapter(id: string): Promise<void> {
  await del(`/admin/chapters/${id}`)
}

/**
 * 新增关卡
 */
export async function createLevel(chapterId: string, payload: LevelPayload): Promise<Level> {
  return await post<Level>(`/admin/chapters/${chapterId}/levels`, payload)
}

/**
 * 更新关卡
 */
export async function updateLevel(id: string, payload: Partial<LevelPayload>): Promise<Level> {
  return await put<Level>(`/admin/levels/${id}`, payload)
}

/**
 * 删除关卡
 */
export async function deleteLevel(id: string): Promise<void> {
  await del(`/admin/levels/${id}`)
}
