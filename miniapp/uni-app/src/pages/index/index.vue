<template>
  <view class="container">
    <!-- 顶部：用户信息 / 登录引导 -->
    <view class="header">
      <view class="user-info" @click="handleUserTap">
        <image class="avatar" :src="avatar" mode="aspectFill" />
        <view class="user-meta">
          <text class="nickname">{{ nickname }}</text>
          <text class="level">Lv.{{ level }}</text>
        </view>
      </view>
      <view class="points" @click="goMine">
        <text class="points-value">{{ points }} 积分</text>
      </view>
    </view>

    <!-- 欢迎语 -->
    <view class="greeting-bubble">
      <text>{{ greeting }}</text>
    </view>

    <!-- IP 形象展示区 -->
    <view class="hero-section">
      <image class="hero-image" :src="heroImage" mode="aspectFit" />
      <view class="hero-tag" v-if="!isLoggedIn" @click="goLogin">登录开启奇旅</view>
    </view>

    <!-- 主按钮 -->
    <button class="primary-btn" @click="goExplore">
      <text>继续奇旅</text>
    </button>

    <!-- 每日任务 + 章节进度 -->
    <view class="quick-cards">
      <view class="card" @click="goScan">
        <text class="card-title">今日任务</text>
        <text class="card-subtitle">{{ dailyTask.title }}</text>
        <text class="card-status" :class="{ done: dailyTask.doneToday }">
          {{ dailyTask.doneToday ? '已完成' : '未完成' }}
        </text>
      </view>
      <view class="card" @click="goExplore">
        <text class="card-title">章节进度</text>
        <text class="card-progress">{{ chapterText }}</text>
        <text class="card-subtitle">{{ chapterName }}</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-entries">
      <view class="entry" v-for="entry in entries" :key="entry.key" @click="entry.handler">
        <text class="entry-icon">{{ entry.icon }}</text>
        <text class="entry-label">{{ entry.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useSessionStore } from '@/stores/session'
import { getHomeSummary } from '@/api/home'
import { ROUTE_PATHS } from '@/router/routes'
import { requireLogin } from '@/utils/login'

const { state, isLoggedIn } = useSessionStore()

const summary = ref(null)
const loading = ref(false)

const avatar = computed(() => {
  if (isLoggedIn() && state.user && state.user.avatarUrl) return state.user.avatarUrl
  return '/static/albums/ID形象-少女.jpg'
})

const nickname = computed(() => {
  if (isLoggedIn() && state.user && state.user.nickname) return state.user.nickname
  return '游客'
})

const level = computed(() => (state.user && state.user.level) || 1)
const points = computed(() => (state.user && state.user.points) || 0)

const greeting = computed(() => {
  const hour = new Date().getHours()
  let part = '你好'
  if (hour < 6) part = '夜深了'
  else if (hour < 12) part = '早上好'
  else if (hour < 18) part = '下午好'
  else part = '晚上好'
  return `${part}，今天要去哪里探索呀？`
})

// IP 形象：使用 albums 中用户提供的 IP 形象图片
const heroImage = '/static/albums/ID形象-少女.jpg'

const dailyTask = computed(() => {
  const t = (summary.value && summary.value.dailyTask) || {}
  return {
    title: t.title || '扫码探索',
    description: t.description || '扫描线下二维码解锁畲族文化卡片',
    doneToday: !!t.doneToday,
    progress: t.progress || 0,
  }
})

const firstChapter = computed(() => {
  const list = (summary.value && summary.value.chapterProgress) || []
  return list[0] || null
})

const chapterText = computed(() => {
  if (!firstChapter.value) return '—'
  return `${firstChapter.value.completedNodes}/${firstChapter.value.totalNodes}`
})

const chapterName = computed(() => (firstChapter.value ? firstChapter.value.chapterName : '暂无章节'))

async function loadSummary() {
  if (!isLoggedIn()) {
    summary.value = null
    return
  }
  loading.value = true
  try {
    summary.value = await getHomeSummary()
  } catch (error) {
    console.error('load home summary failed', error)
  } finally {
    loading.value = false
  }
}

function handleUserTap() {
  if (isLoggedIn()) {
    uni.switchTab({ url: ROUTE_PATHS.MINE })
  } else {
    goLogin()
  }
}

function goLogin() {
  uni.navigateTo({ url: ROUTE_PATHS.LOGIN })
}

function goMine() {
  uni.switchTab({ url: ROUTE_PATHS.MINE })
}

function goExplore() {
  uni.switchTab({ url: ROUTE_PATHS.EXPLORE })
}

function goScan() {
  if (!requireLogin()) return
  uni.switchTab({ url: ROUTE_PATHS.SCAN })
}

function goCollection() {
  uni.switchTab({ url: ROUTE_PATHS.COLLECTION })
}

function goWardrobe() {
  if (!requireLogin()) return
  uni.navigateTo({ url: ROUTE_PATHS.WARDROBE })
}

function goPuzzle() {
  if (!requireLogin()) return
  uni.navigateTo({ url: ROUTE_PATHS.EXPLORE })
}

const entries = computed(() => [
  { key: 'collection', icon: '📖', label: '文化图鉴', handler: goCollection },
  { key: 'wardrobe', icon: '🧥', label: 'IP衣橱', handler: goWardrobe },
  { key: 'puzzle', icon: '🧩', label: '凤凰拼图', handler: goPuzzle },
  { key: 'mine', icon: '👤', label: '个人中心', handler: goMine },
])

onShow(() => {
  loadSummary()
})

onPullDownRefresh(async () => {
  await loadSummary()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 24rpx 32rpx;
  padding-top: calc(var(--status-bar-height) + 24rpx);
  background: $color-bg;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $color-border;
}

.nickname {
  font-size: 30rpx;
  font-weight: 600;
}

.level {
  display: block;
  font-size: 22rpx;
  color: $color-text-secondary;
}

.points {
  background: $color-surface;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
}

.points-value {
  font-weight: 600;
  font-size: 26rpx;
}

.greeting-bubble {
  margin: 32rpx auto;
  padding: 24rpx 48rpx;
  background: $color-surface;
  border-radius: 48rpx;
  text-align: center;
  width: fit-content;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  font-size: 28rpx;
}

.hero-section {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 32rpx 0;
}

.hero-image {
  width: 560rpx;
  height: 400rpx;
  border-radius: 24rpx;
  background: $color-surface;
}

.hero-tag {
  position: absolute;
  bottom: 24rpx;
  right: 24rpx;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
}

.primary-btn {
  background: #1E2A4A;
  color: #fff;
  border-radius: 48rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 32rpx;
  margin: 32rpx 0;
}

.primary-btn::after {
  border: none;
}

.quick-cards {
  display: flex;
  gap: 24rpx;
}

.card {
  flex: 1;
  background: $color-surface;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 24rpx;
  color: $color-text-secondary;
}

.card-subtitle {
  display: block;
  font-size: 26rpx;
  margin: 12rpx 0;
  color: $color-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-status {
  color: $color-primary;
  font-size: 24rpx;
}

.card-status.done {
  color: #16A34A;
}

.card-progress {
  font-size: 40rpx;
  font-weight: 700;
  display: block;
}

.quick-entries {
  display: flex;
  justify-content: space-around;
  margin-top: 40rpx;
  background: $color-surface;
  border-radius: 24rpx;
  padding: 24rpx 0;
}

.entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.entry-icon {
  font-size: 44rpx;
}

.entry-label {
  font-size: 24rpx;
  color: $color-text-secondary;
}
</style>


