import { LayoutDashboard, BookOpen, Map, User, Settings } from '@lucide/vue'

export interface NavItem {
  name: string
  path: string
  icon: unknown
  permission?: string
}

export const navigation: NavItem[] = [
  { name: '概览', path: '/', icon: LayoutDashboard },
  { name: '文化图鉴', path: '/cultural-items', icon: BookOpen },
  { name: '章节关卡', path: '/explore', icon: Map },
  { name: '用户管理', path: '/users', icon: User },
  { name: '系统设置', path: '/settings', icon: Settings },
]
