<template>
  <div class="points-view">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>点位管理</h2>
        <p class="page-desc">管理景区文化点位、NFC 标签与二维码绑定</p>
      </div>
      <button class="btn btn-primary" :disabled="loading" @click="openModal('create')">
        <Plus :size="16" />
        新增点位
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar panel">
      <input
        v-model="filters.keyword"
        type="text"
        class="filter-input search-input"
        placeholder="搜索名称 / 地址 / NFC ID"
        @keyup.enter="search"
      />
      <select v-model="filters.status" class="filter-input">
        <option value="">全部状态</option>
        <option value="active">启用</option>
        <option value="inactive">停用</option>
      </select>
      <button class="btn btn-primary btn-sm" @click="search">
        <Search :size="14" />
        查询
      </button>
      <button class="btn btn-outline btn-sm" @click="resetFilters">
        <RotateCcw :size="14" />
        重置
      </button>
    </div>

    <!-- 加载态 -->
    <div v-if="loading" class="loading-box">
      <span class="spinner"></span>
      加载中...
    </div>

    <!-- 加载失败 -->
    <div v-else-if="loadError" class="error-box">
      <p>{{ loadError }}</p>
      <button class="btn btn-outline" @click="loadData">重试</button>
    </div>

    <!-- 列表 -->
    <div v-else class="table-wrap panel">
      <table class="point-table">
        <thead>
          <tr>
            <th>点位</th>
            <th>NFC 标签 ID</th>
            <th>地址</th>
            <th>状态</th>
            <th>创建时间</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="point in items" :key="point.id">
            <td>
              <div class="point-cell">
                <img v-if="point.image" :src="point.image" class="point-thumb" alt="" />
                <span v-else class="point-thumb placeholder">{{ point.name.charAt(0) }}</span>
                <div class="point-meta">
                  <div class="cell-name">{{ point.name }}</div>
                  <div class="cell-desc">{{ point.description || '—' }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="nfc-id">
                <code>{{ point.nfcTagId }}</code>
                <button
                  class="copy-btn"
                  :title="copiedId === point.nfcTagId ? '已复制' : '复制 NFC ID'"
                  @click="copyNfc(point)"
                >
                  <Check v-if="copiedId === point.nfcTagId" :size="12" />
                  <Copy v-else :size="12" />
                </button>
              </span>
            </td>
            <td class="cell-address">{{ point.address || '—' }}</td>
            <td>
              <span class="status-tag" :class="point.isActive ? 'on' : 'off'">
                {{ point.isActive ? '启用' : '停用' }}
              </span>
            </td>
            <td class="cell-time">{{ formatDate(point.createdAt) }}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" title="二维码绑定卡片" @click="openQrModal(point)">
                  <QrCode :size="15" />
                </button>
                <button class="icon-btn" title="编辑" @click="openModal('edit', point)">
                  <Pencil :size="15" />
                </button>
                <button
                  class="icon-btn"
                  :title="point.isActive ? '停用' : '启用'"
                  @click="toggleStatus(point)"
                >
                  <Power :size="15" />
                </button>
                <button class="icon-btn danger" title="删除" @click="removePoint(point)">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="6" class="empty-cell">
              <div class="empty-tip">暂无匹配的点位，试试调整筛选条件</div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <span class="pagination-info">
          共 {{ total }} 条 · 第 {{ page }} / {{ totalPages }} 页
        </span>
        <div class="pagination-btns">
          <button
            class="btn btn-outline btn-sm"
            :disabled="page <= 1"
            @click="changePage(page - 1)"
          >
            上一页
          </button>
          <button
            class="btn btn-outline btn-sm"
            :disabled="page >= totalPages"
            @click="changePage(page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- ── 新增 / 编辑模态框 ── -->
    <div v-if="modal.visible" class="modal-mask" @click.self="closeModal">
      <div class="modal-card wide">
        <div class="modal-header">
          <h3>{{ modal.title }}</h3>
          <button class="icon-btn" title="关闭" @click="closeModal">
            <X :size="16" />
          </button>
        </div>

        <form class="modal-form" @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-field">
              <label>点位名称 <em>*</em></label>
              <input v-model="form.name" type="text" placeholder="例如：凤凰山主入口" required />
            </div>
            <div class="form-field">
              <label>状态</label>
              <select v-model="form.isActive">
                <option :value="true">启用</option>
                <option :value="false">停用</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label>NFC 标签 ID <em>*</em></label>
            <div class="nfc-input-row">
              <input
                v-model="form.nfcTagId"
                type="text"
                placeholder="例如：NFC-8F3A2C11"
                required
              />
              <button
                type="button"
                class="btn btn-outline btn-sm"
                title="随机生成 NFC ID"
                @click="form.nfcTagId = randomNfcId()"
              >
                <RefreshCw :size="13" />
                生成
              </button>
            </div>
            <p class="field-tip">贴入已烧录的 NFC 标签 ID，或点击"生成"创建模拟 ID（8 位十六进制）</p>
          </div>

          <div class="form-field">
            <label>地址</label>
            <input v-model="form.address" type="text" placeholder="例如：福建宁德·凤凰山风景区入口" />
          </div>

          <div class="form-field">
            <label>描述</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="简要描述该点位的文化内容与打卡玩法"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="modal.saving">
              {{ modal.saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── 二维码绑定卡片 ── -->
    <div v-if="qrModal.visible" class="modal-mask" @click.self="closeQrModal">
      <div class="modal-card qr-card">
        <div class="modal-header">
          <h3>二维码绑定卡片</h3>
          <button class="icon-btn" title="关闭" @click="closeQrModal">
            <X :size="16" />
          </button>
        </div>

        <div class="qr-content-wrap">
          <div v-show="qrPoint" class="qr-body">
            <div class="qr-canvas-box">
              <canvas ref="qrCanvasRef" class="qr-canvas"></canvas>
            </div>
            <div class="qr-info">
              <div class="qr-info-name">{{ qrPoint?.name }}</div>
              <div class="qr-info-row">
                <span>地址</span>
                <p>{{ qrPoint?.address || '—' }}</p>
              </div>
              <div class="qr-info-row">
                <span>NFC ID</span>
                <p class="nfc-mono">{{ qrPoint?.nfcTagId }}</p>
              </div>
              <div class="qr-info-row">
                <span>绑定内容</span>
                <p class="qr-link">{{ qrContent }}</p>
              </div>
              <p class="qr-tip">访客扫码或近场感应后，将打开该点位对应的文化内容。导出二维码后可用于印刷张贴。</p>
            </div>
          </div>

          <div v-if="qrModal.loading" class="loading-box loading-overlay">
            <span class="spinner"></span>
            生成二维码中...
          </div>

          <div v-else-if="qrModal.error" class="error-box error-overlay">
            <p>{{ qrModal.error }}</p>
            <button class="btn btn-outline" @click="openQrModal(qrPoint!)">重试</button>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-outline" @click="closeQrModal">关闭</button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="qrModal.loading || !!qrModal.error"
            @click="exportQr"
          >
            <Download :size="14" />
            导出二维码
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  RotateCcw,
  QrCode,
  Power,
  Copy,
  Check,
  RefreshCw,
  Download,
} from 'lucide-vue-next'
import {
  getPoints,
  createPoint,
  updatePoint,
  togglePointStatus,
  deletePoint,
} from '@/api/points'
import type { Point, PointPayload } from '@/types/admin'

// ── 常量 ───────────────────────────────────────────────────────

const PAGE_SIZE = 8

// ── 状态 ───────────────────────────────────────────────────────

const loading = ref(true)
const loadError = ref('')

const items = ref<Point[]>([])
const total = ref(0)
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

/** 筛选条件（触发查询时同步到请求） */
const filters = reactive({
  keyword: '',
  status: '' as '' | 'active' | 'inactive',
})

// ── 模态框（新增 / 编辑） ─────────────────────────────────────

const modal = reactive({
  visible: false,
  mode: '' as 'create' | 'edit',
  title: '',
  saving: false,
})

const form = reactive({
  id: '',
  name: '',
  description: '',
  address: '',
  nfcTagId: '',
  isActive: false,
})

// ── 二维码卡片 ────────────────────────────────────────────────

const qrModal = reactive({
  visible: false,
  loading: false,
  error: '',
})
const qrPoint = ref<Point | null>(null)
const qrCanvasRef = ref<HTMLCanvasElement | null>(null)

/** NFC ID 复制反馈 */
const copiedId = ref('')

// ── 数据加载 ───────────────────────────────────────────────────

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await getPoints({
      page: page.value,
      pageSize: PAGE_SIZE,
      keyword: filters.keyword.trim() || undefined,
      status: filters.status || undefined,
    })
    items.value = result.items
    total.value = result.total
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '点位数据加载失败'
    console.error('[Points] 加载失败 →', error)
  } finally {
    loading.value = false
  }
}

/** 按当前筛选条件回到第 1 页查询 */
function search() {
  page.value = 1
  loadData()
}

function resetFilters() {
  filters.keyword = ''
  filters.status = ''
  search()
}

function changePage(target: number) {
  if (target < 1 || target > totalPages.value || target === page.value) return
  page.value = target
  loadData()
}

// ── 新增 / 编辑 ────────────────────────────────────────────────

function openModal(mode: 'create' | 'edit', point?: Point) {
  form.id = point?.id ?? ''
  form.name = point?.name ?? ''
  form.description = point?.description ?? ''
  form.address = point?.address ?? ''
  form.nfcTagId = point?.nfcTagId ?? ''
  form.isActive = point?.isActive ?? true

  modal.mode = mode
  modal.title = mode === 'create' ? '新增点位' : '编辑点位'
  modal.visible = true
}

/** 生成模拟 NFC 标签 ID：NFC- + 8 位十六进制 */
function randomNfcId(): string {
  const part = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0')
  return `NFC-${part()}${part()}`
}

async function submitForm() {
  const name = form.name.trim()
  const nfc = form.nfcTagId.trim()
  if (!name) {
    window.alert('请输入点位名称')
    return
  }
  if (!nfc) {
    window.alert('请输入 NFC 标签 ID')
    return
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9-]{2,31}$/.test(nfc)) {
    window.alert('NFC 标签 ID 格式不正确（3-32 位字母、数字或连字符）')
    return
  }

  modal.saving = true
  try {
    const payload: PointPayload = {
      name,
      description: form.description.trim(),
      address: form.address.trim(),
      nfcTagId: nfc,
      image: '',
      isActive: form.isActive,
    }
    if (modal.mode === 'create') {
      await createPoint(payload)
    } else {
      await updatePoint(form.id, payload)
    }
    closeModal()
    await loadData()
  } catch (error) {
    console.error('[Points] 保存失败 →', error)
    window.alert(error instanceof Error ? error.message : '保存失败，请重试')
  } finally {
    modal.saving = false
  }
}

// ── 启停 / 删除 ────────────────────────────────────────────────

async function toggleStatus(point: Point) {
  try {
    await togglePointStatus(point.id, !point.isActive)
    point.isActive = !point.isActive
  } catch (error) {
    console.error('[Points] 切换状态失败 →', error)
    window.alert(error instanceof Error ? error.message : '操作失败，请重试')
  }
}

async function removePoint(point: Point) {
  if (!window.confirm(`确定删除点位「${point.name}」吗？此操作不可恢复！`)) return
  try {
    await deletePoint(point.id)
    // 当前页删空则回退一页
    if (items.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await loadData()
  } catch (error) {
    console.error('[Points] 删除失败 →', error)
    window.alert(error instanceof Error ? error.message : '删除失败，请重试')
  }
}

// ── NFC ID 复制 ────────────────────────────────────────────────

async function copyNfc(point: Point) {
  const text = point.nfcTagId
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    copiedId.value = point.nfcTagId
    setTimeout(() => {
      if (copiedId.value === point.nfcTagId) copiedId.value = ''
    }, 1500)
  } catch {
    window.alert('复制失败，请手动复制')
  }
}

// ── 二维码绑定卡片 ────────────────────────────────────────────

/**
 * 点位 H5 页面根地址：
 * - 默认示例域名仅用于 Mock 演示
 * - 部署时可在 `.env` / `.env.development` 中配置
 *   `VITE_POINT_WEB_BASE=https://your-domain.com`，无需改动页面代码
 */
const POINT_WEB_BASE = import.meta.env.VITE_POINT_WEB_BASE || 'https://sheyun.example.com'

/** 二维码内容：点位直达链接（域名可配置） */
function buildQrContent(point: Point): string {
  return `${POINT_WEB_BASE}/p/${point.id}?nfc=${encodeURIComponent(point.nfcTagId)}`
}

const qrContent = computed(() => (qrPoint.value ? buildQrContent(qrPoint.value) : ''))

/** 动态加载 qrcode 库（node-qrcode 浏览器版 CDN，避免新增依赖） */
let qrLibPromise: Promise<void> | null = null

function loadQrLib(): Promise<void> {
  const win = window as unknown as { QRCode?: unknown }
  if (win.QRCode) return Promise.resolve()
  if (qrLibPromise) return qrLibPromise
  qrLibPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/qrcode.min.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      qrLibPromise = null
      reject(new Error('二维码库加载失败，请检查网络连接'))
    }
    document.head.appendChild(script)
  })
  return qrLibPromise
}

async function openQrModal(point: Point) {
  qrPoint.value = point
  qrModal.error = ''
  qrModal.loading = true
  qrModal.visible = true

  try {
    await loadQrLib()
    // 库加载完成，关闭 loading 让 canvas DOM 出现
    qrModal.loading = false
    await nextTick()
    await new Promise<void>((resolve) => {
      // 双 rAF 等待画布 DOM 渲染完成；resolve 需无参调用
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
    const win = window as unknown as {
      QRCode: { toCanvas: (el: HTMLCanvasElement, text: string, opts: unknown) => Promise<unknown> }
    }
    if (!qrCanvasRef.value) throw new Error('二维码画布未就绪')
    await win.QRCode.toCanvas(qrCanvasRef.value, buildQrContent(point), {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
  } catch (error) {
    qrModal.loading = false
    qrModal.error = error instanceof Error ? error.message : '二维码生成失败'
    console.error('[Points] 二维码生成失败 →', error)
  }
}

/** 导出二维码为 PNG 图片 */
function exportQr() {
  const canvas = qrCanvasRef.value
  if (!canvas || !qrPoint.value) return
  try {
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${qrPoint.value.name || 'point'}-${qrPoint.value.nfcTagId}.png`
    a.click()
  } catch (error) {
    console.error('[Points] 导出失败 →', error)
    window.alert('导出失败，请重试')
  }
}

function closeQrModal() {
  qrModal.visible = false
  qrModal.error = ''
  qrPoint.value = null
}

// ── 展示工具 ───────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function closeModal() {
  modal.visible = false
  modal.saving = false
}

// ── 生命周期 ───────────────────────────────────────────────────

onMounted(loadData)
</script>

<style scoped>
/* ── 页头 ────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 4px;
  font-size: 22px;
  color: var(--color-text);
}

.page-desc {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* ── 通用按钮（与图鉴页一致） ───────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light, #a53050));
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-outline {
  color: var(--color-primary);
  background: transparent;
  border: 1px solid var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background: rgba(139, 30, 63, 0.06);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

/* ── 面板 / 加载 / 错误 ──────────────────────────────────── */
.panel {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px 20px;
}

.loading-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 48px 0;
  justify-content: center;
  color: var(--color-text-secondary);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: #c62828;
}

/* ── 筛选栏 ──────────────────────────────────────────────── */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.filter-input {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text);
  background: var(--color-bg, #f8f8f8);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.filter-input:focus {
  border-color: var(--color-primary);
}

.search-input {
  flex: 1;
  min-width: 180px;
  max-width: 280px;
}

/* ── 表格 ────────────────────────────────────────────────── */
.table-wrap {
  overflow: hidden;
}

.point-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.point-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(139, 30, 63, 0.04);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.point-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.point-table tbody tr {
  transition: background 0.15s;
}

.point-table tbody tr:hover {
  background: rgba(139, 30, 63, 0.03);
}

.col-actions {
  width: 140px;
}

/* 点位单元格 */
.point-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
}

.point-thumb {
  width: 52px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
  flex-shrink: 0;
}

.point-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--color-primary), #a53050);
}

.point-meta {
  min-width: 0;
}

.cell-name {
  font-weight: 600;
  color: var(--color-text);
}

.cell-desc {
  font-size: 11px;
  color: var(--color-text-secondary);
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* NFC ID */
.nfc-id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.nfc-id code {
  font-family: Consolas, Menlo, Monaco, monospace;
  font-size: 12px;
  color: var(--color-primary);
  background: rgba(139, 30, 63, 0.08);
  padding: 2px 8px;
  border-radius: 5px;
  white-space: nowrap;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.copy-btn:hover {
  background: rgba(139, 30, 63, 0.08);
  color: var(--color-primary);
}

.copy-btn .lucide-check {
  color: #2e7d32;
}

.cell-address {
  color: var(--color-text-secondary);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 状态标签 */
.status-tag {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 99px;
  white-space: nowrap;
}

.status-tag.on {
  color: #2e7d32;
  background: rgba(46, 125, 50, 0.1);
}

.status-tag.off {
  color: #757575;
  background: rgba(117, 117, 117, 0.1);
}

.cell-time {
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.row-actions {
  display: flex;
  gap: 4px;
}

.empty-cell {
  padding: 24px !important;
}

.empty-tip {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 12px 0;
}

/* ── 图标按钮 ────────────────────────────────────────────── */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.icon-btn:hover {
  background: rgba(139, 30, 63, 0.08);
  color: var(--color-primary);
}

.icon-btn.danger:hover {
  background: rgba(229, 57, 53, 0.08);
  color: #c62828;
}

/* ── 分页 ────────────────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-info {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.pagination-btns {
  display: flex;
  gap: 8px;
}

/* ── 模态框 ──────────────────────────────────────────────── */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.modal-card {
  width: 440px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  padding: 24px;
  background: var(--color-surface);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-card.wide {
  width: 560px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  color: var(--color-text);
}

/* ── 表单 ────────────────────────────────────────────────── */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.form-field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-field label em {
  color: #e53935;
  font-style: normal;
}

.form-field input,
.form-field textarea,
.form-field select {
  width: 100%;
  padding: 9px 12px;
  font-size: 14px;
  color: var(--color-text);
  background: var(--color-bg, #f8f8f8);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 30, 63, 0.1);
}

.form-row {
  display: flex;
  gap: 12px;
}

.nfc-input-row {
  display: flex;
  gap: 8px;
}

.nfc-input-row input {
  flex: 1;
}

.field-tip {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

/* ── 二维码卡片 ──────────────────────────────────────────── */
.qr-card {
  width: 620px;
}

.qr-content-wrap {
  position: relative;
  min-height: 200px;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  inset: 0;
  background: var(--color-surface);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 10px;
}

.qr-body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.qr-canvas-box {
  flex-shrink: 0;
  width: 224px;
  height: 224px;
  padding: 8px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-canvas {
  width: 220px;
  height: 220px;
  display: block;
}

.qr-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qr-info-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.qr-info-row {
  display: flex;
  gap: 10px;
  font-size: 13px;
}

.qr-info-row span {
  flex-shrink: 0;
  width: 56px;
  color: var(--color-text-secondary);
}

.qr-info-row p {
  margin: 0;
  color: var(--color-text);
  word-break: break-all;
  min-width: 0;
}

.qr-info-row .nfc-mono {
  font-family: Consolas, Menlo, Monaco, monospace;
  font-size: 12px;
  color: var(--color-primary);
}

.qr-info-row .qr-link {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.qr-tip {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* ── 响应式 ──────────────────────────────────────────────── */
@media (max-width: 860px) {
  .table-wrap {
    overflow-x: auto;
  }

  .point-table {
    min-width: 780px;
  }

  .form-row {
    flex-direction: column;
  }

  .qr-body {
    flex-direction: column;
    align-items: center;
  }

  .qr-info {
    width: 100%;
  }
}
</style>
