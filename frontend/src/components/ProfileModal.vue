<template>
  <div class="modal-mask" @click.self="handleClose">
    <div class="modal-card">
      <div class="modal-header">
        <h3>个人资料</h3>
        <button class="icon-btn" title="关闭" @click="handleClose">
          <X :size="16" />
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
        <button class="btn btn-outline btn-sm" @click="loadProfile">重试</button>
      </div>

      <template v-else>
        <!-- ── 基本信息区 ── -->
        <section class="section">
          <div class="section-head">
            <h4>基本信息</h4>
            <button
              v-if="!editing"
              class="btn btn-outline btn-sm"
              :disabled="saving"
              @click="startEdit"
            >
              <Pencil :size="13" />
              编辑资料
            </button>
            <div v-else class="section-head-btns">
              <button class="btn btn-outline btn-sm" :disabled="saving" @click="cancelEdit">
                取消
              </button>
              <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveProfile">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>

          <!-- 查看态 -->
          <div v-if="!editing" class="info-grid">
            <div class="info-item">
              <span class="info-label">登录账号</span>
              <span class="info-value">{{ profile.username || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">真实姓名</span>
              <span class="info-value">{{ profile.realName || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">手机号</span>
              <span class="info-value">{{ profile.phone || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">角色</span>
              <span class="info-value">
                <span class="chip" :class="`role-${profile.role}`">{{ roleText }}</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ formatDate(profile.createdAt) }}</span>
            </div>
          </div>

          <!-- 编辑态 -->
          <form v-else class="edit-form" @submit.prevent="saveProfile">
            <div class="form-field">
              <label>真实姓名 <em>*</em></label>
              <input v-model="editForm.realName" type="text" placeholder="请输入真实姓名" required />
            </div>
            <div class="form-field">
              <label>手机号 <em>*</em></label>
              <input
                v-model="editForm.phone"
                type="tel"
                maxlength="11"
                placeholder="11 位手机号"
                required
              />
            </div>
          </form>
        </section>

        <!-- ── 修改密码区 ── -->
        <section class="section">
          <div class="section-head">
            <h4>修改登录密码</h4>
            <button
              v-if="!pwdVisible"
              class="btn btn-outline btn-sm"
              :disabled="pwdSaving"
              @click="pwdVisible = true"
            >
              <KeyRound :size="13" />
              修改密码
            </button>
          </div>

          <form v-if="pwdVisible" class="edit-form" @submit.prevent="savePassword">
            <div class="form-field">
              <label>原密码 <em>*</em></label>
              <input
                v-model="pwdForm.oldPassword"
                type="password"
                placeholder="请输入当前登录密码"
                required
              />
            </div>
            <div class="form-field">
              <label>新密码 <em>*</em></label>
              <input
                v-model="pwdForm.newPassword"
                type="password"
                placeholder="至少 6 位"
                required
              />
            </div>
            <div class="form-field">
              <label>确认新密码 <em>*</em></label>
              <input
                v-model="pwdForm.confirmPassword"
                type="password"
                placeholder="再次输入新密码"
                required
              />
            </div>
            <div class="pwd-actions">
              <button
                type="button"
                class="btn btn-outline btn-sm"
                :disabled="pwdSaving"
                @click="resetPwdForm"
              >
                取消
              </button>
              <button type="submit" class="btn btn-primary btn-sm" :disabled="pwdSaving">
                {{ pwdSaving ? '提交中...' : '确认修改' }}
              </button>
            </div>
          </form>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { X, Pencil, KeyRound } from 'lucide-vue-next'
import { fetchProfile, updateProfile, changePassword } from '@/api/auth'
import type { AdminProfile } from '@/types/admin'
import { ADMIN_ROLES } from '@/types/admin'

// ── 对外事件 ───────────────────────────────────────────────────

const emit = defineEmits<{
  /** 关闭弹窗 */
  (e: 'close'): void
  /** 资料更新成功（通知父组件刷新本地用户显示） */
  (e: 'updated'): void
}>()

// ── 基本资料 ───────────────────────────────────────────────────

const loading = ref(true)
const loadError = ref('')

const profile = ref<AdminProfile>({
  id: '',
  username: '',
  realName: '',
  phone: '',
  role: 'editor',
  createdAt: '',
})

/** 角色文案：从类型契约层取，未知值兜底显示原始值 */
const roleText = computed(() => ADMIN_ROLES[profile.value.role] ?? profile.value.role)

async function loadProfile() {
  loading.value = true
  loadError.value = ''
  try {
    profile.value = await fetchProfile()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '个人资料加载失败'
    console.error('[ProfileModal] 加载失败 →', error)
  } finally {
    loading.value = false
  }
}

// ── 编辑资料 ───────────────────────────────────────────────────

const editing = ref(false)
const saving = ref(false)

const editForm = reactive({
  realName: '',
  phone: '',
})

function startEdit() {
  editForm.realName = profile.value.realName
  editForm.phone = profile.value.phone
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function saveProfile() {
  const realName = editForm.realName.trim()
  const phone = editForm.phone.trim()
  if (!realName) {
    window.alert('真实姓名不能为空')
    return
  }
  if (!/^1\d{10}$/.test(phone)) {
    window.alert('请输入正确的 11 位手机号')
    return
  }

  saving.value = true
  try {
    profile.value = await updateProfile({ realName, phone })
    editing.value = false
    emit('updated')
  } catch (error) {
    console.error('[ProfileModal] 资料保存失败 →', error)
    window.alert(error instanceof Error ? error.message : '保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// ── 修改密码 ───────────────────────────────────────────────────

const pwdVisible = ref(false)
const pwdSaving = ref(false)

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

function resetPwdForm() {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdVisible.value = false
}

async function savePassword() {
  const { oldPassword, newPassword, confirmPassword } = pwdForm
  if (!oldPassword || !newPassword || !confirmPassword) {
    window.alert('请完整填写原密码与新密码')
    return
  }
  if (newPassword.length < 6) {
    window.alert('新密码至少 6 位')
    return
  }
  if (newPassword !== confirmPassword) {
    window.alert('两次输入的新密码不一致')
    return
  }
  if (newPassword === oldPassword) {
    window.alert('新密码不能与原密码相同')
    return
  }

  pwdSaving.value = true
  try {
    await changePassword({ oldPassword, newPassword })
    window.alert('密码修改成功，请牢记新密码')
    resetPwdForm()
  } catch (error) {
    console.error('[ProfileModal] 密码修改失败 →', error)
    window.alert(error instanceof Error ? error.message : '密码修改失败，请稍后重试')
  } finally {
    pwdSaving.value = false
  }
}

// ── 工具 ───────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function handleClose() {
  if (saving.value || pwdSaving.value) return
  emit('close')
}

// ── 生命周期 ───────────────────────────────────────────────────

onMounted(loadProfile)
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.modal-card {
  width: 460px;
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
  margin-bottom: 18px;
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  color: var(--color-text);
}

/* ── 区块 ────────────────────────────────────────────────── */
.section {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  margin-bottom: 14px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 10px;
}

.section-head h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.section-head-btns {
  display: flex;
  gap: 8px;
}

/* ── 信息网格 ────────────────────────────────────────────── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.info-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  word-break: break-all;
}

.info-grid .info-item:first-child {
  grid-column: 1 / -1;
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

/* ── 表单 ────────────────────────────────────────────────── */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.form-field input {
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

.form-field input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 30, 63, 0.1);
}

.pwd-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ── 通用按钮 ────────────────────────────────────────────── */
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
  transition: opacity 0.2s;
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

/* ── 图标按钮 / 加载 / 错误 ──────────────────────────────── */
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
  padding: 40px 0;
  color: #c62828;
  font-size: 13px;
}

/* ── 响应式 ──────────────────────────────────────────────── */
@media (max-width: 520px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
