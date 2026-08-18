<template>
  <div class="login-card">
    <h1>畲韵奇旅管理端</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="form.username" type="text" placeholder="用户名" required />
      <input v-model="form.password" type="password" placeholder="密码" required />
      <button type="submit">登录</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'

const router = useRouter()
const form = reactive({ username: '', password: '' })

async function handleLogin() {
  try {
    await login(form)
    router.push('/')
  } catch (error) {
    alert(error instanceof Error ? error.message : '登录失败')
  }
}
</script>

<style scoped>
.login-card {
  width: 360px;
  padding: 32px;
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

h1 {
  margin: 0 0 24px;
  color: var(--color-primary);
  text-align: center;
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 14px;
}

button {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: var(--color-primary-light);
}
</style>
