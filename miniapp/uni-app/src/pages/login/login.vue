<template>
  <view class="container">
    <text class="title">登录</text>
    <button class="login-btn" @click="wxLogin">微信一键登录</button>
  </view>
</template>

<script setup>
function wxLogin() {
  uni.login({
    provider: 'weixin',
    success: (res) => {
      console.log('wx login code', res.code)
      uni.switchTab({ url: '/pages/index/index' })
    },
  })
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: $color-bg;
  padding: 32rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  margin-bottom: 64rpx;
}

.login-btn {
  width: 100%;
  background: $color-primary;
  color: #fff;
  border-radius: 48rpx;
}
</style>
