<template>
  <view class="container" v-if="item">
    <view class="cover-wrap">
      <image class="cover" :src="item.imageUrl" mode="aspectFill" />
      <view class="lock-mask" v-if="!item.isDiscovered">
        <text class="lock-text">🔒 尚未解锁</text>
      </view>
      <text class="rarity" :style="{ color: rarityColor(item.rarity), background: rarityBg(item.rarity) }">
        {{ rarityLabel(item.rarity) }}
      </text>
    </view>

    <view class="content">
      <view class="head">
        <view>
          <text class="name">{{ item.name }}</text>
          <text class="pinyin" v-if="item.pinyin">{{ item.pinyin }}</text>
        </view>
        <view class="meta-pill" v-if="item.isDiscovered">
          <text class="meta-pill-text">已解锁</text>
        </view>
      </view>

      <view class="info-grid">
        <view class="info-item" v-if="item.origin">
          <text class="info-label">发源地</text>
          <text class="info-value">{{ item.origin }}</text>
        </view>
        <view class="info-item" v-if="item.material">
          <text class="info-label">材质</text>
          <text class="info-value">{{ item.material }}</text>
        </view>
        <view class="info-item" v-if="item.symbolism">
          <text class="info-label">象征</text>
          <text class="info-value">{{ item.symbolism }}</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">文化内涵</text>
        <text class="desc">{{ item.description || '暂无介绍' }}</text>
      </view>

      <button
        v-if="!item.isDiscovered"
        class="collect-btn"
        @click="goScan"
      >
        前往扫码解锁
      </button>
      <button v-else class="collect-btn" open-type="share">
        分享给好友
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { getCulturalItem } from '@/api/cultural'
import { rarityLabel, rarityColor } from '@/constants/cultural'
import { ROUTE_PATHS } from '@/router/routes'
import albums from '@/config/albums.json'

const item = ref(null)

onLoad(async (query) => {
  const id = query && query.id
  if (!id) {
    uni.showToast({ title: '参数错误', icon: 'none' })
    return
  }
  // 本地图库条目：直接展示本地图片与名称
  const album = albums.find((a) => a.id === id)
  if (album) {
    item.value = {
      id: album.id,
      name: album.name,
      pinyin: '',
      category: album.category,
      rarity: album.rarity,
      origin: '本地图库',
      material: '',
      symbolism: '',
      description: '由本地图片自动收录的文化收藏，可在探索页「凤凰拼图库」中用这张图片玩拼图。',
      imageUrl: album.image,
      isDiscovered: true,
    }
    return
  }
  try {
    item.value = await getCulturalItem(id)
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
})

function rarityBg(key) {
  const map = { common: '#F1EFEC', rare: '#FBF3E0', legendary: '#F6E3E8' }
  return map[key] || '#F1EFEC'
}

function goScan() {
  uni.switchTab({ url: ROUTE_PATHS.SCAN })
}

onShareAppMessage(() => {
  const it = item.value || {}
  return {
    title: it.name ? `【畲韵奇旅】${it.name} — 一起探索畲族文化` : '畲韵奇旅 - 畲族文化数字化体验',
    path: `/pages/item-detail/item-detail?id=${it.id || ''}`,
    imageUrl: it.imageUrl || '',
  }
})
</script>

<style lang="scss" scoped>
.container {
  background: $color-bg;
  min-height: 100vh;
}

.cover-wrap {
  position: relative;
}

.cover {
  width: 100%;
  height: 500rpx;
  background: #F1EFEC;
}

.lock-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.lock-text {
  color: #fff;
  font-size: 30rpx;
  background: rgba(0, 0, 0, 0.55);
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
}

.rarity {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  font-size: 22rpx;
  padding: 6rpx 20rpx;
  border-radius: 16rpx;
}

.content {
  padding: 32rpx;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.name {
  font-size: 48rpx;
  font-weight: 700;
}

.pinyin {
  display: block;
  color: $color-text-secondary;
  margin-top: 8rpx;
  font-size: 26rpx;
}

.meta-pill {
  background: #E8F5E9;
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
}

.meta-pill-text {
  color: #16A34A;
  font-size: 24rpx;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 32rpx;
}

.info-item {
  background: $color-surface;
  border-radius: 16rpx;
  padding: 20rpx;
}

.info-label {
  display: block;
  font-size: 22rpx;
  color: $color-text-secondary;
}

.info-value {
  display: block;
  font-size: 26rpx;
  margin-top: 8rpx;
  font-weight: 500;
}

.section {
  margin-top: 32rpx;
}

.section-title {
  display: block;
  font-weight: 700;
  margin-bottom: 16rpx;
  font-size: 30rpx;
}

.desc {
  display: block;
  line-height: 1.8;
  color: $color-text-secondary;
  font-size: 28rpx;
}

.collect-btn {
  margin-top: 48rpx;
  background: #1E2A4A;
  color: #fff;
  border-radius: 48rpx;
}

.collect-btn::after {
  border: none;
}
</style>

