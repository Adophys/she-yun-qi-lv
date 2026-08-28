<template>
  <view class="container">
    <!-- 用户资料卡 -->
    <view class="profile" @click="handleProfileTap">
      <image class="avatar" :src="avatar" mode="aspectFill" />
      <view class="profile-meta">
        <text class="name">{{ nickname }}</text>
        <text class="title" v-if="isLoggedIn">Lv.{{ level }} · {{ titleText }}</text>
        <text class="title" v-else>点击登录，开启奇旅</text>
      </view>
      <text class="arrow" v-if="!isLoggedIn">›</text>
    </view>

    <!-- 数据统计 -->
    <view class="stats">
      <view class="stat">
        <text class="num">{{ points }}</text>
        <text class="label">积分</text>
      </view>
      <view class="stat">
        <text class="num">{{ stats.exploreCompleted }}</text>
        <text class="label">通关数</text>
      </view>
      <view class="stat">
        <text class="num">{{ stats.discoveredCount }}</text>
        <text class="label">图鉴</text>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu">
      <view class="menu-item" @click="goWardrobe">
        <text class="menu-icon">🧥</text>
        <text class="menu-label">我的衣橱</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goAchievements">
        <text class="menu-icon">🏅</text>
        <text class="menu-label">成就勋章</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goCollection">
        <text class="menu-icon">📖</text>
        <text class="menu-label">我的收藏</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" v-if="shopEnabled" @click="goShop">
        <text class="menu-icon">🛍️</text>
        <text class="menu-label">畲韵商城</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" v-if="shopEnabled" @click="goOrders">
        <text class="menu-icon">📦</text>
        <text class="menu-label">我的订单</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" v-if="shopEnabled" @click="goAddresses">
        <text class="menu-icon">📍</text>
        <text class="menu-label">收货地址</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-label">设置</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <button v-if="isLoggedIn" class="logout-btn" @click="handleLogout">退出登录</button>
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useSessionStore } from '@/stores/session'
import { getMe } from '@/api/users'
import { FEATURE_FLAGS } from '@/config/api'
import { ROUTE_PATHS } from '@/router/routes'

const { state, isLoggedIn, patchUser, logout } = useSessionStore()

const shopEnabled = FEATURE_FLAGS.shopEnabled

const stats = reactive({ discoveredCount: 0, exploreCompleted: 0 })

const avatar = computed(() => {
  if (isLoggedIn() && state.user && state.user.avatarUrl) return state.user.avatarUrl
  return '/static/albums/ID形象-少女.jpg'
})

const nickname = computed(() => (isLoggedIn() && state.user && state.user.nickname) || '游客')
const level = computed(() => (state.user && state.user.level) || 1)
const points = computed(() => (state.user && state.user.points) || 0)
const titleText = computed(() => {
  if (state.user && state.user.title) return state.user.title
  const p = points.value
  if (p >= 1000) return '文化守护者'
  if (p >= 300) return '畲乡旅人'
  return '初识畲乡'
})

async function refreshUser() {
  if (!isLoggedIn()) return
  try {
    const me = await getMe()
    patchUser({
      id: me.id,
      nickname: me.nickname,
      avatarUrl: me.avatarUrl,
      level: me.level,
      points: me.points,
      discoveredCount: me.discoveredCount,
      exploreCompleted: me.exploreCompleted,
    })
    stats.discoveredCount = me.discoveredCount || 0
    stats.exploreCompleted = me.exploreCompleted || 0
  } catch (error) {
    console.error('refresh user failed', error)
  }
}

function handleProfileTap() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: ROUTE_PATHS.LOGIN })
  }
}

function goWardrobe() {
  uni.navigateTo({ url: ROUTE_PATHS.WARDROBE })
}
function goAchievements() {
  uni.navigateTo({ url: ROUTE_PATHS.ACHIEVEMENTS })
}
function goCollection() {
  uni.switchTab({ url: ROUTE_PATHS.COLLECTION })
}
function goShop() {
  uni.navigateTo({ url: ROUTE_PATHS.SHOP })
}
function goOrders() {
  uni.navigateTo({ url: ROUTE_PATHS.ORDERS })
}
function goAddresses() {
  uni.navigateTo({ url: ROUTE_PATHS.ADDRESS_LIST })
}
function goSettings() {
  uni.navigateTo({ url: ROUTE_PATHS.SETTINGS })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    },
  })
}

onShow(() => {
  refreshUser()
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
}

.profile {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: $color-surface;
  padding: 32rpx;
  border-radius: 24rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $color-border;
}

.profile-meta {
  flex: 1;
}

.name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
}

.title {
  display: block;
  color: $color-text-secondary;
  margin-top: 8rpx;
  font-size: 26rpx;
}

.arrow {
  color: $color-border;
  font-size: 40rpx;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 32rpx 0;
  background: $color-surface;
  border-radius: 24rpx;
  padding: 24rpx 0;
}

.stat {
  text-align: center;
}

.num {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: $color-primary;
}

.label {
  color: $color-text-secondary;
  font-size: 24rpx;
}

.menu {
  background: $color-surface;
  border-radius: 24rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid $color-border;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-label {
  flex: 1;
  font-size: 30rpx;
}

.logout-btn {
  margin-top: 48rpx;
  background: #fff;
  color: $color-primary;
  border-radius: 48rpx;
  border: 1rpx solid $color-primary;
}

.logout-btn::after {
  border: none;
}
</style>


