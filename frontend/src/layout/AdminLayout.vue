<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="brand">畲韵奇旅</div>
      <nav>
        <RouterLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="active"
        >
          <component :is="item.icon" class="icon" />
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>
      <div class="sidebar-footer">
        <div class="user-card">
          <span class="avatar">{{ avatarText }}</span>
          <div class="user-info">
            <span class="username">{{ displayName }}</span>
            <span class="role">{{ roleText }}</span>
          </div>
        </div>
      </div>
    </aside>
    <div class="main-wrap">
      <header class="topbar">
        <h1 class="page-title">{{ route.meta.title || '管理后台' }}</h1>

        <!-- 右上角用户下拉菜单 -->
        <div class="user-menu">
          <div v-if="menuOpen" class="menu-overlay" @click="menuOpen = false"></div>
          <button class="user-menu-trigger" @click.stop="menuOpen = !menuOpen">
            <span class="avatar-sm">{{ avatarText }}</span>
            <span class="user-menu-name">{{ displayName }}</span>
            <ChevronDown :size="14" class="chevron" :class="{ open: menuOpen }" />
          </button>
          <div v-if="menuOpen" class="user-dropdown">
            <div class="dropdown-head">
              <div class="dropdown-name">{{ displayName }}</div>
              <div class="dropdown-role">{{ roleText }}</div>
            </div>
            <button class="dropdown-item" @click="openProfile">
              <UserRound :size="15" />
              个人资料
            </button>
            <button class="dropdown-item danger" :disabled="loggingOut" @click="handleLogout">
              <LogOut :size="15" />
              {{ loggingOut ? '退出中…' : '退出登录' }}
            </button>
          </div>
        </div>
      </header>
      <main class="main">
        <RouterView />
      </main>
    </div>

    <!-- 个人资料弹窗 -->
    <ProfileModal v-if="profileVisible" @close="profileVisible = false" @updated="refreshUser" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LogOut, ChevronDown, UserRound } from 'lucide-vue-next'
import { navigation } from '@/config/navigation'
import { getStoredUser, logout } from '@/api/auth'
import { ADMIN_ROLES } from '@/types/admin'
import ProfileModal from '@/components/ProfileModal.vue'

const route = useRoute()
const router = useRouter()

/** 本地用户信息（ref 便于个人资料更新后刷新显示） */
const user = ref(getStoredUser())
const loggingOut = ref(false)
const menuOpen = ref(false)
const profileVisible = ref(false)

/** 头像首字 */
const avatarText = computed(() => {
  const name = user.value?.displayName || user.value?.username || 'U'
  return name.charAt(0).toUpperCase()
})

/** 显示名 */
const displayName = computed(
  () => user.value?.displayName || user.value?.username || '未登录',
)

/** 角色文案：从类型契约层取，未知角色兜底显示原始值 */
const roleText = computed(() => {
  const roles = user.value?.roles ?? []
  if (roles.includes('super_admin')) return ADMIN_ROLES.super_admin
  if (roles.includes('editor')) return ADMIN_ROLES.editor
  return roles.join(' / ') || '普通用户'
})

/** 打开个人资料弹窗 */
function openProfile() {
  menuOpen.value = false
  profileVisible.value = true
}

/** 个人资料更新后刷新本地显示（api 层已同步 localStorage） */
function refreshUser() {
  user.value = getStoredUser()
}

/** 退出登录 */
async function handleLogout() {
  if (loggingOut.value) return
  loggingOut.value = true
  menuOpen.value = false
  try {
    await logout()
  } finally {
    router.replace('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.brand {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 32px;
  padding-left: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius);
  color: var(--color-text-secondary);
  text-decoration: none;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(139, 30, 63, 0.08);
  color: var(--color-primary);
}

.icon {
  width: 18px;
  height: 18px;
}

/* ── 侧边栏底部用户卡片 ─────────────────────────── */

.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: rgba(139, 30, 63, 0.05);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.username {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ── 主区域（顶栏 + 内容） ─────────────────────── */

.main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

/* ── 右上角用户下拉菜单 ─────────────────────────── */

.user-menu {
  position: relative;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.user-menu-trigger:hover {
  border-color: var(--color-primary);
  background: rgba(139, 30, 63, 0.04);
}

.avatar-sm {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-menu-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  color: var(--color-text-secondary);
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 95;
  width: 190px;
  padding: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.dropdown-head {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 6px;
}

.dropdown-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-role {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.dropdown-item:hover:not(:disabled) {
  background: rgba(139, 30, 63, 0.06);
  color: var(--color-primary);
}

.dropdown-item.danger:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.06);
  color: var(--color-danger, #dc2626);
}

.dropdown-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.main {
  flex: 1;
  padding: 32px;
}

/* ── 移动端适配 ───────────────────────────────── */

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
    padding: 24px 8px;
  }

  .brand {
    padding-left: 4px;
    font-size: 16px;
    text-align: center;
  }

  .nav-item span,
  .user-info,
  .sidebar-footer {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 12px 0;
  }

  .topbar {
    padding: 12px 16px;
  }

  .main {
    padding: 16px;
  }
}
</style>
