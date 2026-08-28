<template>
  <view class="container">
    <view class="header">
      <text class="title">购物车</text>
      <text class="clear" @click="clearChecked">删除选中</text>
    </view>

    <view v-if="loading" class="loading"><text>加载中...</text></view>
    <view v-else-if="items.length === 0" class="empty">
      <text>购物车还是空的</text>
      <button class="go-shop" @click="goShop">去逛逛</button>
    </view>

    <view class="cart-list" v-else>
      <view class="cart-item" v-for="item in items" :key="item.skuId">
        <view class="check" :class="{ checked: item.checked }" @click="toggleCheck(item)">
          <text v-if="item.checked">✓</text>
        </view>
        <image class="item-img" :src="item.image" mode="aspectFill" @click="goDetail(item)" />
        <view class="item-info">
          <text class="item-name" @click="goDetail(item)">{{ item.name }}</text>
          <text class="item-spec" v-if="item.specs">{{ item.specs }}</text>
          <view class="item-bottom">
            <text class="item-price">¥{{ formatPrice(item.price) }}</text>
            <view class="stepper">
              <text class="step-btn" @click="changeQuantity(item, -1)">−</text>
              <text class="step-num">{{ item.quantity }}</text>
              <text class="step-btn" @click="changeQuantity(item, 1)">＋</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer" v-if="items.length > 0">
      <view class="select-all" @click="toggleAll">
        <view class="check" :class="{ checked: allChecked }"><text v-if="allChecked">✓</text></view>
        <text>全选</text>
      </view>
      <view class="total">
        <text>合计：</text>
        <text class="total-price">¥{{ formatPrice(totalPrice) }}</text>
      </view>
      <button class="checkout-btn" :disabled="checkedItems.length === 0" @click="checkout">结算</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCart, updateCartItem, removeCartItem } from '@/api/shop'
import { formatPrice } from '@/utils/format'
import { friendlyMessage } from '@/api/errors'
import { ROUTE_PATHS } from '@/router/routes'

const items = ref([])
const loading = ref(false)

const checkedItems = computed(() => items.value.filter((i) => i.checked))
const allChecked = computed(() => items.value.length > 0 && checkedItems.value.length === items.value.length)
const totalPrice = computed(() => checkedItems.value.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0))

async function load() {
  loading.value = true
  try {
    items.value = await getCart()
  } catch (error) {
    console.error('load cart failed', error)
    uni.showToast({ title: friendlyMessage(error, '加载失败'), icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function toggleCheck(item) {
  const next = !item.checked
  item.checked = next
  try {
    await updateCartItem(item.skuId, { checked: next })
  } catch (error) {
    item.checked = !next
    uni.showToast({ title: friendlyMessage(error, '操作失败'), icon: 'none' })
  }
}

async function toggleAll() {
  const next = !allChecked.value
  items.value.forEach((i) => (i.checked = next))
  try {
    await Promise.all(items.value.map((i) => updateCartItem(i.skuId, { checked: next })))
  } catch (error) {
    uni.showToast({ title: friendlyMessage(error, '操作失败'), icon: 'none' })
    load()
  }
}

async function changeQuantity(item, delta) {
  const next = Math.max(1, (item.quantity || 1) + delta)
  if (next === item.quantity) return
  const prev = item.quantity
  item.quantity = next
  try {
    await updateCartItem(item.skuId, { quantity: next })
  } catch (error) {
    item.quantity = prev
    uni.showToast({ title: friendlyMessage(error, '修改数量失败'), icon: 'none' })
  }
}

async function clearChecked() {
  const target = checkedItems.value
  if (target.length === 0) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }
  uni.showModal({
    title: '删除选中',
    content: `确定删除选中的 ${target.length} 件商品吗？`,
    success: async (res) => {
      if (!res.confirm) return
      try {
        await Promise.all(target.map((i) => removeCartItem(i.skuId)))
        await load()
      } catch (error) {
        uni.showToast({ title: friendlyMessage(error, '删除失败'), icon: 'none' })
      }
    },
  })
}

function checkout() {
  const target = checkedItems.value
  if (target.length === 0) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }
  const payload = target.map((i) => `${i.skuId}:${i.quantity}`).join(',')
  uni.navigateTo({ url: `${ROUTE_PATHS.ORDER_CONFIRM}?items=${encodeURIComponent(payload)}` })
}

function goDetail(item) {
  uni.navigateTo({ url: `${ROUTE_PATHS.PRODUCT_DETAIL}?id=${item.productId}` })
}

function goShop() {
  uni.navigateBack()
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
  padding-bottom: 160rpx;
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

.clear {
  font-size: 26rpx;
  color: $color-text-secondary;
}

.loading,
.empty {
  margin-top: 120rpx;
  text-align: center;
  color: $color-text-secondary;
}

.go-shop {
  margin-top: 24rpx;
  background: $color-primary;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  width: 320rpx;
}

.go-shop::after {
  border: none;
}

.cart-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: $color-surface;
  border-radius: 24rpx;
  padding: 20rpx;
}

.check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid $color-border;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
  flex-shrink: 0;
}

.check.checked {
  background: $color-primary;
  border-color: $color-primary;
}

.item-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: #F1EFEC;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-spec {
  display: block;
  font-size: 22rpx;
  color: $color-text-secondary;
  margin-top: 6rpx;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.item-price {
  font-size: 30rpx;
  font-weight: 700;
  color: $color-primary;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.step-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.step-num {
  min-width: 40rpx;
  text-align: center;
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
  gap: 20rpx;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
}

.total {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
}

.total-price {
  font-size: 34rpx;
  font-weight: 800;
  color: $color-primary;
}

.checkout-btn {
  background: $color-primary;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  padding: 0 48rpx;
  line-height: 80rpx;
  margin: 0;
}

.checkout-btn[disabled] {
  background: $color-border;
  color: $color-text-secondary;
}

.checkout-btn::after {
  border: none;
}
</style>
