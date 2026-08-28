<template>
  <view class="container">
    <view class="header">
      <text class="title">IP 衣橱</text>
      <text class="subtitle">集齐碎片，合成畲族装扮</text>
    </view>

    <scroll-view class="categories" scroll-x>
      <view class="category-row">
        <text
          v-for="cat in categories"
          :key="cat.key"
          class="category"
          :class="{ active: active === cat.key }"
          @click="active = cat.key"
        >
          {{ cat.label }}
        </text>
      </view>
    </scroll-view>

    <view v-if="loading" class="loading"><text>加载中...</text></view>
    <view v-else-if="filteredItems.length === 0" class="empty"><text>暂无道具</text></view>

    <view class="items">
      <view class="item" v-for="item in filteredItems" :key="item.id">
        <view class="image-wrap">
          <image class="item-image" :class="{ locked: !item.isCompleted }" :src="item.imageUrl" mode="aspectFit" />
          <text class="rarity" :style="{ color: rarityColor(item.rarity) }">{{ rarityLabel(item.rarity) }}</text>
          <text class="equipped" v-if="item.isEquipped">已穿戴</text>
        </view>
        <text class="item-name">{{ item.name }}</text>
        <view class="fragments">
          <text class="fragment-text">碎片 {{ item.fragments }}/{{ item.totalFragments }}</text>
          <view class="progress-track">
            <view
              class="progress-fill"
              :style="{ width: progressPercent(item) + '%' }"
            ></view>
          </view>
        </view>
        <button
          class="craft-btn"
          :class="{ disabled: !canCraft(item) }"
          :disabled="item.isCompleted"
          @click="craft(item)"
        >
          {{ item.isCompleted ? '已合成' : canCraft(item) ? '合成' : '碎片不足' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getWardrobeItems, craftWardrobeItem } from '@/api/wardrobe'
import { WARDROBE_CATEGORIES } from '@/constants/wardrobe'
import { rarityLabel, rarityColor } from '@/constants/cultural'
import { friendlyMessage } from '@/api/errors'

const active = ref('')
const items = ref([])
const loading = ref(false)

const categories = [{ key: '', label: '全部' }, ...WARDROBE_CATEGORIES]

const filteredItems = computed(() => {
  if (!active.value) return items.value
  return items.value.filter((i) => i.category === active.value)
})

function progressPercent(item) {
  if (!item.totalFragments) return 0
  return Math.min(100, Math.round((item.fragments / item.totalFragments) * 100))
}

function canCraft(item) {
  return !item.isCompleted && item.fragments >= item.totalFragments
}

async function loadItems() {
  loading.value = true
  try {
    items.value = await getWardrobeItems()
  } catch (error) {
    console.error('load wardrobe failed', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function craft(item) {
  if (!canCraft(item)) {
    uni.showToast({ title: '碎片不足，继续探索收集吧', icon: 'none' })
    return
  }
  uni.showLoading({ title: '合成中...' })
  try {
    const result = await craftWardrobeItem(item.id)
    uni.hideLoading()
    uni.showToast({ title: result.crafted ? '合成成功！' : '合成完成', icon: 'success' })
    await loadItems()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: friendlyMessage(error, '合成失败'), icon: 'none' })
  }
}

onShow(() => {
  loadItems()
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
}

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.subtitle {
  font-size: 24rpx;
  color: $color-text-secondary;
}

.categories {
  white-space: nowrap;
  margin: 32rpx 0;
}

.category-row {
  display: inline-flex;
  gap: 16rpx;
}

.category {
  padding: 14rpx 32rpx;
  background: $color-surface;
  border-radius: 32rpx;
  font-size: 26rpx;
  display: inline-block;
}

.category.active {
  background: $color-primary;
  color: #fff;
}

.loading,
.empty {
  margin-top: 100rpx;
  text-align: center;
  color: $color-text-secondary;
}

.items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.item {
  background: $color-surface;
  border-radius: 24rpx;
  padding: 24rpx;
  text-align: center;
}

.image-wrap {
  position: relative;
}

.item-image {
  width: 200rpx;
  height: 200rpx;
  background: #F1EFEC;
  border-radius: 16rpx;
}

.item-image.locked {
  filter: grayscale(1);
  opacity: 0.45;
}

.rarity {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  font-size: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  padding: 2rpx 12rpx;
  border-radius: 12rpx;
}

.equipped {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  font-size: 18rpx;
  background: #E8F5E9;
  color: #16A34A;
  padding: 2rpx 12rpx;
  border-radius: 12rpx;
}

.item-name {
  display: block;
  font-weight: 600;
  margin: 16rpx 0 8rpx;
  font-size: 28rpx;
}

.fragments {
  text-align: left;
}

.fragment-text {
  font-size: 22rpx;
  color: $color-text-secondary;
}

.progress-track {
  height: 12rpx;
  background: $color-border;
  border-radius: 8rpx;
  margin-top: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $color-primary-light;
  border-radius: 8rpx;
}

.craft-btn {
  margin-top: 16rpx;
  font-size: 24rpx;
  background: $color-primary;
  color: #fff;
  border-radius: 32rpx;
  line-height: 64rpx;
}

.craft-btn.disabled {
  background: $color-border;
  color: $color-text-secondary;
}

.craft-btn::after {
  border: none;
}
</style>
