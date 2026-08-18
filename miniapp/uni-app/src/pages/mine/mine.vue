<template>
  <view class="container">
    <view class="profile">
      <image class="avatar" :src="user.avatar" mode="aspectFill" />
      <view>
        <text class="name">{{ user.name }}</text>
        <text class="title">等级{{ user.level }} {{ user.title }}</text>
      </view>
    </view>

    <view class="stats">
      <view class="stat">
        <text class="num">{{ user.completedStages }}</text>
        <text class="label">通关数</text>
      </view>
      <view class="stat">
        <text class="num">{{ user.collectedCards }}</text>
        <text class="label">图鉴</text>
      </view>
      <view class="stat">
        <text class="num">{{ user.arDiscovered }}</text>
        <text class="label">AR发现</text>
      </view>
    </view>

    <view class="menu">
      <view class="menu-item" @click="goWardrobe">
        <text>我的衣橱</text>
      </view>
      <view class="menu-item" @click="goSettings">
        <text>设置</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const user = reactive({
  name: 'A-Miao',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
  level: 5,
  title: '文化守护者',
  completedStages: 23,
  collectedCards: 28,
  arDiscovered: 8,
})

function goWardrobe() {
  uni.navigateTo({ url: '/pages/wardrobe/wardrobe' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/settings/settings' })
}
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
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 32rpx 0;
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
}

.menu-item {
  padding: 32rpx;
  border-bottom: 1rpx solid $color-border;
}
</style>
