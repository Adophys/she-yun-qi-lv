<template>
  <view class="container">
    <view class="header">
      <text class="title">成就勋章</text>
      <text class="subtitle">已解锁 {{ unlockedCount }} / {{ achievements.length }}</text>
    </view>

    <view v-if="loading" class="loading"><text>加载中...</text></view>
    <view v-else class="grid">
      <view class="badge" v-for="item in achievements" :key="item.id" :class="{ locked: !item.unlocked }">
        <view class="badge-icon" :class="{ locked: !item.unlocked }">
          <image v-if="item.iconUrl" class="badge-img" :src="item.iconUrl" mode="aspectFit" />
          <text v-else class="badge-emoji">{{ item.unlocked ? '🏅' : '🔒' }}</text>
        </view>
        <text class="badge-name">{{ item.name }}</text>
        <text class="badge-desc">{{ item.description || item.unlockCondition || '' }}</text>
        <text class="badge-time" v-if="item.unlocked && item.unlockedAt">
          获得于 {{ formatDate(item.unlockedAt) }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAchievements } from '@/api/achievements'
import { formatDate } from '@/utils/format'

const achievements = ref([])
const loading = ref(false)

const unlockedCount = computed(() => achievements.value.filter((a) => a.unlocked).length)

async function load() {
  loading.value = true
  try {
    achievements.value = await getAchievements()
  } catch (error) {
    console.error('load achievements failed', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onShow(() => {
  load()
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.subtitle {
  font-size: 24rpx;
  color: $color-text-secondary;
}

.loading {
  margin-top: 120rpx;
  text-align: center;
  color: $color-text-secondary;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.badge {
  background: $color-surface;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  text-align: center;
}

.badge.locked {
  opacity: 0.6;
}

.badge-icon {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto;
  border-radius: 50%;
  background: #FBF3E0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
}

.badge-icon.locked {
  background: #F1EFEC;
  filter: grayscale(1);
}

.badge-img {
  width: 100rpx;
  height: 100rpx;
}

.badge-emoji {
  font-size: 56rpx;
}

.badge-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  margin-top: 16rpx;
}

.badge-desc {
  display: block;
  font-size: 24rpx;
  color: $color-text-secondary;
  margin-top: 8rpx;
  line-height: 1.5;
}

.badge-time {
  display: block;
  font-size: 22rpx;
  color: #B8860B;
  margin-top: 8rpx;
}
</style>
