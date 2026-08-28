<template>
  <view class="container">
    <text class="title">设置</text>

    <view class="menu">
      <view class="menu-item">
        <text>音效</text>
        <switch :checked="soundEnabled" color="#8B1E3F" @change="toggleSound" />
      </view>
      <view class="menu-item">
        <text>消息通知</text>
        <switch :checked="notificationsEnabled" color="#8B1E3F" @change="toggleNotifications" />
      </view>
      <view class="menu-item" @click="clearCache">
        <text>清除缓存</text>
        <text class="extra">{{ cacheSize }} MB</text>
      </view>
      <view class="menu-item" @click="goTerms('agreement')">
        <text>用户协议</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goTerms('privacy')">
        <text>隐私政策</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="showFeedback = true">
        <text>帮助与反馈</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" v-if="isLoggedIn" @click="handleDeleteAccount">
        <text class="danger">注销账号</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 帮助与反馈 -->
    <view class="mask" v-if="showFeedback" @click="showFeedback = false">
      <view class="sheet" @click.stop>
        <text class="sheet-title">帮助与反馈</text>
        <view class="faq">
          <text class="faq-q">Q：如何解锁文化卡片？</text>
          <text class="faq-a">在「扫描」页扫描线下点位二维码或 NFC 标签，首次解锁即可获得卡片与积分。</text>
          <text class="faq-q">Q：如何合成衣橱道具？</text>
          <text class="faq-a">扫描解锁会随机掉落碎片，碎片集齐后可在「IP 衣橱」中合成。</text>
        </view>
        <textarea
          class="feedback-input"
          v-model="feedback"
          placeholder="写下你的建议或遇到的问题..."
          placeholder-class="placeholder"
        />
        <button class="submit-btn" @click="submitFeedback">提交反馈</button>
        <button class="close-btn" @click="showFeedback = false">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useSessionStore } from '@/stores/session'
import { STORAGE_KEYS } from '@/storage/keys'
import { ROUTE_PATHS } from '@/router/routes'

const { isLoggedIn, logout } = useSessionStore()

const soundEnabled = ref(true)
const notificationsEnabled = ref(true)
const cacheSize = ref(0)
const showFeedback = ref(false)
const feedback = ref('')

function loadSettings() {
  const saved = uni.getStorageSync(STORAGE_KEYS.SETTINGS)
  if (saved) {
    try {
      const s = JSON.parse(saved)
      soundEnabled.value = s.sound !== false
      notificationsEnabled.value = s.notifications !== false
    } catch (e) {
      // ignore
    }
  }
  const info = uni.getStorageInfoSync()
  cacheSize.value = Math.max(0, Math.round((info.currentSize || 0) / 1024))
}

function saveSettings() {
  uni.setStorageSync(
    STORAGE_KEYS.SETTINGS,
    JSON.stringify({ sound: soundEnabled.value, notifications: notificationsEnabled.value })
  )
}

function toggleSound(e) {
  soundEnabled.value = e.detail.value
  saveSettings()
}

function toggleNotifications(e) {
  notificationsEnabled.value = e.detail.value
  saveSettings()
}

function clearCache() {
  uni.showModal({
    title: '清除缓存',
    content: `将清除本地缓存（约 ${cacheSize.value} MB），不会影响账号数据，确定继续？`,
    success: (res) => {
      if (!res.confirm) return
      try {
        // 保留登录态，仅清除其余本地缓存
        const token = uni.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
        const refreshToken = uni.getStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
        const user = uni.getStorageSync(STORAGE_KEYS.USER)
        uni.clearStorageSync()
        if (token) uni.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, token)
        if (refreshToken) uni.setStorageSync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        if (user) uni.setStorageSync(STORAGE_KEYS.USER, user)
      } catch (e) {
        // ignore
      }
      loadSettings()
      uni.showToast({ title: '已清除', icon: 'success' })
    },
  })
}

function goTerms(type) {
  uni.navigateTo({ url: `${ROUTE_PATHS.TERMS}?type=${type}` })
}

function submitFeedback() {
  const content = (feedback.value || '').trim()
  if (!content) {
    uni.showToast({ title: '请先输入反馈内容', icon: 'none' })
    return
  }
  // 后端支持 /support/feedback 后可改为接口提交；当前先本地保存
  const history = uni.getStorageSync(STORAGE_KEYS.FEEDBACK_HISTORY) || []
  const list = typeof history === 'string' ? [] : history
  list.push({ content, time: new Date().toISOString() })
  uni.setStorageSync(STORAGE_KEYS.FEEDBACK_HISTORY, list)
  feedback.value = ''
  showFeedback.value = false
  uni.showToast({ title: '感谢你的反馈！', icon: 'success' })
}

function handleDeleteAccount() {
  uni.showModal({
    title: '注销账号',
    content: '注销后将删除/匿名化你的账号数据，且不可恢复。若存在未完成订单，请联系客服处理。确定注销吗？',
    confirmText: '确认注销',
    confirmColor: '#DC2626',
    success: (res) => {
      if (!res.confirm) return
      try {
        // 后端提供 DELETE /users/me 后调用真实注销接口
        // import { deleteAccount } from '@/api/auth'
        // await deleteAccount()
        logout()
        uni.clearStorageSync()
        uni.showToast({ title: '已注销', icon: 'success' })
        setTimeout(() => {
          uni.reLaunch({ url: ROUTE_PATHS.INDEX })
        }, 800)
      } catch (e) {
        uni.showToast({ title: '注销失败，请稍后重试', icon: 'none' })
      }
    },
  })
}

onShow(() => {
  loadSettings()
})
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
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid $color-border;
  font-size: 30rpx;
}

.menu-item:last-child {
  border-bottom: none;
}

.extra {
  color: $color-text-secondary;
  font-size: 26rpx;
}

.arrow {
  color: $color-border;
  font-size: 36rpx;
}

.danger {
  color: #DC2626;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.sheet {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx calc(env(safe-area-inset-bottom) + 32rpx);
}

.sheet-title {
  display: block;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
}

.faq {
  background: $color-bg;
  border-radius: 16rpx;
  padding: 24rpx;
}

.faq-q {
  display: block;
  font-weight: 600;
  font-size: 28rpx;
  margin-top: 16rpx;
}

.faq-a {
  display: block;
  font-size: 26rpx;
  color: $color-text-secondary;
  line-height: 1.6;
  margin-top: 8rpx;
}

.feedback-input {
  width: 100%;
  height: 180rpx;
  background: $color-bg;
  border-radius: 16rpx;
  margin-top: 24rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.placeholder {
  color: #B9B4AE;
}

.submit-btn {
  margin-top: 24rpx;
  background: $color-primary;
  color: #fff;
  border-radius: 40rpx;
}

.submit-btn::after {
  border: none;
}

.close-btn {
  margin-top: 16rpx;
  background: $color-bg;
  color: $color-text-secondary;
  border-radius: 40rpx;
}

.close-btn::after {
  border: none;
}
</style>

