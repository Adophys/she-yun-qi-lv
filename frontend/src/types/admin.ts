export interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
  requestId: string
  serverTime: string
}

export interface AdminUser {
  id: string
  username: string
  isActive: boolean
  createdAt: string
}

export interface CulturalItem {
  id: string
  name: string
  pinyin: string
  category: string
  rarity: string
  origin: string
  isPublished: boolean
  createdAt: string
}

export interface DashboardSummary {
  totalUsers: number
  totalItems: number
  totalNodes: number
  todayActiveUsers: number
}
