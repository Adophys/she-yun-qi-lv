<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { bootstrapApp } from '@/services/app-bootstrap'
import { PRIVACY_POLICY } from '@/constants/privacy'
import { STORAGE_KEYS } from '@/storage/keys'

onLaunch(() => {
  console.log('畲韵奇旅 App Launch')
  bootstrapApp()
  ensurePrivacyConsent()
})

/**
 * 隐私合规：首次启动弹窗征得用户同意（需求 4.3）。
 * 用户拒绝时仅提供浏览，登录等涉及信息收集的能力需重新授权。
 */
function ensurePrivacyConsent() {
  const accepted = uni.getStorageSync(STORAGE_KEYS.PRIVACY_ACCEPTED)
  if (accepted) return
  setTimeout(() => {
    uni.showModal({
      title: '隐私保护提示',
      content: `在使用前，请阅读并同意《隐私政策》。我们将收集微信头像、昵称等信息用于账号服务，详见隐私政策。`,
      confirmText: '同意并继续',
      cancelText: '不同意',
      success: (res) => {
        if (res.confirm) {
          uni.setStorageSync(STORAGE_KEYS.PRIVACY_ACCEPTED, PRIVACY_POLICY.version)
        } else {
          uni.showToast({ title: '同意隐私政策后方可使用完整功能', icon: 'none' })
        }
      },
    })
  }, 300)
}
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #F9F7F4;
  color: #2D2A26;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
