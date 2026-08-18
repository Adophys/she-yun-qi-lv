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
