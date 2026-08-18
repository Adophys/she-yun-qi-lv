<template>
  <view class="container">
    <text class="title">AR / NFC 扫描</text>
    <view class="scan-area">
      <text>对准畲族文化符号或 NFC 卡片</text>
    </view>
    <button class="scan-btn" @click="scan">开始扫描</button>
  </view>
</template>

<script setup>
function scan() {
  uni.scanCode({
    success: (res) => {
      uni.showToast({ title: '识别成功', icon: 'success' })
      console.log(res.result)
    },
  })
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

.scan-area {
  margin: 64rpx 0;
  height: 400rpx;
  background: $color-surface;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-text-secondary;
}

.scan-btn {
  background: $color-primary;
  color: #fff;
  border-radius: 48rpx;
}
</style>
