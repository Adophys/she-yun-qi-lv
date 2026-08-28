export interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
  requestId: string
  serverTime: string
}

// ── 管理员账号 ────────────────────────────────────────────────

/** 管理员角色：超级管理员 / 用户 */
export type AdminRole = 'super_admin' | 'editor'

/** 后台管理员账号（用户管理页列表项） */
export interface AdminAccount {
  id: string
  /** 登录账号 */
  username: string
  /** 真实姓名 */
  realName: string
  /** 手机号 */
  phone: string
  /** 角色 */
  role: AdminRole
  /** 是否启用（禁用后无法登录） */
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** 管理员新增/编辑载荷（编辑时 password 留空表示不修改密码） */
export interface AdminAccountPayload {
  username: string
  realName: string
  phone: string
  role: AdminRole
  isActive: boolean
  /** 登录密码：新增必填，编辑可选 */
  password?: string
}

/** 管理员列表查询参数 */
export interface AdminAccountQuery {
  page: number
  pageSize: number
  keyword?: string
  role?: AdminRole | ''
  status?: 'active' | 'inactive' | ''
}

/** 管理员分页结果 */
export interface AdminAccountPage {
  items: AdminAccount[]
  total: number
  page: number
  pageSize: number
}

/** 管理员启停用载荷 */
export interface AdminAccountStatusPayload {
  isActive: boolean
}

// ── 个人资料（当前登录管理员） ─────────────────────────────────

/** 当前登录管理员个人资料 */
export interface AdminProfile {
  id: string
  username: string
  realName: string
  phone: string
  role: AdminRole
  createdAt: string
}

/** 个人资料更新载荷 */
export interface AdminProfilePayload {
  realName: string
  phone: string
}

/** 修改登录密码载荷 */
export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface CulturalItem {
  id: string
  name: string
  pinyin: string
  category: string
  rarity: string
  origin: string
  description: string
  image: string
  viewCount: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

/** 图鉴新增/编辑载荷 */
export interface CulturalItemPayload {
  name: string
  pinyin: string
  category: string
  rarity: string
  origin: string
  description: string
  image: string
  isPublished: boolean
}

/** 图鉴列表查询参数 */
export interface CulturalItemQuery {
  page: number
  pageSize: number
  keyword?: string
  category?: string
  rarity?: string
  status?: 'published' | 'draft' | ''
}

/** 图鉴分页结果 */
export interface CulturalItemPage {
  items: CulturalItem[]
  total: number
  page: number
  pageSize: number
}

/** 图片上传结果 */
export interface UploadResult {
  url: string
  filename: string
  size: number
}

export interface DashboardSummary {
  totalUsers: number
  totalItems: number
  totalNodes: number
  todayActiveUsers: number
}

// ── 数据看板 ──────────────────────────────────────────────────

/** 近 N 日扫码趋势点 */
export interface ScanTrendPoint {
  date: string
  count: number
}

/** 图鉴解锁榜条目 */
export interface UnlockRankItem {
  id: string
  name: string
  count: number
}

/** 用户增长趋势点 */
export interface UserTrendPoint {
  month: string
  total: number
}

/** 文化分类分布 */
export interface CategoryDistItem {
  name: string
  value: number
}

/** 数据看板统计 */
export interface DashboardStats {
  /** 总用户数 */
  totalUsers: number
  /** 今日扫码数 */
  todayScans: number
  /** 图鉴条目总数 */
  totalItems: number
  /** 今日活跃用户 */
  todayActiveUsers: number
  /** 近 7 日扫码趋势 */
  scanTrend: ScanTrendPoint[]
  /** 图鉴解锁 TOP 榜 */
  unlockRank: UnlockRankItem[]
  /** 近 12 月用户增长 */
  userTrend: UserTrendPoint[]
  /** 文化分类占比 */
  categoryDist: CategoryDistItem[]
}

// ── 章节关卡 ──────────────────────────────────────────────────

export interface Chapter {
  id: string
  title: string
  subtitle: string
  order: number
  isPublished: boolean
  createdAt: string
}

export interface Level {
  id: string
  chapterId: string
  title: string
  description: string
  order: number
  isPublished: boolean
  createdAt: string
}

/** 章节（含关卡列表） */
export interface ChapterWithLevels extends Chapter {
  levels: Level[]
}

export interface ChapterPayload {
  title: string
  subtitle: string
  order: number
  isPublished: boolean
}

export interface LevelPayload {
  title: string
  description: string
  order: number
  isPublished: boolean
}

// ── 点位管理 ──────────────────────────────────────────────────

export interface Point {
  id: string
  /** 点位名称 */
  name: string
  /** 点位描述 */
  description: string
  /** 位置 / 地址 */
  address: string
  /** NFC 标签 ID（硬件标签唯一标识） */
  nfcTagId: string
  /** 点位缩略图 */
  image: string
  /** 是否启用 */
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** 点位新增/编辑载荷 */
export interface PointPayload {
  name: string
  description: string
  address: string
  nfcTagId: string
  image: string
  isActive: boolean
}

/** 点位列表查询参数 */
export interface PointQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: 'active' | 'inactive' | ''
}

/** 点位分页结果 */
export interface PointPage {
  items: Point[]
  total: number
  page: number
  pageSize: number
}

// ── 商城商品 ──────────────────────────────────────────────────

export interface Product {
  id: string
  /** 商品名称 */
  name: string
  /** 商品分类 */
  category: string
  /** 售价（元） */
  price: number
  /** 划线原价（元） */
  originalPrice: number
  /** 库存 */
  stock: number
  /** 销量 */
  sales: number
  /** 商品图片 */
  image: string
  /** 商品描述 */
  description: string
  /** 是否上架 */
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** 商品新增/编辑载荷 */
export interface ProductPayload {
  name: string
  category: string
  price: number
  originalPrice: number
  stock: number
  image: string
  description: string
  isActive: boolean
}

/** 商品列表查询参数 */
export interface ProductQuery {
  page: number
  pageSize: number
  keyword?: string
  category?: string
  status?: 'active' | 'inactive' | ''
}

/** 商品分页结果 */
export interface ProductPage {
  items: Product[]
  total: number
  page: number
  pageSize: number
}

// ── 订单管理 ──────────────────────────────────────────────────

/** 订单状态：待付款 / 待发货 / 已发货 / 已完成 / 已取消 */
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

/** 订单内商品明细 */
export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  /** 下单单价（元） */
  price: number
  quantity: number
}

export interface Order {
  id: string
  /** 订单号 */
  orderNo: string
  /** 买家昵称 */
  buyerName: string
  /** 买家手机号 */
  buyerPhone: string
  /** 收货地址 */
  address: string
  /** 商品明细 */
  items: OrderItem[]
  /** 订单总金额（元） */
  totalAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

/** 订单列表查询参数 */
export interface OrderQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: OrderStatus | ''
}

/** 订单分页结果 */
export interface OrderPage {
  items: Order[]
  total: number
  page: number
  pageSize: number
}

/** 订单状态更新载荷 */
export interface OrderStatusPayload {
  status: OrderStatus
}

// ── 业务枚举契约常量（页面与 Mock 统一引用，禁止组件内写死）──
// 状态/稀有度等枚举属于接口契约的一部分，集中定义在类型层；
// 页面渲染、筛选下拉、Mock 校验共用同一份，后端扩展枚举时只改这里。

/** 图鉴稀有度枚举：值 → 展示文案 */
export const CULTURAL_RARITIES: Readonly<Record<string, string>> = {
  common: '常见',
  rare: '稀有',
  legendary: '传说',
}

/** 订单状态枚举：值 → 展示文案 */
export const ORDER_STATUS_TEXT: Readonly<Record<OrderStatus, string>> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
}

/** 管理员角色枚举：值 → 展示文案 */
export const ADMIN_ROLES: Readonly<Record<AdminRole, string>> = {
  super_admin: '超级管理员',
  editor: '用户',
}

/** 订单状态流转动作：当前状态 → 可流转的下一状态及操作文案 */
export const ORDER_TRANSITIONS: Readonly<
  Partial<Record<OrderStatus, { status: OrderStatus; label: string }[]>>
> = {
  pending: [
    { status: 'paid', label: '标记付款' },
    { status: 'cancelled', label: '取消订单' },
  ],
  paid: [
    { status: 'shipped', label: '确认发货' },
    { status: 'cancelled', label: '取消订单' },
  ],
  shipped: [{ status: 'completed', label: '确认完成' }],
  // completed / cancelled 为终态，无可流转状态
}
