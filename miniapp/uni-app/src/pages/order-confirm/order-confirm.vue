<template>
  <view class="container">
    <!-- 收货地址 -->
    <view class="address" @click="chooseAddress">
      <view v-if="address">
        <text class="addr-name">{{ address.receiver }} {{ address.phone }}</text>
        <text class="addr-detail">{{ address.province }}{{ address.city }}{{ address.district }} {{ address.detail }}</text>
      </view>
      <view v-else class="addr-empty">
        <text>请选择收货地址</text>
        <text class="arrow">›</text>
      </view>
      <text class="arrow" v-if="address">›</text>
    </view>

    <!-- 商品清单 -->
    <view class="section">
      <text class="section-title">商品清单（共 {{ itemCount }} 件）</text>
      <view class="item-row" v-for="(item, index) in items" :key="index">
        <text class="item-name">{{ item.skuId }}</text>
        <text class="item-qty">× {{ item.quantity }}</text>
      </view>
    </view>

    <!-- 备注 -->
    <view class="section">
      <text class="section-title">订单备注</text>
      <input class="remark" v-model="remark" placeholder="选填，给商家留言" placeholder-class="placeholder" />
    </view>

    <view class="footer">
      <view class="total">
        <text>应付：</text>
        <text class="total-price">¥{{ formatPrice(totalPrice) }}</text>
      </view>
      <button class="submit-btn" :loading="submitting" @click="submitOrder">提交订单</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getAddresses, createOrder } from '@/api/shop'
import { formatPrice } from '@/utils/format'
import { friendlyMessage } from '@/api/errors'
import { FEATURE_FLAGS } from '@/config/api'
import { ROUTE_PATHS } from '@/router/routes'
import { STORAGE_KEYS } from '@/storage/keys'

const items = ref([])
const address = ref(null)
const remark = ref('')
const submitting = ref(false)
const totalPrice = ref(0)

const itemCount = computed(() => items.value.reduce((sum, i) => sum + (i.quantity || 0), 0))

onLoad(async (query) => {
  // 支持两种入口：
  // 1. 购物车结算：?items=skuId:qty,skuId:qty
  // 2. 立即购买：?skuId=xx&quantity=1
  if (query && query.items) {
    try {
      items.value = decodeURIComponent(query.items)
        .split(',')
        .filter(Boolean)
        .map((pair) => {
          const [skuId, quantity] = pair.split(':')
          return { skuId, quantity: Number(quantity) || 1 }
        })
    } catch (e) {
      items.value = []
    }
  } else if (query && query.skuId) {
    items.value = [{ skuId: query.skuId, quantity: Number(query.quantity) || 1 }]
  }
  await loadDefaultAddress()
})

onShow(() => {
  // 从地址列表选择后回填
  const selectedId = uni.getStorageSync(STORAGE_KEYS.SELECTED_ADDRESS_ID)
  if (selectedId) {
    uni.removeStorageSync(STORAGE_KEYS.SELECTED_ADDRESS_ID)
    loadAddresses(selectedId)
  }
})

async function loadAddresses(pickId) {
  try {
    const list = await getAddresses()
    if (Array.isArray(list) && list.length) {
      const picked = pickId ? list.find((a) => a.id === pickId) : null
      address.value = picked || list.find((a) => a.isDefault) || list[0]
    }
  } catch (error) {
    console.warn('load addresses failed', error)
  }
}

async function loadDefaultAddress() {
  await loadAddresses()
}

function chooseAddress() {
  uni.navigateTo({ url: `${ROUTE_PATHS.ADDRESS_LIST}?mode=pick` })
}

async function submitOrder() {
  if (items.value.length === 0) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }
  if (!address.value) {
    uni.showToast({ title: '请先选择收货地址', icon: 'none' })
    return
  }
  submitting.value = true
  uni.showLoading({ title: '提交中...' })
  try {
    const data = await createOrder({
      items: items.value,
      addressId: address.value.id,
      remark: remark.value,
    })
    uni.hideLoading()
    submitting.value = false
    totalPrice.value = (data && data.payAmount) || 0
    if (data && data.payment && FEATURE_FLAGS.shopPaymentEnabled) {
      // 微信支付（需后端返回 requestPayment 参数）
      uni.requestPayment({
        ...data.payment,
        success: () => {
          uni.showToast({ title: '支付成功', icon: 'success' })
          setTimeout(() => goOrders(), 800)
        },
        fail: () => {
          uni.showToast({ title: '已生成订单，可稍后支付', icon: 'none' })
          setTimeout(() => goOrders(), 800)
        },
      })
    } else {
      // 支付功能未开通：订单已生成，提示降级为意向收集
      uni.showModal({
        title: '订单已生成',
        content: '支付功能即将开放，请保持关注。当前订单可在「我的订单」中查看。',
        showCancel: false,
        success: () => goOrders(),
      })
    }
  } catch (error) {
    uni.hideLoading()
    submitting.value = false
    uni.showToast({ title: friendlyMessage(error, '提交失败'), icon: 'none' })
  }
}

function goOrders() {
  uni.redirectTo({ url: ROUTE_PATHS.ORDERS })
}
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
  padding-bottom: 160rpx;
}

.address {
  background: $color-surface;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.addr-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.addr-detail {
  display: block;
  font-size: 26rpx;
  color: $color-text-secondary;
  margin-top: 8rpx;
  line-height: 1.5;
}

.addr-empty {
  font-size: 30rpx;
  color: $color-text-secondary;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.arrow {
  font-size: 40rpx;
  color: $color-border;
}

.section {
  background: $color-surface;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-top: 24rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  font-size: 26rpx;
}

.item-name {
  color: $color-text;
}

.item-qty {
  color: $color-text-secondary;
}

.remark {
  background: $color-bg;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
}

.placeholder {
  color: #B9B4AE;
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
  justify-content: flex-end;
  gap: 20rpx;
}

.total {
  font-size: 26rpx;
}

.total-price {
  font-size: 36rpx;
  font-weight: 800;
  color: $color-primary;
}

.submit-btn {
  background: $color-primary;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  padding: 0 56rpx;
  line-height: 80rpx;
  margin: 0;
}

.submit-btn::after {
  border: none;
}
</style>
