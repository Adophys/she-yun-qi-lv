<template>
  <view class="container">
    <text class="title">{{ isEdit ? '编辑地址' : '新增地址' }}</text>

    <view class="form">
      <view class="form-item">
        <text class="label">收货人</text>
        <input class="input" v-model="form.receiver" placeholder="请输入收货人姓名" placeholder-class="placeholder" />
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <input class="input" v-model="form.phone" type="number" maxlength="11" placeholder="请输入手机号" placeholder-class="placeholder" />
      </view>
      <view class="form-item">
        <text class="label">所在地区</text>
        <picker mode="region" @change="onRegionChange">
          <view class="picker-value" :class="{ placeholder: !regionText }">
            {{ regionText || '请选择省/市/区' }}
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">详细地址</text>
        <input class="input" v-model="form.detail" placeholder="街道、门牌号等" placeholder-class="placeholder" />
      </view>
      <view class="form-item row">
        <text class="label">设为默认地址</text>
        <switch :checked="form.isDefault" color="#8B1E3F" @change="(e) => (form.isDefault = e.detail.value)" />
      </view>
    </view>

    <button class="save-btn" :loading="saving" @click="save">保存</button>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createAddress, updateAddress } from '@/api/shop'
import { friendlyMessage } from '@/api/errors'

const id = ref('')
const saving = ref(false)
const region = ref([])

const form = reactive({
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

const isEdit = computed(() => !!id.value)
const regionText = computed(() =>
  form.province && form.city && form.district ? `${form.province} ${form.city} ${form.district}` : ''
)

onLoad(async (query) => {
  if (query && query.id) {
    id.value = query.id
    // 编辑时从地址列表预填：通过 storage 传递待编辑地址
    try {
      const raw = uni.getStorageSync('edit_address')
      if (raw) {
        const addr = typeof raw === 'string' ? JSON.parse(raw) : raw
        Object.assign(form, {
          receiver: addr.receiver || '',
          phone: addr.phone || '',
          province: addr.province || '',
          city: addr.city || '',
          district: addr.district || '',
          detail: addr.detail || '',
          isDefault: !!addr.isDefault,
        })
      }
    } catch (e) {
      // ignore
    }
  }
})

function onRegionChange(e) {
  region.value = e.detail.value || []
  form.province = region.value[0] || ''
  form.city = region.value[1] || ''
  form.district = region.value[2] || ''
}

function validate() {
  if (!form.receiver.trim()) return '请填写收货人'
  if (!/^1\d{10}$/.test(form.phone)) return '请填写正确的手机号'
  if (!form.province || !form.city || !form.district) return '请选择所在地区'
  if (!form.detail.trim()) return '请填写详细地址'
  return ''
}

async function save() {
  const message = validate()
  if (message) {
    uni.showToast({ title: message, icon: 'none' })
    return
  }
  saving.value = true
  uni.showLoading({ title: '保存中...' })
  try {
    const payload = {
      receiver: form.receiver.trim(),
      phone: form.phone,
      province: form.province,
      city: form.city,
      district: form.district,
      detail: form.detail.trim(),
      isDefault: form.isDefault,
    }
    if (isEdit.value) {
      await updateAddress(id.value, payload)
    } else {
      await createAddress(payload)
    }
    uni.hideLoading()
    saving.value = false
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 600)
  } catch (error) {
    uni.hideLoading()
    saving.value = false
    uni.showToast({ title: friendlyMessage(error, '保存失败'), icon: 'none' })
  }
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

.form {
  margin-top: 32rpx;
  background: $color-surface;
  border-radius: 24rpx;
  padding: 8rpx 32rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid $color-border;
  font-size: 30rpx;
}

.form-item:last-child {
  border-bottom: none;
}

.label {
  width: 160rpx;
  color: $color-text;
  flex-shrink: 0;
}

.input {
  flex: 1;
  font-size: 30rpx;
}

.placeholder {
  color: #B9B4AE;
}

.picker-value {
  font-size: 30rpx;
}

.picker-value.placeholder {
  color: #B9B4AE;
}

.save-btn {
  margin-top: 48rpx;
  background: $color-primary;
  color: #fff;
  border-radius: 48rpx;
}

.save-btn::after {
  border: none;
}
</style>
