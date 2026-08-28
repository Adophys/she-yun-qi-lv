<template>
  <view class="container">
    <view class="header">
      <text class="title">我的订单</text>
    </view>

    <scroll-view class="tabs" scroll-x>
      <view class="tab-row">
        <text
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: status === tab.key }"
          @click="switchStatus(tab.key)"
        >
          {{ tab.label }}
        </text>
      </view>
    </scroll-view>

    <view v-if="loading" class="loading"><text>加载中...</text></view>
    <view v-else-if="orders.length === 0" class="empty"><text>暂无订单</text></view>

    <view class="order-list" v-else>
      <view class="order" v-for="order in orders" :key="order.orderId">
        <view class="order-head">
          <text class="order-no">订单号 {{ order.orderNo }}</text>
          <text class="order-status" :style="{ color: orderStatusColor(order.status) }">
            {{ orderStatusLabel(order.status) }}
          </text>
        </view>
        <view class="order-body">
          <view class="order-item" v-for="(item, index) in order.items" :key="index">
            <text class="order-item-name">{{ item.name }}</text>
            <text class="order-item-qty">× {{ item.quantity }}</text>
          </view>
          <view class="order-amount">
            <text>实付：</text>
            <text class="amount">¥{{ formatPrice(order.payAmount) }}</text>
          </view>
          <text class="order-time" v-if="order.createdAt">下单时间 {{ formatDateTime(order.createdAt) }}</text>
          <text class="shipment" v-if="order.shipment && order.shipment.carrier">
            物流：{{ order.shipment.carrier }} {{ order.shipment.trackingNo || '' }}
          </text>
        </view>
        <view class="order-actions" v-if="order.status === 'pending_payment'">
          <button class="action-btn" @click="handleCancel(order)">取消订单</button>
        </view>
        <view class="order-actions" v-else-if="order.status === 'shipped'">
          <button class="action-btn primary" @click="handleConfirm(order)">确认收货</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getOrders, cancelOrder, confirmOrder } from '@/api/shop'
import { ORDER_STATUS_META, orderStatusLabel, orderStatusColor } from '@/constants/shop'
import { formatPrice, formatDateTime } from '@/utils/format'
import { friendlyMessage } from '@/api/errors'

const status = ref('')
const orders = ref([])
const loading = ref(false)

const tabs = [{ key: '', label: '全部' }, ...Object.entries(ORDER_STATUS_META).map(([key, meta]) => ({ key, label: meta.label }))]

async function load() {
  loading.value = true
  try {
    const data = await getOrders({ status: status.value, page: 1, pageSize: 20 })
    orders.value = (data && data.items) || []
  } catch (error) {
    console.error('load orders failed', error)
    uni.showToast({ title: friendlyMessage(error, '加载失败'), icon: 'none' })
  } finally {
    loading.value = false
  }
}

function switchStatus(key) {
  status.value = key
  load()
}

function handleCancel(order) {
  uni.showModal({
    title: '取消订单',
    content: '确定取消该订单吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await cancelOrder(order.orderId)
        uni.showToast({ title: '已取消', icon: 'success' })
        load()
      } catch (error) {
        uni.showToast({ title: friendlyMessage(error, '取消失败'), icon: 'none' })
      }
    },
  })
}

function handleConfirm(order) {
  uni.showModal({
    title: '确认收货',
    content: '请确认已收到商品',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await confirmOrder(order.orderId)
        uni.showToast({ title: '已确认收货', icon: 'success' })
        load()
      } catch (error) {
        uni.showToast({ title: friendlyMessage(error, '操作失败'), icon: 'none' })
      }
    },
  })
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

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.tabs {
  white-space: nowrap;
  margin: 24rpx 0;
}

.tab-row {
  display: inline-flex;
  gap: 16rpx;
}

.tab {
  padding: 12rpx 28rpx;
  background: $color-surface;
  border-radius: 32rpx;
  font-size: 26rpx;
  display: inline-block;
}

.tab.active {
  background: $color-primary;
  color: #fff;
}

.loading,
.empty {
  margin-top: 120rpx;
  text-align: center;
  color: $color-text-secondary;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order {
  background: $color-surface;
  border-radius: 24rpx;
  padding: 24rpx;
}

.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid $color-border;
}

.order-no {
  font-size: 24rpx;
  color: $color-text-secondary;
}

.order-status {
  font-size: 26rpx;
  font-weight: 600;
}

.order-body {
  padding: 16rpx 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  padding: 8rpx 0;
}

.order-item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-item-qty {
  color: $color-text-secondary;
  margin-left: 16rpx;
}

.order-amount {
  text-align: right;
  margin-top: 8rpx;
  font-size: 26rpx;
}

.amount {
  font-size: 32rpx;
  font-weight: 800;
  color: $color-primary;
}

.order-time {
  display: block;
  font-size: 22rpx;
  color: $color-text-secondary;
  margin-top: 8rpx;
}

.shipment {
  display: block;
  font-size: 24rpx;
  color: #2563EB;
  margin-top: 8rpx;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $color-border;
}

.action-btn {
  font-size: 26rpx;
  background: $color-bg;
  color: $color-text-secondary;
  border-radius: 32rpx;
  padding: 0 32rpx;
  line-height: 64rpx;
  margin: 0;
}

.action-btn.primary {
  background: $color-primary;
  color: #fff;
}

.action-btn::after {
  border: none;
}
</style>
