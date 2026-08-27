<template>
  <div class="users-view">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>用户管理</h2>
        <p class="page-desc">管理后台的管理员账号、角色与登录权限</p>
      </div>
      <button class="btn btn-primary" :disabled="loading" @click="openModal('create')">
        <Plus :size="16" />
        新增账号
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar panel">
      <input
        v-model="filters.keyword"
        type="text"
        class="filter-input search-input"
        placeholder="搜索账号 / 姓名 / 手机号"
        @keyup.enter="search"
      />
      <select v-model="filters.status" class="filter-input">
        <option value="">全部状态</option>
        <option value="active">已启用</option>
        <option value="inactive">已禁用</option>
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
      <table class="user-table">
        <thead>
          <tr>
            <th>账号</th>
            <th>真实姓名</th>
            <th>手机号</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visibleAccounts" :key="item.id">
            <td>
              <div class="cell-name">{{ item.username }}</div>
              <div class="cell-sub">{{ item.id }}</div>
            </td>
            <td>
              <div class="cell-user">
                <span class="mini-avatar">{{ avatarChar(item.realName) }}</span>
                <span>{{ item.realName || '—' }}</span>
              </div>
            </td>
            <td class="cell-phone">{{ item.phone || '—' }}</td>
            <td>
              <span class="chip" :class="`role-${item.role}`">
                {{ roleText(item.role) }}
              </span>
            </td>
            <td>
              <span class="status-tag" :class="item.isActive ? 'on' : 'off'">
                {{ item.isActive ? '已启用' : '已禁用' }}
              </span>
            </td>
            <td class="cell-time">{{ formatDate(item.createdAt) }}</td>
            <td>
              <div class="row-actions">
                <button
                  class="icon-btn"
                  :disabled="item.role === 'super_admin'"
                  :title="
                    item.role === 'super_admin'
                      ? '超级管理员不由本页面管辖'
                      : item.isActive
                        ? '禁用账号'
                        : '启用账号'
                  "
                  @click="toggleStatus(item)"
                >
                  <component :is="item.isActive ? UserX : UserCheck" :size="15" />
                </button>
                <button
                  class="icon-btn"
                  :disabled="item.role === 'super_admin'"
                  :title="item.role === 'super_admin' ? '超级管理员不由本页面管辖' : '编辑'"
                  @click="openModal('edit', item)"
                >
                  <Pencil :size="15" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="visibleAccounts.length === 0">
            <td colspan="7" class="empty-cell">
              <div class="empty-tip">暂无数据</div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <span class="pagination-info">
          共 {{ visibleTotal }} 条 · 第 {{ page }} / {{ totalPages }} 页
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
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ modal.title }}</h3>
          <button class="icon-btn" title="关闭" @click="closeModal">
            <X :size="16" />
          </button>
        </div>

        <form class="modal-form" @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-field">
              <label>登录账号 <em>*</em></label>
              <input
                v-model="form.username"
                type="text"
                placeholder="例如：lei.xiaoyun"
                required
              />
            </div>
            <div class="form-field">
              <label>真实姓名 <em>*</em></label>
              <input v-model="form.realName" type="text" placeholder="例如：雷晓云" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>手机号 <em>*</em></label>
              <input
                v-model="form.phone"
                type="tel"
                maxlength="11"
                placeholder="11 位手机号"
                required
              />
            </div>
            <div class="form-field">
              <label>角色 <em>*</em></label>
              <select v-model="form.role" :disabled="isSuperEditing">
                <option v-if="isSuperEditing" :value="form.role">
                  {{ roleText(form.role) }}
                </option>
                <option v-for="(label, value) in roleOptions" :key="value" :value="value">
                  {{ label }}
                </option>
              </select>
              <span v-if="isSuperEditing" class="form-tip">
                超级管理员不由本页面管辖，仅可查看
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>
                登录密码 <em v-if="modal.mode === 'create'">*</em>
              </label>
              <input
                v-model="form.password"
                type="text"
                :placeholder="modal.mode === 'create' ? '至少 6 位' : '留空表示不修改密码'"
                :required="modal.mode === 'create'"
              />
            </div>
            <div class="form-field">
              <label>状态</label>
              <select v-model="form.isActive">
                <option :value="true">启用</option>
                <option :value="false">禁用</option>
              </select>
            </div>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Pencil, X, Search, RotateCcw, UserCheck, UserX } from 'lucide-vue-next'
import {
  getAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  toggleAdminAccountStatus,
} from '@/api/adminUsers'
import type { AdminAccount, AdminAccountPayload, AdminRole } from '@/types/admin'
import { ADMIN_ROLES } from '@/types/admin'

// ── 常量 ───────────────────────────────────────────────────────

const PAGE_SIZE = 8

// ── 状态 ───────────────────────────────────────────────────────

const loading = ref(true)
const loadError = ref('')

const accounts = ref<AdminAccount[]>([])
const total = ref(0)
const page = ref(1)

/** 本页只管辖普通用户（editor）；超级管理员条目从展示层过滤 */
const visibleAccounts = computed(() =>
  accounts.value.filter((a) => a.role !== 'super_admin'),
)
const visibleTotal = computed(() => visibleAccounts.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(visibleTotal.value / PAGE_SIZE)))

/** 筛选条件（触发查询时同步到请求） */
const filters = reactive({
  keyword: '',
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
  username: '',
  realName: '',
  phone: '',
  role: 'editor' as AdminRole,
  password: '',
  isActive: true,
})

/** 本页面只管理普通用户（editor）；超级管理员不归本页管辖，从可选项剔除 */
const roleOptions = computed<Record<string, string>>(() =>
  Object.fromEntries(
    Object.entries(ADMIN_ROLES).filter(([value]) => value !== 'super_admin'),
  ),
)

/** 编辑对象为超级管理员时，角色下拉只读展示 */
const isSuperEditing = computed(() => form.role === 'super_admin')

// ── 数据加载 ───────────────────────────────────────────────────

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await getAdminAccounts({
      page: page.value,
      pageSize: PAGE_SIZE,
      keyword: filters.keyword.trim() || undefined,
      status: filters.status || undefined,
    })
    accounts.value = result.items
    total.value = result.total
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '管理员账号加载失败'
    console.error('[UserManage] 加载失败 →', error)
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

function openModal(mode: 'create' | 'edit', item?: AdminAccount) {
  form.id = item?.id ?? ''
  form.username = item?.username ?? ''
  form.realName = item?.realName ?? ''
  form.phone = item?.phone ?? ''
  form.role = item?.role ?? 'editor'
  form.password = ''
  form.isActive = item?.isActive ?? true

  modal.mode = mode
  modal.title = mode === 'create' ? '新增管理员账号' : '编辑管理员账号'
  modal.visible = true
}

async function submitForm() {
  const username = form.username.trim()
  const realName = form.realName.trim()
  const phone = form.phone.trim()
  const password = form.password

  if (!username || !realName || !phone) return
  if (form.role === 'super_admin') {
    window.alert('超级管理员账号不由本页面管辖，无法在此保存')
    return
  }
  if (!/^1\d{10}$/.test(phone)) {
    window.alert('请输入正确的 11 位手机号')
    return
  }
  if (modal.mode === 'create' && password.length < 6) {
    window.alert('登录密码至少 6 位')
    return
  }
  if (modal.mode === 'edit' && password && password.length < 6) {
    window.alert('登录密码至少 6 位（留空表示不修改）')
    return
  }

  modal.saving = true
  try {
    const payload: AdminAccountPayload = {
      username,
      realName,
      phone,
      role: form.role,
      isActive: form.isActive,
      ...(password ? { password } : {}),
    }
    if (modal.mode === 'create') {
      await createAdminAccount(payload)
    } else {
      await updateAdminAccount(form.id, payload)
    }
    closeModal()
    await loadData()
  } catch (error) {
    console.error('[UserManage] 保存失败 →', error)
    window.alert(error instanceof Error ? error.message : '保存失败，请稍后重试')
  } finally {
    modal.saving = false
  }
}

// ── 启用 / 禁用 ────────────────────────────────────────────────

async function toggleStatus(item: AdminAccount) {
  const action = item.isActive ? '禁用' : '启用'
  if (!window.confirm(`确定${action}账号「${item.username}」吗？`)) return
  try {
    const updated = await toggleAdminAccountStatus(item.id, !item.isActive)
    item.isActive = updated.isActive
  } catch (error) {
    console.error('[UserManage] 切换状态失败 →', error)
    window.alert(error instanceof Error ? error.message : '操作失败，请稍后重试')
  }
}

// ── 展示工具 ───────────────────────────────────────────────────

/** 角色文案：从类型契约层取，未知值兜底显示原始值 */
function roleText(role: AdminRole): string {
  return ADMIN_ROLES[role] ?? role
}

/** 姓名首字（头像占位） */
function avatarChar(name: string): string {
  return (name || 'U').charAt(0).toUpperCase()
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso || '—'
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
  max-width: 260px;
}

/* ── 表格 ────────────────────────────────────────────────── */
.table-wrap {
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.user-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(139, 30, 63, 0.04);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.user-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.user-table tbody tr {
  transition: background 0.15s;
}

.user-table tbody tr:hover {
  background: rgba(139, 30, 63, 0.03);
}

.col-actions {
  width: 90px;
}

.cell-name {
  font-weight: 600;
  color: var(--color-text);
}

.cell-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.cell-user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text);
}

.mini-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(139, 30, 63, 0.1);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.cell-phone {
  color: var(--color-text);
  white-space: nowrap;
}

.chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 12px;
  white-space: nowrap;
}

.role-super_admin {
  color: #8b1e3f;
  background: rgba(139, 30, 63, 0.1);
}

.role-editor {
  color: #1565c0;
  background: rgba(21, 101, 192, 0.1);
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

.empty-tip {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
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

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon-btn:disabled:hover {
  background: transparent;
  color: var(--color-text-secondary);
}

.form-tip {
  font-size: 12px;
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
  width: 480px;
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

/* ── 响应式 ──────────────────────────────────────────────── */
@media (max-width: 860px) {
  .table-wrap {
    overflow-x: auto;
  }

  .user-table {
    min-width: 720px;
  }

  .form-row {
    flex-direction: column;
  }
}
</style>
