<template>
  <div class="products-view">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>商品管理</h2>
        <p class="page-desc">管理商城在售的畲族文创商品</p>
      </div>
      <button class="btn btn-primary" :disabled="loading" @click="openModal('create')">
        <Plus :size="16" />
        新增商品
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar panel">
      <input
        v-model="filters.keyword"
        type="text"
        class="filter-input search-input"
        placeholder="搜索名称 / 分类"
        @keyup.enter="search"
      />
      <select v-model="filters.category" class="filter-input">
        <option value="">全部分类</option>
        <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="filters.status" class="filter-input">
        <option value="">全部状态</option>
        <option value="active">已上架</option>
        <option value="inactive">已下架</option>
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
            <th>商品</th>
            <th>名称</th>
            <th>分类</th>
            <th>售价</th>
            <th>库存</th>
            <th>销量</th>
            <th>状态</th>
            <th>创建时间</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <img :src="product.image" class="thumb" alt="" />
            </td>
            <td>
              <div class="cell-name">{{ product.name }}</div>
              <div class="cell-pinyin">{{ product.description || '—' }}</div>
            </td>
            <td>
              <span class="chip chip-category">{{ product.category }}</span>
            </td>
            <td>
              <div class="cell-price">{{ formatPrice(product.price) }}</div>
              <div v-if="product.originalPrice > product.price" class="cell-origin">
                <del>{{ formatPrice(product.originalPrice) }}</del>
              </div>
            </td>
            <td>
              <span :class="['stock-num', product.stock <= 10 ? 'stock-low' : '']">
                {{ product.stock.toLocaleString() }}
              </span>
            </td>
            <td class="cell-sales">{{ product.sales.toLocaleString() }}</td>
            <td>
              <span class="status-tag" :class="product.isActive ? 'on' : 'off'">
                {{ product.isActive ? '已上架' : '已下架' }}
              </span>
            </td>
            <td class="cell-time">{{ formatDate(product.createdAt) }}</td>
            <td>
              <div class="row-actions">
                <button
                  class="icon-btn"
                  :title="product.isActive ? '下架' : '上架'"
                  @click="toggleStatus(product)"
                >
                  <component :is="product.isActive ? EyeOff : Eye" :size="15" />
                </button>
                <button class="icon-btn" title="编辑" @click="openModal('edit', product)">
                  <Pencil :size="15" />
                </button>
                <button class="icon-btn danger" title="删除" @click="removeProduct(product)">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td colspan="9" class="empty-cell">
              <div class="empty-tip">暂无匹配的商品，试试调整筛选条件</div>
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
              <label>商品名称 <em>*</em></label>
              <input v-model="form.name" type="text" placeholder="例如：凤凰装刺绣丝巾" required />
            </div>
            <div class="form-field">
              <label>分类 <em>*</em></label>
              <input
                v-model="form.category"
                type="text"
                list="product-category-options"
                placeholder="选择或输入分类"
                required
              />
              <datalist id="product-category-options">
                <option v-for="c in categoryOptions" :key="c" :value="c" />
              </datalist>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>售价（元）<em>*</em></label>
              <input v-model.number="form.price" type="number" min="0" step="0.01" placeholder="0.00" required />
            </div>
            <div class="form-field">
              <label>划线原价（元）</label>
              <input v-model.number="form.originalPrice" type="number" min="0" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>库存 <em>*</em></label>
              <input v-model.number="form.stock" type="number" min="0" step="1" placeholder="0" required />
            </div>
            <div class="form-field">
              <label>状态</label>
              <select v-model="form.isActive">
                <option :value="true">上架</option>
                <option :value="false">下架</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label>描述</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="简要描述商品材质、工艺与特色"
            ></textarea>
          </div>

          <div class="form-field">
            <label>图片</label>
            <div class="upload-box" @click="pickFile">
              <img v-if="form.image" :src="form.image" class="upload-preview" alt="图片预览" />
              <div v-else class="upload-placeholder">
                <Upload :size="22" />
                <span>点击选择图片（≤ 5MB）</span>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="upload-input"
                @change="handleFileChange"
              />
            </div>
            <div v-if="form.image" class="upload-actions">
              <button type="button" class="btn btn-outline btn-sm" @click="pickFile">更换图片</button>
              <button type="button" class="btn btn-danger btn-sm" @click="form.image = ''">移除</button>
            </div>
            <p v-if="uploading" class="uploading-tip">
              <span class="spinner"></span>
              上传中...
            </p>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="modal.saving || uploading">
              {{ modal.saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Search, RotateCcw, Upload } from 'lucide-vue-next'
import {
  getProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} from '@/api/products'
import { uploadImage } from '@/api/culturalItems'
import type { Product, ProductPayload } from '@/types/admin'

// ── 常量 ───────────────────────────────────────────────────────

const PAGE_SIZE = 8

// ── 状态 ───────────────────────────────────────────────────────

const loading = ref(true)
const loadError = ref('')

const products = ref<Product[]>([])
const total = ref(0)
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

/**
 * 分类下拉选项：从列表数据中动态提取去重，不写死分类。
 * 空数据时自动为空列表（下拉只剩"全部分类"）；
 * 对接后端后自动跟随真实分类，无需改动页面代码。
 */
const categoryOptions = computed<string[]>(() => {
  return Array.from(new Set(products.value.map((p) => p.category).filter(Boolean)))
})

/** 筛选条件（触发查询时同步到请求） */
const filters = reactive({
  keyword: '',
  category: '',
  status: '' as '' | 'active' | 'inactive',
})

// ── 模态框 ─────────────────────────────────────────────────────

const modal = reactive({
  visible: false,
  mode: '' as 'create' | 'edit',
  title: '',
  saving: false,
})

const form = reactive({
  id: '',
  name: '',
  category: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  description: '',
  image: '',
  isActive: false,
})

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

// ── 数据加载 ───────────────────────────────────────────────────

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await getProducts({
      page: page.value,
      pageSize: PAGE_SIZE,
      keyword: filters.keyword.trim() || undefined,
      category: filters.category || undefined,
      status: filters.status || undefined,
    })
    products.value = result.items
    total.value = result.total
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '商品数据加载失败'
    console.error('[Products] 加载失败 →', error)
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
  filters.category = ''
  filters.status = ''
  search()
}

function changePage(target: number) {
  if (target < 1 || target > totalPages.value || target === page.value) return
  page.value = target
  loadData()
}

// ── 新增 / 编辑 ────────────────────────────────────────────────

function openModal(mode: 'create' | 'edit', item?: Product) {
  form.id = item?.id ?? ''
  form.name = item?.name ?? ''
  form.category = item?.category ?? ''
  form.price = item?.price ?? 0
  form.originalPrice = item?.originalPrice ?? 0
  form.stock = item?.stock ?? 0
  form.description = item?.description ?? ''
  form.image = item?.image ?? ''
  form.isActive = item?.isActive ?? false

  modal.mode = mode
  modal.title = mode === 'create' ? '新增商品' : '编辑商品'
  modal.visible = true
}

async function submitForm() {
  if (!form.name.trim() || !form.category.trim()) return
  modal.saving = true
  try {
    const payload: ProductPayload = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: form.price,
      originalPrice: form.originalPrice || form.price,
      stock: form.stock,
      image: form.image,
      description: form.description.trim(),
      isActive: form.isActive,
    }
    if (modal.mode === 'create') {
      await createProduct(payload)
    } else {
      await updateProduct(form.id, payload)
    }
    closeModal()
    await loadData()
  } catch (error) {
    console.error('[Products] 保存失败 →', error)
  } finally {
    modal.saving = false
  }
}

// ── 上下架 / 删除 ──────────────────────────────────────────────

async function toggleStatus(product: Product) {
  try {
    await toggleProductStatus(product.id, !product.isActive)
    product.isActive = !product.isActive
  } catch (error) {
    console.error('[Products] 切换状态失败 →', error)
  }
}

async function removeProduct(product: Product) {
  if (!window.confirm(`确定删除「${product.name}」吗？此操作不可恢复！`)) return
  try {
    await deleteProduct(product.id)
    // 当前页删空则回退一页
    if (products.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await loadData()
  } catch (error) {
    console.error('[Products] 删除失败 →', error)
  }
}

// ── 图片上传 ───────────────────────────────────────────────────

function pickFile() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // 允许重复选择同一文件
  if (!file) return

  if (!file.type.startsWith('image/')) {
    window.alert('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    window.alert('图片大小不能超过 5MB')
    return
  }

  uploading.value = true
  try {
    const result = await uploadImage(file)
    form.image = result.url
  } catch (error) {
    console.error('[Products] 上传失败 →', error)
    window.alert(error instanceof Error ? error.message : '图片上传失败')
  } finally {
    uploading.value = false
  }
}

// ── 展示工具 ───────────────────────────────────────────────────

function formatPrice(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

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
  width: 120px;
}

.thumb {
  width: 52px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

.cell-name {
  font-weight: 600;
  color: var(--color-text);
}

.cell-pinyin {
  font-size: 11px;
  color: var(--color-text-secondary);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 12px;
  white-space: nowrap;
}

.chip-category {
  color: var(--color-primary);
  background: rgba(139, 30, 63, 0.08);
}

.cell-price {
  font-weight: 600;
  color: #c62828;
  white-space: nowrap;
}

.cell-origin {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.stock-num {
  font-weight: 500;
}

.stock-num.stock-low {
  color: #e65100;
}

.cell-sales {
  color: var(--color-text-secondary);
}

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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

/* ── 图片上传 ────────────────────────────────────────────── */
.upload-box {
  position: relative;
  width: 100%;
  height: 150px;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.upload-box:hover {
  border-color: var(--color-primary);
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.upload-input {
  display: none;
}

.upload-actions {
  display: flex;
  gap: 8px;
}

.uploading-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* ── 响应式 ──────────────────────────────────────────────── */
@media (max-width: 860px) {
  .table-wrap {
    overflow-x: auto;
  }

  .item-table {
    min-width: 880px;
  }

  .form-row {
    flex-direction: column;
  }
}
</style>
