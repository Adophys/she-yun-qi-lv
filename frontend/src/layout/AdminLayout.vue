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
    </aside>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { navigation } from '@/config/navigation'
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

.main {
  flex: 1;
  padding: 32px;
}
</style>
