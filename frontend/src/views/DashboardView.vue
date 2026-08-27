<template>
  <div class="dashboard">
    <!-- 页头 -->
    <div class="page-head">
      <div>
        <h2>数据看板</h2>
        <p class="page-desc">畲韵奇旅 · 运营数据总览</p>
      </div>
      <button class="btn btn-outline" :disabled="loading" @click="loadStats">
        <RefreshCw :size="15" :class="{ spinning: loading }" />
        {{ loading ? '加载中...' : '刷新数据' }}
      </button>
    </div>

    <!-- 加载失败 -->
    <div v-if="loadError" class="error-box">
      <p>数据加载失败：{{ loadError }}</p>
      <button class="btn btn-primary" @click="loadStats">重试</button>
    </div>

    <template v-else>
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon users"><Users :size="20" /></div>
          <div class="stat-meta">
            <span class="stat-label">总用户数</span>
            <span class="stat-value">{{ stats.totalUsers.toLocaleString() }}</span>
            <span class="stat-trend up"><TrendingUp :size="12" /> 本月 +{{ lastMonthGrowth }}%</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon scans"><QrCode :size="20" /></div>
          <div class="stat-meta">
            <span class="stat-label">今日扫码数</span>
            <span class="stat-value">{{ stats.todayScans.toLocaleString() }}</span>
            <span class="stat-trend up"><TrendingUp :size="12" /> 较昨日 +{{ todayScanGrowth }}%</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon items"><BookOpen :size="20" /></div>
          <div class="stat-meta">
            <span class="stat-label">图鉴条目数</span>
            <span class="stat-value">{{ stats.totalItems.toLocaleString() }}</span>
            <span class="stat-trend">涵盖 {{ categoryCount }} 大文化分类</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active"><Activity :size="20" /></div>
          <div class="stat-meta">
            <span class="stat-label">今日活跃用户</span>
            <span class="stat-value">{{ stats.todayActiveUsers.toLocaleString() }}</span>
            <span class="stat-trend">占注册用户 {{ activeRate }}%</span>
          </div>
        </div>
      </div>

      <!-- ECharts 图表区 -->
      <div class="charts-grid">
        <div class="chart-card chart-wide">
          <div class="chart-head">
            <div>
              <h3>近 7 日扫码趋势</h3>
              <p>NFC 感应 + 二维码扫码总量</p>
            </div>
            <span class="chart-badge">次</span>
          </div>
          <div ref="scanChartRef" class="chart-body" style="height: 280px"></div>
        </div>

        <div class="chart-card chart-wide">
          <div class="chart-head">
            <div>
              <h3>图鉴解锁 TOP 榜</h3>
              <p>按累计解锁次数排行（前 8）</p>
            </div>
            <span class="chart-badge">解锁</span>
          </div>
          <div ref="rankChartRef" class="chart-body" style="height: 320px"></div>
        </div>

        <div class="chart-card">
          <div class="chart-head">
            <div>
              <h3>用户增长趋势</h3>
              <p>近 12 个月累计注册</p>
            </div>
          </div>
          <div ref="userChartRef" class="chart-body" style="height: 260px"></div>
        </div>

        <div class="chart-card">
          <div class="chart-head">
            <div>
              <h3>文化分类占比</h3>
              <p>图鉴条目分类分布</p>
            </div>
          </div>
          <div ref="catChartRef" class="chart-body" style="height: 260px"></div>
        </div>
      </div>

      <!-- ECharts 库加载失败降级提示 -->
      <div v-if="libError" class="lib-error">
        <p>⚠️ ECharts 图表库加载失败：{{ libError }}</p>
        <p class="lib-error-tip">请确认 <code>/echarts.min.js</code> 文件存在于 <code>public</code> 目录后刷新页面。</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Activity, BookOpen, QrCode, RefreshCw, TrendingUp, Users } from 'lucide-vue-next'
import { getStats } from '@/api/dashboard'
import type { DashboardStats } from '@/types/admin'

// ── ECharts 轻量类型（不安装 @types 包）───────────────────────

interface EChartsInstance {
  setOption(option: Record<string, unknown>): void
  resize(): void
  dispose(): void
}

interface EChartsModule {
  init(el: HTMLElement): EChartsInstance
}

declare global {
  interface Window {
    echarts?: EChartsModule
  }
}

// ── 状态 ─────────────────────────────────────────────────────

const stats = ref<DashboardStats>({
  totalUsers: 0,
  todayScans: 0,
  totalItems: 0,
  todayActiveUsers: 0,
  scanTrend: [],
  unlockRank: [],
  userTrend: [],
  categoryDist: [],
})

const loading = ref(false)
const loadError = ref('')
const libError = ref('')

const scanChartRef = ref<HTMLElement | null>(null)
const rankChartRef = ref<HTMLElement | null>(null)
const userChartRef = ref<HTMLElement | null>(null)
const catChartRef = ref<HTMLElement | null>(null)

let charts: EChartsInstance[] = []

// ── 派生统计 ─────────────────────────────────────────────────

const lastMonthGrowth = computed(() => {
  const t = stats.value.userTrend
  if (t.length < 2 || t[t.length - 2].total === 0) return 0
  return Math.round(((t[t.length - 1].total - t[t.length - 2].total) / t[t.length - 2].total) * 100)
})

const todayScanGrowth = computed(() => {
  const t = stats.value.scanTrend
  if (t.length < 2 || t[t.length - 2].count === 0) return 0
  return Math.round(((t[t.length - 1].count - t[t.length - 2].count) / t[t.length - 2].count) * 100)
})

const activeRate = computed(() => {
  if (!stats.value.totalUsers) return 0
  return ((stats.value.todayActiveUsers / stats.value.totalUsers) * 100).toFixed(1)
})

/** 文化分类数量（动态来自接口数据，空数据时兜底 0） */
const categoryCount = computed(() => stats.value.categoryDist.length)

// ── ECharts 库加载（本地 public/echarts.min.js，零网络依赖）──

function loadECharts(): Promise<EChartsModule> {
  return new Promise((resolve, reject) => {
    if (window.echarts) return resolve(window.echarts)
    const src = '/echarts.min.js'
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(window.echarts!))
      existing.addEventListener('error', () => reject(new Error('ECharts 库加载失败')))
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => (window.echarts ? resolve(window.echarts) : reject(new Error('ECharts 库未挂载')))
    script.onerror = () => reject(new Error('ECharts 库加载失败'))
    document.head.appendChild(script)
  })
}

/** 等待两帧，确保图表容器已挂载布局 */
function nextFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

// ── 图表渲染 ─────────────────────────────────────────────────

async function renderCharts(): Promise<void> {
  let echarts: EChartsModule
  try {
    echarts = await loadECharts()
  } catch (error) {
    libError.value = error instanceof Error ? error.message : '未知错误'
    return
  }

  await nextTick()
  await nextFrames()

  // 先销毁旧实例，避免热更新重复初始化
  charts.forEach((c) => c.dispose())
  charts = []

  const PALETTE = ['#8B1E3F', '#B23A5E', '#C96F8A', '#D98A5E', '#6B4E2A', '#1E4D6B', '#2F6B4F', '#7B1FA2']
  const AXIS_LINE = '#E8E4DF'
  const TEXT_MUTED = '#6B6560'
  const TEXT_MAIN = '#2D2A26'

  // 1. 近 7 日扫码趋势（面积折线）
  if (scanChartRef.value) {
    const chart = echarts.init(scanChartRef.value)
    chart.setOption({
      grid: { top: 16, right: 20, bottom: 28, left: 44 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: stats.value.scanTrend.map((p) => p.date),
        axisLine: { lineStyle: { color: AXIS_LINE } },
        axisLabel: { color: TEXT_MUTED },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: AXIS_LINE, type: 'dashed' } },
        axisLabel: { color: TEXT_MUTED },
      },
      series: [
        {
          name: '扫码次数',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          data: stats.value.scanTrend.map((p) => p.count),
          lineStyle: { color: '#8B1E3F', width: 3 },
          itemStyle: { color: '#8B1E3F', borderColor: '#fff', borderWidth: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(139,30,63,0.28)' },
                { offset: 1, color: 'rgba(139,30,63,0.02)' },
              ],
            },
          },
        },
      ],
    })
    charts.push(chart)
  }

  // 2. 图鉴解锁 TOP 榜（横向条形，第一名在上）
  if (rankChartRef.value) {
    const rank = [...stats.value.unlockRank].sort((a, b) => b.count - a.count).reverse()
    const chart = echarts.init(rankChartRef.value)
    chart.setOption({
      grid: { top: 8, right: 46, bottom: 8, left: 76 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: Array<{ name: string; value: number }>) => {
          const p = params[0]
          return `${p.name}<br/>解锁次数：<b>${p.value.toLocaleString()}</b>`
        },
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: AXIS_LINE, type: 'dashed' } },
        axisLabel: { color: TEXT_MUTED },
      },
      yAxis: {
        type: 'category',
        data: rank.map((i) => i.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: TEXT_MAIN, fontSize: 13 },
      },
      series: [
        {
          name: '解锁次数',
          type: 'bar',
          barWidth: 14,
          data: rank.map((i, idx) => ({
            value: i.count,
            itemStyle: {
              color: idx === rank.length - 1 ? '#8B1E3F' : '#C96F8A',
              borderRadius: [0, 7, 7, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: TEXT_MUTED,
            fontSize: 12,
            formatter: (p: { value: number }) => p.value.toLocaleString(),
          },
        },
      ],
    })
    charts.push(chart)
  }

  // 3. 用户增长趋势（近 12 月折线）
  if (userChartRef.value) {
    const chart = echarts.init(userChartRef.value)
    chart.setOption({
      grid: { top: 16, right: 16, bottom: 28, left: 44 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: stats.value.userTrend.map((p) => p.month),
        axisLine: { lineStyle: { color: AXIS_LINE } },
        axisLabel: { color: TEXT_MUTED, interval: 1 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: AXIS_LINE, type: 'dashed' } },
        axisLabel: { color: TEXT_MUTED },
      },
      series: [
        {
          name: '累计用户',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: stats.value.userTrend.map((p) => p.total),
          lineStyle: { color: '#1E4D6B', width: 2.5 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(30,77,107,0.22)' },
                { offset: 1, color: 'rgba(30,77,107,0.02)' },
              ],
            },
          },
        },
      ],
    })
    charts.push(chart)
  }

  // 4. 文化分类占比（环形饼图）
  if (catChartRef.value) {
    const chart = echarts.init(catChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}：{c} 项（{d}%）' },
      legend: {
        orient: 'vertical',
        right: 8,
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: TEXT_MUTED, fontSize: 12 },
      },
      series: [
        {
          name: '分类占比',
          type: 'pie',
          radius: ['52%', '76%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold', color: TEXT_MAIN },
          },
          data: stats.value.categoryDist.map((c, idx) => ({
            name: c.name,
            value: c.value,
            itemStyle: { color: PALETTE[idx % PALETTE.length] },
          })),
        },
      ],
    })
    charts.push(chart)
  }
}

// ── 数据加载 ─────────────────────────────────────────────────

async function loadStats(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    stats.value = await getStats()
    await renderCharts()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '未知错误'
    console.error('[Dashboard] 数据加载失败 →', error)
  } finally {
    loading.value = false
  }
}

// ── 生命周期 ─────────────────────────────────────────────────

function handleResize(): void {
  charts.forEach((c) => c.resize())
}

onMounted(() => {
  loadStats()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach((c) => c.dispose())
  charts = []
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.page-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

.btn-outline:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--color-primary-light);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-box {
  background: #fdf0f0;
  border: 1px solid #e5b8b8;
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
  color: #8a2a2a;
}

.error-box p {
  margin: 0 0 12px;
}

/* ── 统计卡片 ─────────────────────────────────────────── */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-icon.users {
  background: rgba(139, 30, 63, 0.1);
  color: #8b1e3f;
}

.stat-icon.scans {
  background: rgba(30, 77, 107, 0.1);
  color: #1e4d6b;
}

.stat-icon.items {
  background: rgba(43, 107, 79, 0.1);
  color: #2b6b4f;
}

.stat-icon.active {
  background: rgba(178, 58, 94, 0.12);
  color: #b23a5e;
}

.stat-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text);
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.stat-trend.up {
  color: #2b6b4f;
}

/* ── 图表卡片 ─────────────────────────────────────────── */

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 18px 18px 12px;
  box-shadow: var(--shadow);
}

.chart-wide {
  grid-column: 1 / -1;
}

.chart-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.chart-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.chart-head p {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.chart-badge {
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 2px 10px;
  white-space: nowrap;
}

.lib-error {
  background: #fdf0f0;
  border: 1px solid #e5b8b8;
  border-radius: var(--radius);
  padding: 14px 18px;
  color: #8a2a2a;
  font-size: 13px;
}

.lib-error p {
  margin: 0;
}

.lib-error-tip {
  margin-top: 6px !important;
  font-size: 12px;
  color: #a55 !important;
}

.lib-error code {
  background: rgba(138, 42, 42, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
}

/* ── 响应式 ───────────────────────────────────────────── */

@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .page-head {
    flex-direction: column;
  }
}
</style>
