<template>
  <view class="container">
    <text class="title">IP衣橱</text>
    <view class="categories">
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
    <view class="items">
      <view class="item" v-for="item in items" :key="item.id">
        <image :src="item.image" mode="aspectFit" />
        <text>{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const active = ref('clothes')
const categories = [
  { key: 'clothes', label: '服饰' },
  { key: 'headwear', label: '头饰' },
  { key: 'accessories', label: '配饰' },
  { key: 'skins', label: '皮肤' },
]

const items = ref([
  { id: '1', name: '凤凰华服', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400' },
])
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
}

.category.active {
  background: $color-primary;
  color: #fff;
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

.item image {
  width: 200rpx;
  height: 200rpx;
}
</style>
