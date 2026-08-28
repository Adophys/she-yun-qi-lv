<template>
  <view class="container">
    <view class="header">
      <text class="title">扫码解锁</text>
      <text class="subtitle">扫描畲族文化点位，解锁图鉴卡片</text>
    </view>

    <view class="scan-area" @click="startScan">
      <text class="scan-icon">📷</text>
      <text class="scan-hint">对准二维码 / NFC 点位进行扫描</text>
      <text class="scan-sub">没有 NFC 手机也可以扫二维码哦</text>
    </view>

    <button class="scan-btn" @click="startScan">开始扫描</button>

    <!-- NFC / 手动输入兜底 -->
    <view class="manual">
      <text class="manual-title">NFC 或手动输入码值</text>
      <view class="manual-row">
        <input
          class="manual-input"
          v-model="manualCode"
          placeholder="输入点位码值，如 SJZ001"
          placeholder-class="placeholder"
        />
        <button class="manual-btn" @click="submitCode">识别</button>
      </view>
    </view>

    <!-- 扫描结果弹窗 -->
    <view class="mask" v-if="showResult" @click="closeResult">
      <view class="result-card" @click.stop>
        <text class="result-title">{{ result.isNew ? '解锁成功！' : '已解锁过' }}</text>
        <text class="result-name">{{ result.matchedItemName || '文化卡片' }}</text>
        <text class="result-node" v-if="result.nodeName">点位：{{ result.nodeName }}</text>
        <view class="result-rewards" v-if="result.gainedPoints > 0 || result.gainedFragment">
          <text class="reward" v-if="result.gainedPoints > 0">+{{ result.gainedPoints }} 积分</text>
          <text class="reward" v-if="result.gainedFragment">碎片：{{ result.gainedFragment }}</text>
        </view>
        <view class="result-actions">
          <button class="result-btn primary" v-if="result.matchedItemId" @click="viewDetail">
            查看图鉴详情
          </button>
          <button class="result-btn" @click="closeResult">完成</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { scanRecognize } from '@/api/scan'
import { friendlyMessage } from '@/api/errors'
import { ROUTE_PATHS } from '@/router/routes'
import { requireLogin } from '@/utils/login'

const manualCode = ref('')
const showResult = ref(false)
const result = ref({})

function startScan() {
  if (!requireLogin()) return
  uni.scanCode({
    scanType: ['qrCode', 'barCode'],
    success: (res) => {
      if (res.result) {
        recognize(res.result)
      } else {
        uni.showToast({ title: '未识别到内容', icon: 'none' })
      }
    },
    fail: (err) => {
      // 用户主动取消不提示
      if (err && err.errMsg && err.errMsg.includes('cancel')) return
      uni.showToast({ title: '打开相机失败', icon: 'none' })
    },
  })
}

function submitCode() {
  if (!requireLogin()) return
  const code = (manualCode.value || '').trim()
  if (!code) {
    uni.showToast({ title: '请输入码值', icon: 'none' })
    return
  }
  recognize(code)
}

async function recognize(code) {
  uni.showLoading({ title: '识别中...' })
  try {
    const data = await scanRecognize(code)
    result.value = data || {}
    showResult.value = true
  } catch (error) {
    uni.showToast({ title: friendlyMessage(error, '识别失败'), icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function viewDetail() {
  showResult.value = false
  uni.navigateTo({ url: `${ROUTE_PATHS.ITEM_DETAIL}?id=${result.value.matchedItemId}` })
}

function closeResult() {
  showResult.value = false
}

onShow(() => {
  // 回到页面时清空弹窗
  showResult.value = false
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
}

.header {
  margin-bottom: 32rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.subtitle {
  display: block;
  font-size: 24rpx;
  color: $color-text-secondary;
  margin-top: 8rpx;
}

.scan-area {
  height: 420rpx;
  background: $color-surface;
  border-radius: 24rpx;
  border: 2rpx dashed $color-primary-light;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.scan-icon {
  font-size: 72rpx;
}

.scan-hint {
  font-size: 30rpx;
  color: $color-text;
}

.scan-sub {
  font-size: 24rpx;
  color: $color-text-secondary;
}

.scan-btn {
  margin-top: 32rpx;
  background: $color-primary;
  color: #fff;
  border-radius: 48rpx;
}

.scan-btn::after {
  border: none;
}

.manual {
  margin-top: 48rpx;
  background: $color-surface;
  border-radius: 24rpx;
  padding: 24rpx;
}

.manual-title {
  font-size: 26rpx;
  color: $color-text-secondary;
}

.manual-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 16rpx;
}

.manual-input {
  flex: 1;
  background: $color-bg;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
}

.placeholder {
  color: #B9B4AE;
}

.manual-btn {
  background: $color-primary;
  color: #fff;
  font-size: 26rpx;
  border-radius: 16rpx;
  padding: 0 32rpx;
  line-height: 72rpx;
  margin: 0;
}

.manual-btn::after {
  border: none;
}

/* 结果弹窗 */
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $color-primary;
}

.result-name {
  font-size: 32rpx;
  margin-top: 24rpx;
  font-weight: 600;
}

.result-node {
  font-size: 24rpx;
  color: $color-text-secondary;
  margin-top: 8rpx;
}

.result-rewards {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.reward {
  background: #FFF3E0;
  color: #B8860B;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
}

.result-actions {
  width: 100%;
  margin-top: 40rpx;
}

.result-btn {
  margin-top: 16rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.result-btn.primary {
  background: $color-primary;
  color: #fff;
}

.result-btn.primary::after {
  border: none;
}
</style>
