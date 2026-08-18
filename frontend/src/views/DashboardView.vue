<template>
  <div>
    <h2>概览</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="label">总用户数</div>
        <div class="value">{{ summary.totalUsers }}</div>
      </div>
      <div class="stat-card">
        <div class="label">文化条目</div>
        <div class="value">{{ summary.totalItems }}</div>
      </div>
      <div class="stat-card">
        <div class="label">章节节点</div>
        <div class="value">{{ summary.totalNodes }}</div>
      </div>
      <div class="stat-card">
        <div class="label">今日活跃用户</div>
        <div class="value">{{ summary.todayActiveUsers }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { getSummary } from '@/api/dashboard'
import type { DashboardSummary } from '@/types/admin'

const summary = reactive<DashboardSummary>({
  totalUsers: 0,
  totalItems: 0,
  totalNodes: 0,
  todayActiveUsers: 0,
})

onMounted(async () => {
  try {
    const data = await getSummary()
    Object.assign(summary, data)
  } catch (error) {
    console.error('Failed to load summary', error)
  }
})
</script>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
}

.label {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: 8px;
}

.value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
