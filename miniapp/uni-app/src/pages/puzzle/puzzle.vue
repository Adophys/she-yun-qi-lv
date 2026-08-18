<template>
  <view class="container">
    <view class="progress-bar">
      <text>拼图进度 7/10</text>
    </view>
    <view class="puzzle-board">
      <text>凤凰纹样拼图区域</text>
    </view>
    <button class="submit-btn" @click="submit">完成拼图</button>
  </view>
</template>

<script setup>
function submit() {
  uni.showToast({ title: '挑战成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 1500)
}
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
}

.progress-bar {
  margin-bottom: 32rpx;
  font-weight: 600;
}

.puzzle-board {
  height: 600rpx;
  background: $color-surface;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-text-secondary;
}

.submit-btn {
  margin-top: 48rpx;
  background: $color-primary;
  color: #fff;
  border-radius: 48rpx;
}
</style>
