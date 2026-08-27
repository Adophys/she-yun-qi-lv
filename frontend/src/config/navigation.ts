import {
  LayoutDashboard,
  BookOpen,
  Map,
  MapPin,
  ShoppingBag,
  Receipt,
  User,
} from 'lucide-vue-next'

export interface NavItem {
  name: string
  path: string
  icon: unknown
  permission?: string
}

export const navigation: NavItem[] = [
  { name: '数据看板', path: '/', icon: LayoutDashboard },
  { name: '文化图鉴', path: '/cultural-items', icon: BookOpen },
  { name: '章节关卡', path: '/chapters', icon: Map },
  { name: '点位管理', path: '/points', icon: MapPin },
  { name: '商品管理', path: '/products', icon: ShoppingBag },
  { name: '订单管理', path: '/orders', icon: Receipt },
  { name: '用户管理', path: '/users', icon: User },
  // ── 未开发页面，暂隐藏（开发完成后取消注释并补回对应图标导入） ──
  // { name: '系统设置', path: '/settings', icon: Settings },
]
