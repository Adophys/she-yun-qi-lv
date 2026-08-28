<template>
  <view class="container">
    <view class="header">
      <text class="title">收货地址</text>
    </view>

    <view v-if="loading" class="loading"><text>加载中...</text></view>
    <view v-else-if="addresses.length === 0" class="empty"><text>还没有收货地址</text></view>

    <view class="address-list" v-else>
      <view class="address" v-for="addr in addresses" :key="addr.id" @click="pickAddress(addr)">
        <view class="address-main">
          <view class="addr-head">
            <text class="addr-name">{{ addr.receiver }}</text>
            <text class="addr-phone">{{ addr.phone }}</text>
            <text class="default-tag" v-if="addr.isDefault">默认</text>
          </view>
          <text class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</text>
        </view>
        <view class="addr-ops" @click.stop>
          <text class="op" @click="editAddress(addr)">编辑</text>
          <text class="op danger" @click="removeAddress(addr)">删除</text>
        </view>
      </view>
    </view>

    <button class="add-btn" @click="addAddress">+ 新增地址</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getAddresses, deleteAddress } from '@/api/shop'
import { friendlyMessage } from '@/api/errors'
import { ROUTE_PATHS } from '@/router/routes'
import { STORAGE_KEYS } from '@/storage/keys'

const addresses = ref([])
const loading = ref(false)
const pickMode = ref(false)

onLoad((query) => {
  pickMode.value = query && query.mode === 'pick'
})

async function load() {
  loading.value = true
  try {
    addresses.value = await getAddresses()
  } catch (error) {
    console.error('load addresses failed', error)
    uni.showToast({ title: friendlyMessage(error, '加载失败'), icon: 'none' })
  } finally {
    loading.value = false
  }
}

function pickAddress(addr) {
  if (!pickMode.value) return
  uni.setStorageSync(STORAGE_KEYS.SELECTED_ADDRESS_ID, addr.id)
  uni.navigateBack()
}

function addAddress() {
  uni.navigateTo({ url: ROUTE_PATHS.ADDRESS_EDIT })
}

function editAddress(addr) {
  uni.navigateTo({ url: `${ROUTE_PATHS.ADDRESS_EDIT}?id=${addr.id}` })
}

function removeAddress(addr) {
  uni.showModal({
    title: '删除地址',
    content: `确定删除「${addr.receiver}」的地址吗？`,
    success: async (res) => {
      if (!res.confirm) return
      try {
        await deleteAddress(addr.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        load()
      } catch (error) {
        uni.showToast({ title: friendlyMessage(error, '删除失败'), icon: 'none' })
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
  padding-bottom: 160rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.loading,
.empty {
  margin-top: 120rpx;
  text-align: center;
  color: $color-text-secondary;
}

.address-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.address {
  background: $color-surface;
  border-radius: 24rpx;
  padding: 28rpx;
}

.addr-head {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.addr-name {
  font-size: 32rpx;
  font-weight: 700;
}

.addr-phone {
  font-size: 26rpx;
  color: $color-text-secondary;
}

.default-tag {
  font-size: 20rpx;
  color: #16A34A;
  background: #E8F5E9;
  padding: 2rpx 12rpx;
  border-radius: 12rpx;
}

.addr-detail {
  display: block;
  font-size: 26rpx;
  color: $color-text-secondary;
  margin-top: 12rpx;
  line-height: 1.5;
}

.addr-ops {
  display: flex;
  justify-content: flex-end;
  gap: 40rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $color-border;
}

.op {
  font-size: 26rpx;
  color: $color-text-secondary;
}

.op.danger {
  color: #DC2626;
}

.add-btn {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: calc(env(safe-area-inset-bottom) + 32rpx);
  background: $color-primary;
  color: #fff;
  border-radius: 48rpx;
}

.add-btn::after {
  border: none;
}
</style>

