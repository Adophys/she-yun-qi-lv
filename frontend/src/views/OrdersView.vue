<template>
  <div class="orders-view">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>订单管理</h2>
        <p class="page-desc">查看商城订单并处理发货、完成等状态流转</p>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar panel">
      <input
        v-model="filters.keyword"
        type="text"
        class="filter-input search-input"
        placeholder="搜索订单号 / 买家 / 手机号"
        @keyup.enter="search"
      />
      <select v-model="filters.status" class="filter-input">
        <option value="">全部状态</option>
        <option v-for="(label, key) in ORDER_STATUS_TEXT" :key="key" :value="key">{{ label }}</option>
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
      <table class="item-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>买家</th>
            <th>商品</th>
            <th>订单金额</th>
            <th>状态</th>
            <th>下单时间</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>
              <div class="cell-order-no">{{ order.orderNo }}</div>
            </td>
            <td>
              <div class="cell-name">{{ order.buyerName }}</div>
              <div class="cell-pinyin">{{ order.buyerPhone }}</div>
            </td>
            <td>
              <div class="cell-items">
                <span class="item-count">{{ order.items.length }} 种商品</span>
                <span class="item-total">共 {{ orderTotalQuantity(order) }} 件</span>
              </div>
            </td>
            <td>
              <div class="cell-amount">{{ formatPrice(order.totalAmount) }}</div>
            </td>
            <td>
              <span class="status-tag" :class="`st-${order.status}`">
                {{ statusText(order.status) }}
              </span>
            </td>
            <td class="cell-time">{{ formatDateTime(order.createdAt) }}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" title="查看详情" @click="openDetail(order)">
                  <Eye :size="15" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="orders.length === 0">
            <td colspan="7" class="empty-cell">
              <div class="empty-tip">暂无匹配的订单，试试调整筛选条件</div>
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

    <!-- ── 订单详情模态框 ── -->
    <div v-if="detail.visible" class="modal-mask" @click.self="closeDetail">
      <div class="modal-card wide">
        <div class="modal-header">
          <h3>订单详情</h3>
          <button class="icon-btn" title="关闭" @click="closeDetail">
            <X :size="16" />
          </button>
        </div>

        <div v-if="detail.loading" class="detail-loading">
          <span class="spinner"></span>
          加载中...
        </div>

        <div v-else-if="detail.order" class="detail-body">
          <!-- 基本信息 -->
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">订单号</span>
              <span class="detail-value mono">{{ detail.order.orderNo }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">订单状态</span>
              <span>
                <span class="status-tag" :class="`st-${detail.order.status}`">
                  {{ statusText(detail.order.status) }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">下单时间</span>
              <span class="detail-value">{{ formatDateTime(detail.order.createdAt) }}</span>
            </div>
          </div>

          <!-- 买家信息 -->
          <div class="detail-section">
            <h4>买家信息</h4>
            <div class="detail-row">
              <span class="detail-label">买家</span>
              <span class="detail-value">{{ detail.order.buyerName }}（{{ detail.order.buyerPhone }}）</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">收货地址</span>
              <span class="detail-value">{{ detail.order.address || '—' }}</span>
            </div>
          </div>

          <!-- 商品明细 -->
          <div class="detail-section">
            <h4>商品明细</h4>
            <div v-if="detail.order.items.length === 0" class="empty-tip">
              该订单暂无商品明细
            </div>
            <div v-for="item in detail.order.items" :key="item.productId" class="detail-item">
              <img :src="item.productImage" class="detail-item-img" alt="" />
              <div class="detail-item-info">
                <div class="detail-item-name">{{ item.productName }}</div>
                <div class="detail-item-meta">
                  ¥{{ item.price.toFixed(2) }} × {{ item.quantity }}
                </div>
              </div>
              <div class="detail-item-subtotal">
                ¥{{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- 金额合计 -->
          <div class="detail-total">
            <span>合计金额</span>
            <span class="detail-total-amount">{{ formatPrice(detail.order.totalAmount) }}</span>
          </div>

          <!-- 状态流转 -->
          <div v-if="detail.actions.length > 0" class="detail-actions">
            <button
              v-for="action in detail.actions"
              :key="action.status"
              class="btn"
              :class="action.status === 'cancelled' ? 'btn-danger' : 'btn-primary'"
              :disabled="detail.saving"
              @click="handleStatusAction(action.status)"
            >
              {{ action.label }}
            </button>
          </div>
          <p v-else class="terminal-tip">订单已到终态，无需操作</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Eye, X, Search, RotateCcw } from 'lucide-vue-next'
import { getOrders, getOrderDetail, updateOrderStatus } from '@/api/orders'
import { ORDER_STATUS_TEXT, ORDER_TRANSITIONS } from '@/types/admin'
import type { Order, OrderStatus } from '@/types/admin'

// ── 常量 ───────────────────────────────────────────────────────

const PAGE_SIZE = 8

// ── 状态 ───────────────────────────────────────────────────────

const loading = ref(true)
const loadError = ref('')

const orders = ref<Order[]>([])
const total = ref(0)
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

/** 筛选条件（触发查询时同步到请求） */
const filters = reactive({
  keyword: '',
  status: '' as OrderStatus | '',
})

// ── 详情弹窗 ───────────────────────────────────────────────────

const detail = reactive({
  visible: false,
  loading: false,
  order: null as Order | null,
  saving: false,
  /** 当前订单可执行的流转动作 */
  actions: [] as { status: OrderStatus; label: string }[],
})

// ── 数据加载 ───────────────────────────────────────────────────

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await getOrders({
      page: page.value,
      pageSize: PAGE_SIZE,
      keyword: filters.keyword.trim() || undefined,
      status: filters.status || undefined,
    })
    orders.value = result.items
    total.value = result.total
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '订单数据加载失败'
    console.error('[Orders] 加载失败 →', error)
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

// ── 详情 ───────────────────────────────────────────────────────

async function openDetail(order: Order) {
  detail.visible = true
  detail.loading = true
  detail.order = null
  detail.actions = []
  try {
    const full = await getOrderDetail(order.id)
    detail.order = full
    detail.actions = ORDER_TRANSITIONS[full.status] ?? []
  } catch (error) {
    console.error('[Orders] 详情加载失败 →', error)
    // 接口失败时用列表数据兜底展示
    detail.order = order
    detail.actions = ORDER_TRANSITIONS[order.status] ?? []
  } finally {
    detail.loading = false
  }
}

function closeDetail() {
  detail.visible = false
  detail.order = null
  detail.actions = []
}

/** 执行订单状态流转 */
async function handleStatusAction(status: OrderStatus) {
  if (!detail.order) return
  detail.saving = true
  try {
    await updateOrderStatus(detail.order.id, status)
    // 更新本地状态并刷新列表
    const target = ORDER_TRANSITIONS[status] ?? []
    detail.order.status = status
    detail.order.updatedAt = new Date().toISOString()
    detail.actions = target
    await loadData()
  } catch (error) {
    console.error('[Orders] 状态流转失败 →', error)
  } finally {
    detail.saving = false
  }
}

// ── 展示工具 ───────────────────────────────────────────────────

/** 状态文案：从类型契约层取，未知状态兜底显示原始值 */
function statusText(status: OrderStatus): string {
  return ORDER_STATUS_TEXT[status] ?? status
}

function orderTotalQuantity(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

function formatPrice(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
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

/* ── 通用按钮（与图鉴/点位页一致） ──────────────────────── */
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

.btn-danger {
  color: #c62828;
  background: transparent;
  border: 1px solid #e57373;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(229, 57, 53, 0.06);
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
  max-width: 260px;
}

/* ── 表格 ────────────────────────────────────────────────── */
.table-wrap {
  overflow: hidden;
}

.item-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.item-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(139, 30, 63, 0.04);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.item-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.item-table tbody tr {
  transition: background 0.15s;
}

.item-table tbody tr:hover {
  background: rgba(139, 30, 63, 0.03);
}

.col-actions {
  width: 80px;
}

.cell-order-no {
  font-weight: 600;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cell-name {
  font-weight: 600;
  color: var(--color-text);
}

.cell-pinyin {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.cell-items {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
}

.item-count {
  color: var(--color-text);
}

.item-total {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.cell-amount {
  font-weight: 600;
  color: #c62828;
  white-space: nowrap;
}

.status-tag {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 99px;
  white-space: nowrap;
}

.st-pending {
  color: #ef6c00;
  background: rgba(239, 108, 0, 0.1);
}

.st-paid {
  color: #1565c0;
  background: rgba(21, 101, 192, 0.1);
}

.st-shipped {
  color: #6a1b9a;
  background: rgba(106, 27, 154, 0.1);
}

.st-completed {
  color: #2e7d32;
  background: rgba(46, 125, 50, 0.1);
}

.st-cancelled {
  color: #757575;
  background: rgba(117, 117, 117, 0.1);
}

.cell-time {
  color: var(--color-text-secondary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.row-actions {
  display: flex;
  gap: 4px;
}

.empty-cell {
  padding: 24px !important;
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
  width: 560px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  padding: 24px;
  background: var(--color-surface);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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

/* ── 详情内容 ────────────────────────────────────────────── */
.detail-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 40px 0;
  justify-content: center;
  color: var(--color-text-secondary);
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-section h4 {
  margin: 0 0 2px;
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
}

.detail-label {
  flex: 0 0 76px;
  color: var(--color-text-secondary);
}

.detail-value {
  color: var(--color-text);
  flex: 1;
}

.detail-value.mono {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--color-border);
}

.detail-item:last-of-type {
  border-bottom: none;
}

.detail-item-img {
  width: 44px;
  height: 34px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.detail-item-info {
  flex: 1;
  min-width: 0;
}

.detail-item-name {
  font-size: 13px;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-item-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.detail-item-subtotal {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.detail-total {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.detail-total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #c62828;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.terminal-tip {
  margin: 0;
  text-align: right;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* ── 响应式 ──────────────────────────────────────────────── */
@media (max-width: 860px) {
  .table-wrap {
    overflow-x: auto;
  }

  .item-table {
    min-width: 780px;
  }
}
</style>
