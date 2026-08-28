<template>
  <view class="container">
    <view class="header">
      <text class="title">文化图鉴</text>
      <text class="subtitle">已解锁 {{ discoveredCount }} / {{ items.length }}</text>
    </view>

    <scroll-view class="categories" scroll-x>
      <view class="category-row">
        <text
          v-for="cat in categories"
          :key="cat.key"
          class="category"
          :class="{ active: activeCategory === cat.key }"
          @click="switchCategory(cat.key)"
        >
          {{ cat.label }}
        </text>
      </view>
    </scroll-view>

    <view v-if="loading" class="loading"><text>加载中...</text></view>
    <view v-else-if="items.length === 0" class="empty"><text>该分类暂无内容</text></view>

    <view class="grid">
      <view class="item" v-for="item in items" :key="item.id" @click="viewDetail(item)">
        <view class="image-wrap">
          <image
            class="item-image"
            :class="{ locked: !item.isDiscovered }"
            :src="item.imageUrl"
            mode="aspectFill"
          />
          <view class="lock-mask" v-if="!item.isDiscovered">
            <text class="lock-text">未解锁</text>
          </view>
          <text class="rarity" :style="{ color: rarityColor(item.rarity) }">
            {{ rarityLabel(item.rarity) }}
          </text>
        </view>
        <text class="item-name" :class="{ locked: !item.isDiscovered }">{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCulturalItems } from '@/api/cultural'
import { CULTURAL_CATEGORIES, rarityLabel, rarityColor } from '@/constants/cultural'
import { ROUTE_PATHS } from '@/router/routes'
import albums from '@/config/albums.json'

const activeCategory = ref('')
const items = ref([])
const loading = ref(false)

const categories = [{ key: '', label: '全部' }, ...CULTURAL_CATEGORIES]

const discoveredCount = computed(() => items.value.filter((i) => i.isDiscovered).length)

async function loadItems() {
  loading.value = true
  try {
    const remote = await getCulturalItems({ category: activeCategory.value })
    // 合并本地图库（static/albums 自动登记，分类与后端一致）
    const local = albums
      .filter((a) => !activeCategory.value || a.category === activeCategory.value)
      .map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        rarity: a.rarity,
        imageUrl: a.image,
        isDiscovered: a.isDiscovered,
      }))
    items.value = remote.concat(local)
  } catch (error) {
    console.error('load cultural items failed', error)
    uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function switchCategory(key) {
  activeCategory.value = key
  loadItems()
}

function viewDetail(item) {
  uni.navigateTo({ url: `${ROUTE_PATHS.ITEM_DETAIL}?id=${item.id}` })
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

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.item {
  background: $color-surface;
  border-radius: 24rpx;
  overflow: hidden;
}

.image-wrap {
  position: relative;
}

.item-image {
  width: 100%;
  height: 280rpx;
  display: block;
  background: #F1EFEC;
}

.item-image.locked {
  filter: grayscale(1);
  opacity: 0.45;
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
  background: rgba(0, 0, 0, 0.2);
}

.lock-text {
  color: #fff;
  font-size: 26rpx;
  background: rgba(0, 0, 0, 0.5);
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
}

.rarity {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  font-size: 20rpx;
  background: rgba(255, 255, 255, 0.92);
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
}

.item-name {
  display: block;
  padding: 16rpx;
  font-weight: 600;
  font-size: 28rpx;
}

.item-name.locked {
  color: #9CA3AF;
}
</style>

