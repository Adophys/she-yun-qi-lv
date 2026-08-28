/**
 * 环境配置：API 地址与功能开关。
 * 通过 .env.development / .env.production 注入，禁止在页面里硬编码 URL。
 */
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const MEDIA_BASE_URL = import.meta.env.VITE_APP_MEDIA_BASE_URL

if (!API_BASE_URL) {
  throw new Error('VITE_APP_API_BASE_URL is required')
}

if (import.meta.env.PROD) {
  if (!API_BASE_URL.startsWith('https')) {
    throw new Error('Production API must use HTTPS')
  }
}

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  mediaBaseUrl: MEDIA_BASE_URL || API_BASE_URL.replace('/api/v1/app', ''),
}

/**
 * 功能开关：
 * - shopEnabled：商城模块入口开关（默认开启；后端商城接口未就绪时页面显示空态/提示）
 * - shopPaymentEnabled：微信支付 feature flag（资质未办齐时为 false，支付按钮降级为意向收集）
 */
export const FEATURE_FLAGS = {
  shopEnabled: true,
  shopPaymentEnabled: false,
}


