<template>
  <view class="container">
    <view class="header">
      <text class="title">畲韵商城</text>
      <text class="cart-link" @click="goCart">🛒 购物车</text>
    </view>

    <!-- 搜索 -->
    <view class="search-row">
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索文创商品"
        placeholder-class="placeholder"
        confirm-type="search"
        @confirm="reload"
      />
    </view>

    <!-- 分类 -->
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
    <view v-else-if="products.length === 0" class="empty"><text>暂无商品</text></view>

    <view class="product-list">
      <view class="product" v-for="p in products" :key="p.id" @click="goDetail(p.id)">
        <image class="product-img" :src="p.mainImage" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name">{{ p.name }}</text>
          <text class="product-subtitle">{{ p.subtitle }}</text>
          <view class="product-bottom">
            <text class="product-price">¥{{ formatPrice(p.price) }}</text>
            <text class="product-sold" v-if="p.totalSold">已售 {{ p.totalSold }}</text>
            <text class="blind-tag" v-if="p.isBlindBox">盲盒</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { getShopCategories, getShopProducts } from '@/api/shop'
import { formatPrice } from '@/utils/format'
import { ROUTE_PATHS } from '@/router/routes'
import { requireLogin } from '@/utils/login'

const categories = ref([{ key: '', label: '全部' }])
const activeCategory = ref('')
const products = ref([])
const keyword = ref('')
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const pageSize = 10

async function loadCategories() {
  try {
    const list = await getShopCategories()
    if (Array.isArray(list) && list.length) {
      categories.value = [{ key: '', label: '全部' }, ...list]
    }
  } catch (error) {
    console.warn('load shop categories failed', error)
  }
}

async function loadProducts(reset = false) {
  if (loading.value) return
  loading.value = true
  try {
    const params = {
      categoryId: activeCategory.value,
      keyword: keyword.value,
      page: reset ? 1 : page.value,
      pageSize,
    }
    const data = await getShopProducts(params)
    const list = data && data.items ? data.items : []
    total.value = (data && data.total) || list.length
    if (reset) {
      products.value = list
      page.value = 2
    } else {
      products.value = products.value.concat(list)
      page.value += 1
    }
  } catch (error) {
    console.error('load products failed', error)
    if (reset) products.value = []
  } finally {
    loading.value = false
  }
}

function reload() {
  loadProducts(true)
}

function switchCategory(key) {
  activeCategory.value = key
  reload()
}

function goDetail(id) {
  uni.navigateTo({ url: `${ROUTE_PATHS.PRODUCT_DETAIL}?id=${id}` })
}

function goCart() {
  if (!requireLogin()) return
  uni.navigateTo({ url: ROUTE_PATHS.CART })
}

onShow(() => {
  loadCategories()
  reload()
})

onReachBottom(() => {
  if (products.value.length < total.value) {
    loadProducts(false)
  }
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
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.cart-link {
  font-size: 28rpx;
  color: $color-primary;
}

.search-row {
  margin: 24rpx 0 16rpx;
}

.search-input {
  background: $color-surface;
  border-radius: 40rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
}

.placeholder {
  color: #B9B4AE;
}

.categories {
  white-space: nowrap;
  margin: 16rpx 0 24rpx;
}

.category-row {
  display: inline-flex;
  gap: 16rpx;
}

.category {
  padding: 12rpx 28rpx;
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

.product-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.product {
  display: flex;
  gap: 20rpx;
  background: $color-surface;
  border-radius: 24rpx;
  padding: 20rpx;
}

.product-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: #F1EFEC;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 30rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-subtitle {
  font-size: 24rpx;
  color: $color-text-secondary;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-bottom {
  display: flex;
  align-items: center;
  margin-top: auto;
  gap: 12rpx;
}

.product-price {
  font-size: 32rpx;
  font-weight: 700;
  color: $color-primary;
}

.product-sold {
  font-size: 22rpx;
  color: $color-text-secondary;
}

.blind-tag {
  font-size: 20rpx;
  color: #B8860B;
  background: #FBF3E0;
  padding: 2rpx 12rpx;
  border-radius: 12rpx;
}
</style>
