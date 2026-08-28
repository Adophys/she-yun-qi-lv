<template>
  <view class="container" v-if="product">
    <!-- 商品图轮播 -->
    <swiper class="gallery" indicator-dots circular>
      <swiper-item v-for="(img, index) in images" :key="index">
        <image class="gallery-img" :src="img" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <view class="content">
      <view class="price-row">
        <text class="price">¥{{ formatPrice(currentPrice) }}</text>
        <text class="blind-tag" v-if="product.isBlindBox">盲盒 · 概率公示</text>
      </view>
      <text class="name">{{ product.name }}</text>
      <text class="subtitle" v-if="product.subtitle">{{ product.subtitle }}</text>

      <!-- 规格 -->
      <view class="section" v-if="product.skus && product.skus.length">
        <text class="section-title">选择规格</text>
        <view class="sku-row">
          <view
            class="sku"
            v-for="sku in product.skus"
            :key="sku.id"
            :class="{ active: selectedSku && selectedSku.id === sku.id }"
            @click="selectSku(sku)"
          >
            <text>{{ sku.specs || '默认' }}</text>
            <text class="sku-price">¥{{ formatPrice(sku.price) }}</text>
          </view>
        </view>
      </view>

      <!-- 盲盒概率 -->
      <view class="section" v-if="product.isBlindBox && product.blindBoxOdds && product.blindBoxOdds.length">
        <text class="section-title">款式概率公示</text>
        <view class="odds" v-for="(odd, index) in product.blindBoxOdds" :key="index">
          <text>{{ odd.name }}</text>
          <text>{{ odd.probability }}</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">商品介绍</text>
        <text class="desc">{{ product.description || '暂无介绍' }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer">
      <view class="footer-btn" @click="goCart">🛒</view>
      <button class="add-btn" @click="addToCart">加入购物车</button>
      <button class="buy-btn" @click="buyNow">立即购买</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getShopProduct, addCartItem } from '@/api/shop'
import { formatPrice } from '@/utils/format'
import { friendlyMessage } from '@/api/errors'
import { ROUTE_PATHS } from '@/router/routes'
import { requireLogin } from '@/utils/login'

const product = ref(null)
const selectedSku = ref(null)

const images = computed(() => {
  const list = (product.value && product.value.images) || []
  return list.length ? list : product.value && product.value.mainImage ? [product.value.mainImage] : []
})

const currentPrice = computed(() => {
  if (selectedSku.value && selectedSku.value.price !== undefined) return selectedSku.value.price
  if (product.value && product.value.price !== undefined) return product.value.price
  const sku = product.value && product.value.skus && product.value.skus[0]
  return sku ? sku.price : 0
})

onLoad(async (query) => {
  const id = query && query.id
  if (!id) return
  try {
    product.value = await getShopProduct(id)
    if (product.value.skus && product.value.skus.length) {
      selectedSku.value = product.value.skus[0]
    }
  } catch (error) {
    uni.showToast({ title: friendlyMessage(error, '加载商品失败'), icon: 'none' })
  }
})

function selectSku(sku) {
  selectedSku.value = sku
}

async function addToCart() {
  if (!requireLogin()) return
  if (!selectedSku.value) {
    uni.showToast({ title: '请先选择规格', icon: 'none' })
    return
  }
  try {
    await addCartItem(selectedSku.value.id, 1)
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: friendlyMessage(error, '加入购物车失败'), icon: 'none' })
  }
}

function buyNow() {
  if (!requireLogin()) return
  if (!selectedSku.value) {
    uni.showToast({ title: '请先选择规格', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `${ROUTE_PATHS.ORDER_CONFIRM}?skuId=${selectedSku.value.id}&quantity=1`,
  })
}

function goCart() {
  if (!requireLogin()) return
  uni.navigateTo({ url: ROUTE_PATHS.CART })
}
</script>

<style lang="scss" scoped>
.container {
  background: $color-bg;
  min-height: 100vh;
  padding-bottom: 160rpx;
}

.gallery {
  width: 100%;
  height: 560rpx;
  background: #F1EFEC;
}

.gallery-img {
  width: 100%;
  height: 100%;
}

.content {
  padding: 32rpx;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.price {
  font-size: 48rpx;
  font-weight: 800;
  color: $color-primary;
}

.blind-tag {
  font-size: 22rpx;
  color: #B8860B;
  background: #FBF3E0;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}

.name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  margin-top: 16rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: $color-text-secondary;
  margin-top: 8rpx;
}

.section {
  margin-top: 40rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.sku-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.sku {
  background: $color-surface;
  border: 2rpx solid $color-border;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  text-align: center;
}

.sku.active {
  border-color: $color-primary;
  background: #F6E3E8;
}

.sku-price {
  display: block;
  font-size: 22rpx;
  color: $color-text-secondary;
  margin-top: 4rpx;
}

.odds {
  display: flex;
  justify-content: space-between;
  background: $color-surface;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  font-size: 26rpx;
}

.desc {
  display: block;
  line-height: 1.8;
  color: $color-text-secondary;
  font-size: 28rpx;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 16rpx 32rpx calc(env(safe-area-inset-bottom) + 16rpx);
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.footer-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.add-btn {
  flex: 1;
  background: #1E2A4A;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin: 0;
}

.buy-btn {
  flex: 1;
  background: $color-primary;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin: 0;
}

.add-btn::after,
.buy-btn::after {
  border: none;
}
</style>
