<template>
  <view class="container">
    <text class="title">设置</text>
    <view class="menu">
      <view class="menu-item">
        <text>音效</text>
        <switch :checked="soundEnabled" />
      </view>
      <view class="menu-item">
        <text>通知</text>
        <switch :checked="notificationsEnabled" />
      </view>
      <view class="menu-item" @click="clearCache">
        <text>清除缓存</text>
        <text class="extra">128 MB</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const soundEnabled = ref(true)
const notificationsEnabled = ref(true)

function clearCache() {
  uni.showToast({ title: '已清除', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.menu {
  margin-top: 32rpx;
  background: $color-surface;
  border-radius: 24rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid $color-border;
}

.extra {
  color: $color-text-secondary;
}
</style>
