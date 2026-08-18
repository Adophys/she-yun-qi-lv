<template>
  <view class="container">
    <text class="title">文化图鉴</text>
    <view class="categories">
      <text
        v-for="cat in categories"
        :key="cat.key"
        class="category"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </text>
    </view>
    <view class="grid">
      <view class="item" v-for="item in items" :key="item.id" @click="viewDetail(item)">
        <image :src="item.image" mode="aspectFill" />
        <text>{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const activeCategory = ref('clothing')
const categories = [
  { key: 'clothing', label: '服饰' },
  { key: 'pattern', label: '纹样' },
  { key: 'music', label: '音乐' },
  { key: 'cuisine', label: '饮食' },
  { key: 'craft', label: '工艺' },
]

const items = ref([
  { id: '1', name: '凤凰装', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400' },
  { id: '2', name: '花斗笠', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400' },
])

function viewDetail(item) {
  uni.navigateTo({ url: '/pages/item-detail/item-detail?id=' + item.id })
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

.categories {
  display: flex;
  gap: 16rpx;
  margin: 32rpx 0;
}

.category {
  padding: 16rpx 32rpx;
  background: $color-surface;
  border-radius: 32rpx;
  font-size: 26rpx;
}

.category.active {
  background: $color-primary;
  color: #fff;
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

.item image {
  width: 100%;
  height: 280rpx;
}

.item text {
  display: block;
  padding: 16rpx;
  font-weight: 600;
}
</style>
