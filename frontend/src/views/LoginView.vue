<template>
  <div class="login-wrapper">
    <!-- 装饰背景 -->
    <div class="login-bg">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo / 标题区 -->
      <div class="login-header">
        <div class="logo-icon">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2.5"/>
            <path d="M20 8 L28 18 L20 28 L12 18 Z" fill="currentColor" opacity="0.3"/>
            <path d="M14 24 Q20 32 26 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
        <h1>畲韵奇旅管理端</h1>
        <p class="subtitle">She-Yun-Qi-Lv Admin Panel</p>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="login-form" novalidate>
        <!-- 用户名 -->
        <div class="form-group" :class="{ 'has-error': errors.username }">
          <label for="username">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            用户名
          </label>
          <input
            id="username"
            ref="usernameInput"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            :disabled="loading"
            autocomplete="username"
            @input="clearError('username')"
          />
          <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
        </div>

        <!-- 密码 -->
        <div class="form-group" :class="{ 'has-error': errors.password }">
          <label for="password">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            密码
          </label>
          <div class="password-input">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :disabled="loading"
              autocomplete="current-password"
              @input="clearError('password')"
            />
            <button
              type="button"
              class="toggle-pwd"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
        </div>

        <!-- 记住账号 & 忘记密码 -->
        <div class="form-options">
          <label class="checkbox-label">
            <input v-model="rememberMe" type="checkbox" />
            <span>记住账号</span>
          </label>
          <a href="#" class="forgot-link" @click.prevent>忘记密码？</a>
        </div>

        <!-- 错误提示 -->
        <div v-if="submitError" class="submit-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ submitError }}
        </div>

        <!-- 登录按钮 -->
        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'

const router = useRouter()

// ── 状态 ───────────────────────────────────────────────────────

const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(true)
const submitError = ref('')
const usernameInput = ref<HTMLInputElement>()

const form = reactive({
  username: '',
  password: '',
})

const errors = reactive<Record<string, string>>({
  username: '',
  password: '',
})

// ── 方法 ───────────────────────────────────────────────────────

/** 清除字段错误 */
function clearError(field: string) {
  errors[field] = ''
  submitError.value = ''
}

/** 表单验证 */
function validate(): boolean {
  let valid = true

  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    valid = false
  }

  if (!form.password) {
    errors.password = '请输入密码'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = '密码至少6位'
    valid = false
  }

  return valid
}

/** 处理登录 */
async function handleLogin() {
  submitError.value = ''

  if (!validate()) return

  loading.value = true

  try {
    await login({
      username: form.username.trim(),
      password: form.password,
    })

    // 记住账号逻辑
    if (rememberMe.value) {
      localStorage.setItem('sheyun_remembered_user', form.username.trim())
    } else {
      localStorage.removeItem('sheyun_remembered_user')
    }

    // 跳转到首页或来源页
    const redirect = (router.currentRoute.value.query.redirect as string) || '/'
    await router.push(redirect)
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败，请稍后重试'

    // 根据错误类型显示不同提示
    if (message.includes('用户名') || message.includes('密码')) {
      submitError.value = message
    } else if (message.includes('凭证') || message.includes('INVALID_CREDENTIALS')) {
      submitError.value = '用户名或密码错误'
    } else {
      submitError.value = message
    }

    console.error('[Auth] 登录失败 →', error)
  } finally {
    loading.value = false
  }
}

// ── 生命周期 ──────────────────────────────────────────────────

onMounted(() => {
  // 自动填充记住的账号
  const remembered = localStorage.getItem('sheyun_remembered_user')
  if (remembered) {
    form.username = remembered
    rememberMe.value = true
  }
  // 自动聚焦
  usernameInput.value?.focus()
})
</script>

<style scoped>
/* ── 容器 ────────────────────────────────────────────────── */
.login-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  overflow: hidden;
}

/* ── 装饰背景 ────────────────────────────────────────────── */
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.bg-circle-1 {
  width: 500px;
  height: 500px;
  background: var(--color-primary);
  top: -150px;
  right: -100px;
}

.bg-circle-2 {
  width: 350px;
  height: 350px;
  background: var(--color-primary-light, #a53050);
  bottom: -80px;
  left: -60px;
}

.bg-circle-3 {
  width: 200px;
  height: 200px;
  background: var(--color-primary);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.04;
}

/* ── 卡片 ────────────────────────────────────────────────── */
.login-card {
  position: relative;
  width: 400px;
  max-width: 100%;
  padding: 40px 36px;
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.08),
    0 20px 50px -12px rgba(139, 30, 63, 0.15);
  z-index: 1;
}

/* ── 头部 ────────────────────────────────────────────────── */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  color: var(--color-primary);
  background: linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(139, 30, 63, 0.05));
  border-radius: 14px;
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

h1 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 1px;
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #888);
  letter-spacing: 0.5px;
}

/* ── 表单 ────────────────────────────────────────────────── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary, #666);
}

.form-group label svg {
  flex-shrink: 0;
  opacity: 0.6;
}

/* 输入框 */
input[type='text'],
input[type='password'] {
  width: 100%;
  padding: 11px 13px;
  font-size: 14px;
  color: var(--color-text);
  background: var(--color-bg, #f8f8f8);
  border: 1.5px solid var(--color-border, #e5e5e5);
  border-radius: 9px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

input[type='text']:focus,
input[type='password']:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 30, 63, 0.1);
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.has-error input {
  border-color: #e53935;
}

.has-error input:focus {
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}

/* 密码输入框 */
.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  padding-right: 42px;
}

.toggle-pwd {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: none;
  border: none;
  color: var(--color-text-secondary, #999);
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s;
}

.toggle-pwd:hover {
  color: var(--color-primary);
}

/* 错误信息 */
.error-msg {
  font-size: 12px;
  color: #e53935;
  line-height: 1.4;
}

.submit-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-top: 4px;
  font-size: 13px;
  color: #c62828;
  background: rgba(229, 57, 53, 0.06);
  border: 1px solid rgba(229, 57, 53, 0.15);
  border-radius: 8px;
}

/* ── 选项栏 ──────────────────────────────────────────────── */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: auto;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.forgot-link {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* ── 登录按钮 ────────────────────────────────────────────── */
.btn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light, #a53050));
  border: none;
  border-radius: 9px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-login:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-0.5px);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 加载动画 */
.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
