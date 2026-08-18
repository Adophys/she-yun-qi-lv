<template>
  <view class="container">
    <view class="header">
      <image class="avatar" :src="user.avatar" mode="aspectFill" />
      <text class="title">畲韵奇旅</text>
      <view class="points">
        <text class="points-value">{{ user.points }}</text>
      </view>
    </view>

    <view class="greeting-bubble">
      <text>今天要去哪里探索呀？</text>
    </view>

    <view class="hero-section">
      <image class="hero-image" src="/static/hero-placeholder.png" mode="aspectFit" />
    </view>

    <button class="primary-btn" @click="goExplore">
      <text>继续奇旅</text>
    </button>

    <view class="quick-cards">
      <view class="card">
        <text class="card-title">每日任务</text>
        <text class="card-subtitle">探索古村落</text>
        <text class="card-status">未完成</text>
      </view>
      <view class="card">
        <text class="card-title">第一章进度</text>
        <text class="card-progress">4/10</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const user = reactive({
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
  points: 1280,
})

function goExplore() {
  uni.switchTab({ url: '/pages/explore/explore' })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 24rpx 32rpx;
  background: $color-bg;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: $color-primary;
}

.points {
  background: $color-surface;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
}

.points-value {
  font-weight: 600;
}

.greeting-bubble {
  margin: 32rpx auto;
  padding: 24rpx 48rpx;
  background: $color-surface;
  border-radius: 48rpx;
  text-align: center;
  width: fit-content;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.hero-section {
  display: flex;
  justify-content: center;
  margin: 32rpx 0;
}

.hero-image {
  width: 560rpx;
  height: 400rpx;
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
  font-size: 32rpx;
  font-weight: 600;
  margin: 12rpx 0;
}

.card-status {
  color: $color-primary;
  font-size: 24rpx;
}

.card-progress {
  font-size: 40rpx;
  font-weight: 700;
}
</style>
