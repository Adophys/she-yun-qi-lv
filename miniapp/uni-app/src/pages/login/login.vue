<template>
  <view class="container">
    <view class="logo">
      <text class="logo-title">畲韵奇旅</text>
      <text class="logo-sub">畲族文化数字化体验平台</text>
    </view>

    <view class="features">
      <view class="feature">🔍 扫码解锁文化图鉴</view>
      <view class="feature">🧩 章节探索与凤凰拼图</view>
      <view class="feature">🧥 IP 衣橱换装与成就收集</view>
    </view>

    <button class="login-btn" :loading="loading" @click="handleLogin">微信一键登录</button>
    <button class="guest-btn" @click="goGuest">先逛逛（游客模式）</button>

    <text class="agreement">
      登录即代表同意
      <text class="link" @click="goTerms('agreement')">《用户协议》</text>
      与
      <text class="link" @click="goTerms('privacy')">《隐私政策》</text>
    </text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { wxLogin } from '@/api/auth'
import { getMe } from '@/api/users'
import { useSessionStore } from '@/stores/session'
import { friendlyMessage } from '@/api/errors'
import { ROUTE_PATHS } from '@/router/routes'

const { setSession } = useSessionStore()
const loading = ref(false)
const redirect = ref('')

onLoad((query) => {
  if (query && query.redirect) {
    redirect.value = decodeURIComponent(query.redirect)
  }
})

async function handleLogin() {
  if (loading.value) return
  loading.value = true
  uni.showLoading({ title: '登录中...' })
  try {
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => resolve(res),
        fail: (err) => reject(err),
      })
    })
    const data = await wxLogin(loginRes.code)
    setSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: null,
    })
    // 拉取用户资料
    try {
      const me = await getMe()
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: me.id,
          nickname: me.nickname,
          avatarUrl: me.avatarUrl,
          level: me.level,
          points: me.points,
          discoveredCount: me.discoveredCount,
          exploreCompleted: me.exploreCompleted,
        },
      })
    } catch (e) {
      // 用户资料拉取失败不阻断登录
      console.warn('fetch me failed', e)
    }
    uni.hideLoading()
    uni.showToast({ title: data.isNewUser ? '欢迎加入畲韵奇旅！' : '登录成功', icon: 'success' })
    goBack()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: friendlyMessage(error, '登录失败，请重试'), icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  const target = redirect.value && redirect.value.startsWith('/') ? redirect.value : ''
  if (target) {
    const tabPages = [ROUTE_PATHS.INDEX, ROUTE_PATHS.EXPLORE, ROUTE_PATHS.SCAN, ROUTE_PATHS.COLLECTION, ROUTE_PATHS.MINE]
    if (tabPages.includes(target)) {
      uni.switchTab({ url: target })
    } else {
      uni.redirectTo({ url: target })
    }
  } else {
    uni.switchTab({ url: ROUTE_PATHS.INDEX })
  }
}

function goGuest() {
  goBack()
}

function goTerms(type) {
  uni.navigateTo({ url: `${ROUTE_PATHS.TERMS}?type=${type}` })
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
  box-sizing: border-box;
}

.logo {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo-title {
  display: block;
  font-size: 64rpx;
  font-weight: 800;
  color: $color-primary;
}

.logo-sub {
  display: block;
  font-size: 26rpx;
  color: $color-text-secondary;
  margin-top: 16rpx;
}

.features {
  width: 100%;
  margin-bottom: 64rpx;
}

.feature {
  font-size: 28rpx;
  color: $color-text-secondary;
  padding: 16rpx 32rpx;
  text-align: left;
}

.login-btn {
  width: 100%;
  background: $color-primary;
  color: #fff;
  border-radius: 48rpx;
}

.login-btn::after {
  border: none;
}

.guest-btn {
  width: 100%;
  margin-top: 24rpx;
  background: $color-surface;
  color: $color-text-secondary;
  border-radius: 48rpx;
  border: 1rpx solid $color-border;
}

.guest-btn::after {
  border: none;
}

.agreement {
  margin-top: 48rpx;
  font-size: 24rpx;
  color: $color-text-secondary;
  text-align: center;
}

.link {
  color: $color-primary;
}
</style>
