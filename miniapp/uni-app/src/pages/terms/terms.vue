<template>
  <view class="container">
    <view class="tabs">
      <text class="tab" :class="{ active: type === 'agreement' }" @click="type = 'agreement'">用户协议</text>
      <text class="tab" :class="{ active: type === 'privacy' }" @click="type = 'privacy'">隐私政策</text>
    </view>

    <view class="doc">
      <text class="doc-title">{{ doc.title }}</text>
      <text class="doc-meta">版本 {{ doc.version }} · 更新于 {{ doc.updatedAt }}</text>
      <view class="section" v-for="(section, index) in doc.sections" :key="index">
        <text class="section-title">{{ section.title }}</text>
        <text class="section-body">{{ section.body }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { PRIVACY_POLICY, USER_AGREEMENT } from '@/constants/privacy'

const type = ref('agreement')

const doc = computed(() => (type.value === 'privacy' ? PRIVACY_POLICY : USER_AGREEMENT))

onLoad((query) => {
  if (query && query.type === 'privacy') {
    type.value = 'privacy'
  }
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
}

.tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.tab {
  padding: 14rpx 40rpx;
  background: $color-surface;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: $color-text-secondary;
}

.tab.active {
  background: $color-primary;
  color: #fff;
}

.doc {
  background: $color-surface;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
}

.doc-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
}

.doc-meta {
  display: block;
  font-size: 24rpx;
  color: $color-text-secondary;
  margin: 12rpx 0 32rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.section-body {
  display: block;
  font-size: 28rpx;
  line-height: 1.8;
  color: $color-text-secondary;
  white-space: pre-line;
}
</style>
