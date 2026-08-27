/// <reference types="node" />
/**
 * 开发环境 Mock 拦截器
 * 通过 Vite configureServer 插件拦截 /api/v1 请求
 *
 * 生产环境不会加载此文件（由 vite.config.ts 条件引入）
 */

import type { ViteDevServer } from 'vite'
// 订单状态流转规则与前端页面共用同一份契约常量，保证双端一致
import { ORDER_TRANSITIONS } from '../types/admin'

// ── 类型 ───────────────────────────────────────────────────────

interface MockRoute {
  method: string
  /** 路径模式（支持 :param 占位符），编译为正则 */
  pattern: RegExp
  paramNames: string[]
  handler: (
    params: Record<string, string>,
    body: unknown,
    query: Record<string, string>,
    /** 当前登录管理员上下文（由 Authorization Bearer Token 解析而来） */
    auth: { userId: string | null },
  ) => object | Promise<object>
}

// ── 通用响应工具 ───────────────────────────────────────────────

let reqCounter = 1

function ok<T>(data: T, message = 'ok'): object {
  return {
    code: 'SUCCESS',
    message,
    data,
    requestId: `mock-req-${String(reqCounter++).padStart(3, '0')}`,
    serverTime: new Date().toISOString(),
  }
}

function fail(code: string, message: string): object {
  return {
    code,
    message,
    data: null,
    requestId: `mock-req-${String(reqCounter++).padStart(3, '0')}`,
    serverTime: new Date().toISOString(),
  }
}

/** 生成短 id */
function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** 编译路径模式为路由定义 */
function route(method: string, path: string, handler: MockRoute['handler']): MockRoute {
  const paramNames: string[] = []
  // 按 / 分段：参数段转成捕获组，普通段转义字面量，避免二次转义问题
  const pattern = path
    .split('/')
    .map((seg) => {
      if (seg.startsWith(':')) {
        paramNames.push(seg.slice(1))
        return '([^/]+)'
      }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return { method, paramNames, pattern: new RegExp(`^${pattern}$`), handler }
}

// ── Mock 数据存储（内存）─────────────────────────────────────

interface MockAdminUser {
  id: string
  username: string
  password: string
  realName: string
  phone: string
  /** 角色数组：登录响应沿用 roles[] 结构，列表页派生单一 role */
  roles: string[]
  avatar: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

let mockUsers: MockAdminUser[] = [
  { id: 'u001', username: 'admin', password: 'admin123', realName: '雷明远', phone: '13805910001', roles: ['super_admin'], avatar: '', isActive: true, createdAt: '2026-05-01T09:00:00Z', updatedAt: '2026-05-01T09:00:00Z' },
  { id: 'u002', username: 'editor', password: 'editor123', realName: '蓝晓燕', phone: '13805910002', roles: ['editor'], avatar: '', isActive: true, createdAt: '2026-05-12T09:00:00Z', updatedAt: '2026-05-12T09:00:00Z' },
  { id: 'u003', username: 'lei.dongmei', password: 'admin123', realName: '雷冬梅', phone: '13805910003', roles: ['editor'], avatar: '', isActive: true, createdAt: '2026-06-03T09:00:00Z', updatedAt: '2026-06-03T09:00:00Z' },
  { id: 'u004', username: 'lan.jianguo', password: 'admin123', realName: '蓝建国', phone: '13805910004', roles: ['editor'], avatar: '', isActive: false, createdAt: '2026-06-15T09:00:00Z', updatedAt: '2026-07-20T09:00:00Z' },
  { id: 'u005', username: 'zhong.wenhua', password: 'admin123', realName: '钟文华', phone: '13805910005', roles: ['editor'], avatar: '', isActive: true, createdAt: '2026-06-28T09:00:00Z', updatedAt: '2026-06-28T09:00:00Z' },
  { id: 'u006', username: 'lin.qiaoyun', password: 'admin123', realName: '林巧云', phone: '13805910006', roles: ['super_admin'], avatar: '', isActive: true, createdAt: '2026-07-08T09:00:00Z', updatedAt: '2026-07-08T09:00:00Z' },
  { id: 'u007', username: 'wu.haisheng', password: 'admin123', realName: '吴海生', phone: '13805910007', roles: ['editor'], avatar: '', isActive: false, createdAt: '2026-07-19T09:00:00Z', updatedAt: '2026-08-10T09:00:00Z' },
  { id: 'u008', username: 'xiu.chunlan', password: 'admin123', realName: '秀春兰', phone: '13805910008', roles: ['editor'], avatar: '', isActive: true, createdAt: '2026-08-01T09:00:00Z', updatedAt: '2026-08-01T09:00:00Z' },
]

/** Mock 管理员 → 用户管理列表/详情响应结构 */
function toAccount(u: MockAdminUser) {
  return {
    id: u.id,
    username: u.username,
    realName: u.realName,
    phone: u.phone,
    role: u.roles.includes('super_admin') ? 'super_admin' : 'editor',
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}

/** Mock 管理员 → 个人资料响应结构 */
function toProfile(u: MockAdminUser) {
  return {
    id: u.id,
    username: u.username,
    realName: u.realName,
    phone: u.phone,
    role: u.roles.includes('super_admin') ? 'super_admin' : 'editor',
    createdAt: u.createdAt,
  }
}

interface MockChapter {
  id: string
  title: string
  subtitle: string
  order: number
  isPublished: boolean
  createdAt: string
}

interface MockLevel {
  id: string
  chapterId: string
  title: string
  description: string
  order: number
  isPublished: boolean
  createdAt: string
}

let mockChapters: MockChapter[] = [
  { id: 'ch1', title: '畲族之源', subtitle: '认识畲族的起源与迁徙历史', order: 1, isPublished: true, createdAt: '2026-07-01T10:00:00Z' },
  { id: 'ch2', title: '凤凰霓裳', subtitle: '畲族服饰中的凤凰图腾文化', order: 2, isPublished: true, createdAt: '2026-07-05T10:00:00Z' },
  { id: 'ch3', title: '山哈歌言', subtitle: '走进畲族民歌与口头文学', order: 3, isPublished: true, createdAt: '2026-07-10T10:00:00Z' },
  { id: 'ch4', title: '畲乡食韵', subtitle: '品味畲族特色饮食文化', order: 4, isPublished: false, createdAt: '2026-07-15T10:00:00Z' },
]

let mockLevels: MockLevel[] = [
  // 第一章
  { id: 'lv11', chapterId: 'ch1', title: '高辛氏传说', description: '了解畲族始祖盘瓠的传说故事', order: 1, isPublished: true, createdAt: '2026-07-01T10:00:00Z' },
  { id: 'lv12', chapterId: 'ch1', title: '凤凰山寻根', description: '探寻畲族发源地凤凰山的文化印记', order: 2, isPublished: true, createdAt: '2026-07-01T10:00:00Z' },
  { id: 'lv13', chapterId: 'ch1', title: '畲字解义', description: '认识"畲"字的由来与含义', order: 3, isPublished: true, createdAt: '2026-07-01T10:00:00Z' },
  // 第二章
  { id: 'lv21', chapterId: 'ch2', title: '凤凰装辨识', description: '识别畲族妇女传统服饰的三大件', order: 1, isPublished: true, createdAt: '2026-07-05T10:00:00Z' },
  { id: 'lv22', chapterId: 'ch2', title: '彩带纹样密码', description: '读懂畲族彩带中的图腾纹样', order: 2, isPublished: true, createdAt: '2026-07-05T10:00:00Z' },
  { id: 'lv23', chapterId: 'ch2', title: '银饰工艺', description: '欣赏畲族银饰的精湛工艺', order: 3, isPublished: false, createdAt: '2026-07-05T10:00:00Z' },
  // 第三章
  { id: 'lv31', chapterId: 'ch3', title: '山哈调初听', description: '聆听畲族山歌"山哈调"', order: 1, isPublished: true, createdAt: '2026-07-10T10:00:00Z' },
  { id: 'lv32', chapterId: 'ch3', title: '对歌礼仪', description: '学习畲族对歌的基本礼仪', order: 2, isPublished: true, createdAt: '2026-07-10T10:00:00Z' },
  // 第四章
  { id: 'lv41', chapterId: 'ch4', title: '乌米饭制作', description: '了解三月三乌米饭的传说与做法', order: 1, isPublished: false, createdAt: '2026-07-15T10:00:00Z' },
  { id: 'lv42', chapterId: 'ch4', title: '畲乡茶俗', description: '体验"宝塔茶"等畲族茶俗', order: 2, isPublished: false, createdAt: '2026-07-15T10:00:00Z' },
]

let mockTokenCounter = 1

// ── 文化图鉴 Mock 数据 ────────────────────────────────────────

interface MockCulturalItem {
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

/** 生成离线可用的 SVG 占位图（渐变背景 + 首字） */
function mockImage(label: string, from: string, to: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="400" height="300" fill="url(#g)"/>` +
    `<text x="50%" y="52%" font-family="serif" font-size="110" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="central">${label}</text>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

let mockCulturalItems: MockCulturalItem[] = [
  { id: 'ci01', name: '凤凰装', pinyin: 'fenghuangzhuang', category: '服饰', rarity: 'legendary', origin: '福建宁德', description: '畲族妇女的传统盛装，以凤凰造型为灵感，衣领、花边、彩带皆绣有凤凰图案，是畲族最具标志性的服饰。', image: mockImage('凤', '#8B1E3F', '#C96F8A'), viewCount: 3280, isPublished: true, createdAt: '2026-07-02T09:00:00Z', updatedAt: '2026-07-02T09:00:00Z' },
  { id: 'ci02', name: '畲族彩带', pinyin: 'shezucaida', category: '手工艺', rarity: 'rare', origin: '浙江景宁', description: '用经纬线织出的彩色织带，纹样包含日月星辰、花鸟鱼虫，每条彩带都是一部无字的畲族史书。', image: mockImage('彩', '#B23A5E', '#E8A2B8'), viewCount: 2140, isPublished: true, createdAt: '2026-07-03T09:00:00Z', updatedAt: '2026-07-03T09:00:00Z' },
  { id: 'ci03', name: '乌米饭', pinyin: 'wumifan', category: '饮食', rarity: 'rare', origin: '福建罗源', description: '用乌稔树叶汁浸泡糯米蒸制而成，色泽乌黑油亮，清香扑鼻，是畲族"三月三"的节日美食。', image: mockImage('乌', '#3C2F2F', '#7A6A5E'), viewCount: 1860, isPublished: true, createdAt: '2026-07-04T09:00:00Z', updatedAt: '2026-07-04T09:00:00Z' },
  { id: 'ci04', name: '山哈调', pinyin: 'shanhatiao', category: '歌谣', rarity: 'legendary', origin: '福建宁德', description: '畲族山歌的统称，曲调高亢悠长，多以对歌形式传唱，内容涵盖劳动、爱情、迁徙等生活百态。', image: mockImage('歌', '#1E4D6B', '#5B8FB9'), viewCount: 4520, isPublished: true, createdAt: '2026-07-05T09:00:00Z', updatedAt: '2026-07-05T09:00:00Z' },
  { id: 'ci05', name: '盘瓠传说', pinyin: 'panhuchuanshuo', category: '信仰', rarity: 'legendary', origin: '闽东地区', description: '畲族始祖盘瓠的神话传说，讲述盘瓠助帝喾平乱、娶公主为妻、繁衍畲族子孙的故事，是畲族最重要的民族记忆。', image: mockImage('瓠', '#6B4E2A', '#C9A46A'), viewCount: 3950, isPublished: true, createdAt: '2026-07-06T09:00:00Z', updatedAt: '2026-07-06T09:00:00Z' },
  { id: 'ci06', name: '畲族银饰', pinyin: 'shezuyinshi', category: '手工艺', rarity: 'rare', origin: '福建福安', description: '造型繁复、工艺精湛的银质饰品，以凤凰、花卉、龙凤为主题，是畲族女性出嫁时的重要嫁妆。', image: mockImage('银', '#4A5568', '#9AA5B1'), viewCount: 1670, isPublished: true, createdAt: '2026-07-07T09:00:00Z', updatedAt: '2026-07-07T09:00:00Z' },
  { id: 'ci07', name: '宝塔茶', pinyin: 'baotacha', category: '饮食', rarity: 'common', origin: '福建宁德', description: '畲族婚嫁礼仪茶，将三碗茶层层叠起形似宝塔，敬茶时需用嘴衔碗而饮，寓意步步高升。', image: mockImage('茶', '#2F6B4F', '#7FB69A'), viewCount: 980, isPublished: true, createdAt: '2026-07-08T09:00:00Z', updatedAt: '2026-07-08T09:00:00Z' },
  { id: 'ci08', name: '畲族婚俗', pinyin: 'shezuhunsu', category: '节庆', rarity: 'rare', origin: '浙江景宁', description: '从"借锅"到"拦路"，畲族婚礼仪式繁复而热烈，新娘以"唱嫁"表达对娘家的不舍与对未来的期许。', image: mockImage('婚', '#B23A5E', '#E06A8C'), viewCount: 2230, isPublished: true, createdAt: '2026-07-09T09:00:00Z', updatedAt: '2026-07-09T09:00:00Z' },
  { id: 'ci09', name: '三月三', pinyin: 'sanyuesan', category: '节庆', rarity: 'rare', origin: '闽浙畲乡', description: '畲族最重要的传统节日，乌米饭飘香、山歌对唱、祭祀祖先，是畲族文化集中展示的盛会。', image: mockImage('三', '#8B1E3F', '#D98A5E'), viewCount: 2890, isPublished: true, createdAt: '2026-07-10T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'ci10', name: '畲族祖图', pinyin: 'shezuzutu', category: '信仰', rarity: 'legendary', origin: '福建霞浦', description: '描绘畲族始祖功绩的长卷画轴，色彩浓烈，是畲族宗祠中供奉的圣物，也是研究畲族历史的重要史料。', image: mockImage('祖', '#6B4E2A', '#D9B97A'), viewCount: 3420, isPublished: true, createdAt: '2026-07-11T09:00:00Z', updatedAt: '2026-07-11T09:00:00Z' },
  { id: 'ci11', name: '畲寨木楼', pinyin: 'shezaimulou', category: '建筑', rarity: 'common', origin: '福建罗源', description: '依山而建的木质吊脚楼，冬暖夏凉，底层圈养牲畜、上层住人，体现了畲民与自然和谐共处的智慧。', image: mockImage('楼', '#5D4037', '#A1887F'), viewCount: 1240, isPublished: false, createdAt: '2026-07-12T09:00:00Z', updatedAt: '2026-07-12T09:00:00Z' },
  { id: 'ci12', name: '畲族刺绣', pinyin: 'shezucixiu', category: '手工艺', rarity: 'common', origin: '浙江景宁', description: '以平针、锁针、打籽绣等针法绣出花鸟鱼虫，色彩明快，多用于服饰、围裙、荷包的装饰。', image: mockImage('绣', '#7B1FA2', '#CE93D8'), viewCount: 860, isPublished: false, createdAt: '2026-07-13T09:00:00Z', updatedAt: '2026-07-13T09:00:00Z' },
  { id: 'ci13', name: '龙麒传说', pinyin: 'longqichuanshuo', category: '信仰', rarity: 'rare', origin: '闽东地区', description: '与盘瓠传说同源的始祖神话，以龙麒形象出现，畲族祭祖时必唱"高皇歌"追忆龙麒功绩。', image: mockImage('麒', '#B23A5E', '#F2C94C'), viewCount: 1980, isPublished: false, createdAt: '2026-07-14T09:00:00Z', updatedAt: '2026-07-14T09:00:00Z' },
  { id: 'ci14', name: '对歌堂', pinyin: 'duigetang', category: '歌谣', rarity: 'common', origin: '福建宁德', description: '农闲时畲族青年男女聚会对歌的场所，以歌传情、以歌会友，是畲族最具浪漫色彩的社交方式。', image: mockImage('对', '#1E4D6B', '#6FA8DC'), viewCount: 1320, isPublished: false, createdAt: '2026-07-15T09:00:00Z', updatedAt: '2026-07-15T09:00:00Z' },
  { id: 'ci15', name: '糯米糍粑', pinyin: 'nuomociba', category: '饮食', rarity: 'common', origin: '浙江景宁', description: '将糯米蒸熟后反复捶打制成，外裹芝麻糖粉，软糯香甜，是畲族待客与年节的必备点心。', image: mockImage('糍', '#8D6E63', '#D7CCC8'), viewCount: 760, isPublished: false, createdAt: '2026-07-16T09:00:00Z', updatedAt: '2026-07-16T09:00:00Z' },
]

// ── 点位管理 Mock 数据 ────────────────────────────────────────

interface MockPoint {
  id: string
  name: string
  description: string
  address: string
  nfcTagId: string
  image: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

let mockPoints: MockPoint[] = [
  { id: 'pt01', name: '凤凰山主入口', description: '畲族文化景区大门，扫码开启文化之旅', address: '福建宁德·凤凰山风景区入口', nfcTagId: 'NFC-8F3A2C11', image: mockImage('凤', '#8B1E3F', '#C96F8A'), isActive: true, createdAt: '2026-07-01T09:00:00Z', updatedAt: '2026-07-01T09:00:00Z' },
  { id: 'pt02', name: '畲族民俗馆', description: '展示畲族生产生活用具与民俗风物', address: '凤凰山民俗街 12 号', nfcTagId: 'NFC-8F3A2C12', image: mockImage('俗', '#6B4E2A', '#C9A46A'), isActive: true, createdAt: '2026-07-02T09:00:00Z', updatedAt: '2026-07-02T09:00:00Z' },
  { id: 'pt03', name: '盘瓠祠堂', description: '供奉盘瓠祖图，讲述畲族始祖传说', address: '凤凰山半山腰·宗祠区', nfcTagId: 'NFC-8F3A2C13', image: mockImage('瓠', '#4A5568', '#9AA5B1'), isActive: true, createdAt: '2026-07-03T09:00:00Z', updatedAt: '2026-07-03T09:00:00Z' },
  { id: 'pt04', name: '山哈歌台', description: '畲族山歌对唱舞台，扫码收听山哈调', address: '凤凰山广场东侧', nfcTagId: 'NFC-8F3A2C14', image: mockImage('歌', '#1E4D6B', '#5B8FB9'), isActive: true, createdAt: '2026-07-04T09:00:00Z', updatedAt: '2026-07-04T09:00:00Z' },
  { id: 'pt05', name: '乌米饭工坊', description: '体验三月三乌米饭的传统制作工艺', address: '民俗街 23 号·美食区', nfcTagId: 'NFC-8F3A2C15', image: mockImage('乌', '#3C2F2F', '#7A6A5E'), isActive: true, createdAt: '2026-07-05T09:00:00Z', updatedAt: '2026-07-05T09:00:00Z' },
  { id: 'pt06', name: '彩带织坊', description: '现场演示畲族彩带编织，读懂纹样密码', address: '民俗街 31 号·手工艺区', nfcTagId: 'NFC-8F3A2C16', image: mockImage('彩', '#B23A5E', '#E8A2B8'), isActive: true, createdAt: '2026-07-06T09:00:00Z', updatedAt: '2026-07-06T09:00:00Z' },
  { id: 'pt07', name: '银饰体验坊', description: '欣赏并体验畲族银饰锻制技艺', address: '民俗街 45 号·手工艺区', nfcTagId: 'NFC-8F3A2C17', image: mockImage('银', '#5D4037', '#A1887F'), isActive: true, createdAt: '2026-07-07T09:00:00Z', updatedAt: '2026-07-07T09:00:00Z' },
  { id: 'pt08', name: '三月三广场', description: '节庆主会场，每逢三月三举办盛大歌会', address: '凤凰山中心广场', nfcTagId: 'NFC-8F3A2C18', image: mockImage('三', '#8B1E3F', '#D98A5E'), isActive: true, createdAt: '2026-07-08T09:00:00Z', updatedAt: '2026-07-08T09:00:00Z' },
  { id: 'pt09', name: '畲寨民宿区', description: '依山而建的木质吊脚楼住宿体验区', address: '凤凰山北坡·民宿聚落', nfcTagId: 'NFC-8F3A2C19', image: mockImage('楼', '#6B4E2A', '#D9B97A'), isActive: false, createdAt: '2026-07-09T09:00:00Z', updatedAt: '2026-07-09T09:00:00Z' },
  { id: 'pt10', name: '高辛氏祭坛', description: '纪念畲族始祖高辛氏的露天祭坛', address: '凤凰山山顶·祭坛区', nfcTagId: 'NFC-8F3A2C20', image: mockImage('祭', '#7B1FA2', '#CE93D8'), isActive: false, createdAt: '2026-07-10T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pt11', name: '宝塔茶寮', description: '畲族婚嫁礼仪茶"宝塔茶"品鉴点', address: '民俗街 8 号·茶饮区', nfcTagId: 'NFC-8F3A2C21', image: mockImage('茶', '#2F6B4F', '#7FB69A'), isActive: false, createdAt: '2026-07-11T09:00:00Z', updatedAt: '2026-07-11T09:00:00Z' },
  { id: 'pt12', name: '彩凤观景台', description: '俯瞰凤凰山全景的最佳观景点', address: '凤凰山西峰·观景平台', nfcTagId: 'NFC-8F3A2C22', image: mockImage('景', '#1E4D6B', '#6FA8DC'), isActive: false, createdAt: '2026-07-12T09:00:00Z', updatedAt: '2026-07-12T09:00:00Z' },
]

// ── 商城商品 Mock 数据 ────────────────────────────────────────

interface MockProduct {
  id: string
  name: string
  category: string
  price: number
  originalPrice: number
  stock: number
  sales: number
  image: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

let mockProducts: MockProduct[] = [
  { id: 'pd01', name: '凤凰装刺绣丝巾', category: '服饰', price: 128, originalPrice: 158, stock: 86, sales: 320, image: mockImage('凤', '#8B1E3F', '#C96F8A'), description: '以凤凰装纹样为灵感的手工刺绣丝巾，日常佩戴或装裱皆宜。', isActive: true, createdAt: '2026-07-01T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd02', name: '乌米饭伴手礼盒', category: '美食', price: 68, originalPrice: 88, stock: 120, sales: 512, image: mockImage('乌', '#3C2F2F', '#7A6A5E'), description: '传统乌米饭工艺制成的即食礼盒，内含山间时令配料。', isActive: true, createdAt: '2026-07-02T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd03', name: '畲族彩带编织套装', category: '手工艺', price: 45, originalPrice: 59, stock: 200, sales: 268, image: mockImage('彩', '#B23A5E', '#E8A2B8'), description: '含织架与彩线，附纹样图册，在家也能体验彩带编织。', isActive: true, createdAt: '2026-07-03T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd04', name: '银饰蝴蝶耳环', category: '饰品', price: 199, originalPrice: 258, stock: 42, sales: 156, image: mockImage('银', '#5D4037', '#A1887F'), description: '纯银锻制，灵感源自畲族山歌中的蝴蝶意象，限量发售。', isActive: true, createdAt: '2026-07-04T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd05', name: '山哈米酒（500ml）', category: '美食', price: 88, originalPrice: 108, stock: 64, sales: 201, image: mockImage('酒', '#6B4E2A', '#D9B97A'), description: '畲家自酿米酒，口感清甜，伴手佳品。', isActive: true, createdAt: '2026-07-05T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd06', name: '畲绣平安香囊', category: '手工艺', price: 39, originalPrice: 49, stock: 300, sales: 734, image: mockImage('囊', '#7B1FA2', '#CE93D8'), description: '手工畲绣香囊，内置艾草，驱蚊安神。', isActive: true, createdAt: '2026-07-06T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd07', name: '盘瓠纹陶瓷茶杯', category: '器物', price: 56, originalPrice: 76, stock: 150, sales: 189, image: mockImage('瓠', '#4A5568', '#9AA5B1'), description: '德化白瓷手绘盘瓠纹，一对装。', isActive: true, createdAt: '2026-07-07T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd08', name: '三月三主题T恤', category: '服饰', price: 79, originalPrice: 99, stock: 96, sales: 243, image: mockImage('三', '#8B1E3F', '#D98A5E'), description: '棉质印花T恤，图案取自三月三歌会现场手绘。', isActive: true, createdAt: '2026-07-08T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd09', name: '畲族竹编收纳篮', category: '手工艺', price: 129, originalPrice: 169, stock: 30, sales: 67, image: mockImage('竹', '#2F6B4F', '#7FB69A'), description: '老匠人手工竹编，天然耐用。', isActive: false, createdAt: '2026-07-09T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd10', name: '高辛氏铜铃挂饰', category: '器物', price: 158, originalPrice: 199, stock: 25, sales: 88, image: mockImage('铃', '#1E4D6B', '#6FA8DC'), description: '仿古铜铃，寓意祈福纳吉。', isActive: false, createdAt: '2026-07-10T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd11', name: '凤凰山风景明信片套装', category: '文创', price: 25, originalPrice: 30, stock: 400, sales: 1021, image: mockImage('片', '#1E4D6B', '#5B8FB9'), description: '12 张景区摄影明信片，附信封。', isActive: false, createdAt: '2026-07-11T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
  { id: 'pd12', name: '畲语童谣绘本', category: '文创', price: 42, originalPrice: 52, stock: 88, sales: 132, image: mockImage('谣', '#8B1E3F', '#E8A2B8'), description: '中畲双语童谣绘本，扫码可听原声朗读。', isActive: false, createdAt: '2026-07-12T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z' },
]

// ── 订单管理 Mock 数据 ────────────────────────────────────────

interface MockOrderItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
}

interface MockOrder {
  id: string
  orderNo: string
  buyerName: string
  buyerPhone: string
  address: string
  items: MockOrderItem[]
  totalAmount: number
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

let mockOrders: MockOrder[] = [
  {
    id: 'od01', orderNo: 'SY20260816001', buyerName: '蓝心怡', buyerPhone: '138****6621',
    address: '福建省宁德市蕉城区凤凰山路 8 号', status: 'completed', createdAt: '2026-08-16T10:24:00Z', updatedAt: '2026-08-19T14:02:00Z',
    items: [
      { productId: 'pd01', productName: '凤凰装刺绣丝巾', productImage: mockImage('凤', '#8B1E3F', '#C96F8A'), price: 128, quantity: 1 },
      { productId: 'pd02', productName: '乌米饭伴手礼盒', productImage: mockImage('乌', '#3C2F2F', '#7A6A5E'), price: 68, quantity: 2 },
    ],
    totalAmount: 264,
  },
  {
    id: 'od02', orderNo: 'SY20260817002', buyerName: '钟丽娜', buyerPhone: '139****8823',
    address: '福建省福州市鼓楼区五四路 128 号', status: 'shipped', createdAt: '2026-08-17T14:12:00Z', updatedAt: '2026-08-20T09:30:00Z',
    items: [
      { productId: 'pd04', productName: '银饰蝴蝶耳环', productImage: mockImage('银', '#5D4037', '#A1887F'), price: 199, quantity: 1 },
      { productId: 'pd06', productName: '畲绣平安香囊', productImage: mockImage('囊', '#7B1FA2', '#CE93D8'), price: 39, quantity: 3 },
    ],
    totalAmount: 316,
  },
  {
    id: 'od03', orderNo: 'SY20260818003', buyerName: '雷明辉', buyerPhone: '137****4410',
    address: '浙江省温州市鹿城区江滨路 66 号', status: 'paid', createdAt: '2026-08-18T09:05:00Z', updatedAt: '2026-08-18T09:05:00Z',
    items: [
      { productId: 'pd03', productName: '畲族彩带编织套装', productImage: mockImage('彩', '#B23A5E', '#E8A2B8'), price: 45, quantity: 2 },
    ],
    totalAmount: 90,
  },
  {
    id: 'od04', orderNo: 'SY20260818004', buyerName: '兰晓婷', buyerPhone: '136****7789',
    address: '福建省厦门市思明区环岛路 32 号', status: 'pending', createdAt: '2026-08-18T18:42:00Z', updatedAt: '2026-08-18T18:42:00Z',
    items: [
      { productId: 'pd05', productName: '山哈米酒（500ml）', productImage: mockImage('酒', '#6B4E2A', '#D9B97A'), price: 88, quantity: 2 },
      { productId: 'pd08', productName: '三月三主题T恤', productImage: mockImage('三', '#8B1E3F', '#D98A5E'), price: 79, quantity: 1 },
    ],
    totalAmount: 255,
  },
  {
    id: 'od05', orderNo: 'SY20260819005', buyerName: '钟建辉', buyerPhone: '135****2290',
    address: '江西省上饶市信州区五三大道 55 号', status: 'cancelled', createdAt: '2026-08-19T11:20:00Z', updatedAt: '2026-08-19T11:48:00Z',
    items: [
      { productId: 'pd09', productName: '畲族竹编收纳篮', productImage: mockImage('竹', '#2F6B4F', '#7FB69A'), price: 129, quantity: 1 },
    ],
    totalAmount: 129,
  },
  {
    id: 'od06', orderNo: 'SY20260820006', buyerName: '雷雨欣', buyerPhone: '133****9901',
    address: '福建省泉州市丰泽区东海大街 9 号', status: 'paid', createdAt: '2026-08-20T16:33:00Z', updatedAt: '2026-08-20T16:33:00Z',
    items: [
      { productId: 'pd11', productName: '凤凰山风景明信片套装', productImage: mockImage('片', '#1E4D6B', '#5B8FB9'), price: 25, quantity: 5 },
      { productId: 'pd12', productName: '畲语童谣绘本', productImage: mockImage('谣', '#8B1E3F', '#E8A2B8'), price: 42, quantity: 2 },
    ],
    totalAmount: 209,
  },
  {
    id: 'od07', orderNo: 'SY20260821007', buyerName: '蓝伟强', buyerPhone: '131****5567',
    address: '广东省深圳市南山区科技园 1 号', status: 'shipped', createdAt: '2026-08-21T08:50:00Z', updatedAt: '2026-08-22T10:15:00Z',
    items: [
      { productId: 'pd07', productName: '盘瓠纹陶瓷茶杯', productImage: mockImage('瓠', '#4A5568', '#9AA5B1'), price: 56, quantity: 2 },
    ],
    totalAmount: 112,
  },
  {
    id: 'od08', orderNo: 'SY20260822008', buyerName: '钟小霞', buyerPhone: '138****3378',
    address: '福建省宁德市福安市富春路 21 号', status: 'completed', createdAt: '2026-08-22T13:08:00Z', updatedAt: '2026-08-25T17:40:00Z',
    items: [
      { productId: 'pd06', productName: '畲绣平安香囊', productImage: mockImage('囊', '#7B1FA2', '#CE93D8'), price: 39, quantity: 2 },
      { productId: 'pd08', productName: '三月三主题T恤', productImage: mockImage('三', '#8B1E3F', '#D98A5E'), price: 79, quantity: 1 },
    ],
    totalAmount: 157,
  },
  {
    id: 'od09', orderNo: 'SY20260823009', buyerName: '雷明杰', buyerPhone: '150****1198',
    address: '浙江省杭州市西湖区文三路 88 号', status: 'pending', createdAt: '2026-08-23T20:16:00Z', updatedAt: '2026-08-23T20:16:00Z',
    items: [
      { productId: 'pd10', productName: '高辛氏铜铃挂饰', productImage: mockImage('铃', '#1E4D6B', '#6FA8DC'), price: 158, quantity: 1 },
      { productId: 'pd04', productName: '银饰蝴蝶耳环', productImage: mockImage('银', '#5D4037', '#A1887F'), price: 199, quantity: 1 },
    ],
    totalAmount: 357,
  },
  {
    id: 'od10', orderNo: 'SY20260824010', buyerName: '蓝若曦', buyerPhone: '159****6620',
    address: '福建省漳州市芗城区胜利路 12 号', status: 'paid', createdAt: '2026-08-24T10:29:00Z', updatedAt: '2026-08-24T10:29:00Z',
    items: [
      { productId: 'pd02', productName: '乌米饭伴手礼盒', productImage: mockImage('乌', '#3C2F2F', '#7A6A5E'), price: 68, quantity: 3 },
    ],
    totalAmount: 204,
  },
]

// 生成模拟 JWT（仅做样子，不含真实签名）
function generateMockToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24h
      jti: `mock-${mockTokenCounter++}`,
    }),
  )
  return `${header}.${payload}.mock_signature`
}

/** 从 Authorization 头解析当前登录用户 id（还原模拟 JWT 的 sub 字段） */
function parseMockUserId(headers: Record<string, string | string[] | undefined>): string | null {
  const raw = headers['authorization']
  const token = Array.isArray(raw) ? raw[0] : raw
  if (!token || !token.startsWith('Bearer ')) return null
  const parts = token.slice('Bearer '.length).split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(atob(parts[1]))
    return typeof payload?.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

/** 按 auth 上下文查找当前登录管理员（未登录返回 null） */
function requireUser(auth: { userId: string | null }): MockAdminUser | null {
  if (!auth.userId) return null
  return mockUsers.find((u) => u.id === auth.userId) ?? null
}

/** 校验手机号格式（大陆 11 位） */
function isValidPhone(phone: string): boolean {
  return /^1\d{10}$/.test(phone)
}

/** 按 order 排序的章节列表（含关卡） */
function chaptersWithLevels() {
  return [...mockChapters]
    .sort((a, b) => a.order - b.order)
    .map((ch) => ({
      ...ch,
      levels: mockLevels
        .filter((lv) => lv.chapterId === ch.id)
        .sort((a, b) => a.order - b.order),
    }))
}

// ── Mock 路由表 ────────────────────────────────────────────────

const routes: MockRoute[] = [
  // ── 认证 ──
  route('POST', '/api/v1/admin/auth/login', (_p, body) => {
    const { username, password } = body as { username?: string; password?: string }
    if (!username || !password) {
      return fail('BAD_REQUEST', '用户名和密码不能为空')
    }
    const user = mockUsers.find((u) => u.username === username && u.password === password)
    if (!user) {
      return fail('INVALID_CREDENTIALS', '用户名或密码错误')
    }
    if (!user.isActive) {
      return fail('ACCOUNT_DISABLED', '该账号已被禁用，请联系超级管理员')
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          ok(
            {
              token: generateMockToken(user.id),
              refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
              user: {
                id: user.id,
                username: user.username,
                displayName: user.realName,
                roles: user.roles,
                avatar: user.avatar,
              },
              expiresIn: 86400,
            },
            '登录成功',
          ),
        )
      }, 300 + Math.random() * 300)
    })
  }),

  route('GET', '/api/v1/admin/auth/me', (_p, _b, _q, auth) => {
    const user = requireUser(auth)
    if (!user) return fail('UNAUTHORIZED', '未登录或登录已过期')
    return ok({
      id: user.id,
      username: user.username,
      displayName: user.realName,
      roles: user.roles,
      avatar: user.avatar,
    })
  }),

  route('POST', '/api/v1/admin/auth/logout', () => ok(null, '退出成功')),

  // ── 个人资料（当前登录管理员） ──
  route('GET', '/api/v1/admin/auth/profile', (_p, _b, _q, auth) => {
    const user = requireUser(auth)
    if (!user) return fail('UNAUTHORIZED', '未登录或登录已过期')
    return ok(toProfile(user))
  }),

  route('PUT', '/api/v1/admin/auth/profile', (_p, body, _q, auth) => {
    const user = requireUser(auth)
    if (!user) return fail('UNAUTHORIZED', '未登录或登录已过期')
    const { realName, phone } = body as { realName?: string; phone?: string }
    if (!realName?.trim() || !phone?.trim()) {
      return fail('BAD_REQUEST', '真实姓名和手机号不能为空')
    }
    if (!isValidPhone(phone)) {
      return fail('BAD_REQUEST', '手机号格式不正确')
    }
    user.realName = realName.trim()
    user.phone = phone.trim()
    user.updatedAt = new Date().toISOString()
    return ok(toProfile(user), '个人资料更新成功')
  }),

  route('PUT', '/api/v1/admin/auth/password', (_p, body, _q, auth) => {
    const user = requireUser(auth)
    if (!user) return fail('UNAUTHORIZED', '未登录或登录已过期')
    const { oldPassword, newPassword } = body as { oldPassword?: string; newPassword?: string }
    if (!oldPassword || !newPassword) {
      return fail('BAD_REQUEST', '原密码和新密码不能为空')
    }
    if (oldPassword !== user.password) {
      return fail('INVALID_CREDENTIALS', '原密码不正确')
    }
    if (newPassword.length < 6) {
      return fail('BAD_REQUEST', '新密码至少 6 位')
    }
    if (newPassword === oldPassword) {
      return fail('BAD_REQUEST', '新密码不能与原密码相同')
    }
    user.password = newPassword
    user.updatedAt = new Date().toISOString()
    return ok(null, '密码修改成功，请牢记新密码')
  }),

  // ── 管理员账号 ──
  route('GET', '/api/v1/admin/users', (_p, _b, query) => {
    const keyword = (query.keyword ?? '').trim().toLowerCase()
    const role = query.role ?? ''
    const status = query.status ?? ''
    let list = mockUsers.filter((u) => {
      if (keyword) {
        const hit = [u.username, u.realName, u.phone].some((v) => v.toLowerCase().includes(keyword))
        if (!hit) return false
      }
      if (role) {
        const r = u.roles.includes('super_admin') ? 'super_admin' : 'editor'
        if (r !== role) return false
      }
      if (status === 'active' && !u.isActive) return false
      if (status === 'inactive' && u.isActive) return false
      return true
    })
    const total = list.length
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.max(1, Number(query.pageSize) || 10)
    list = list.slice((page - 1) * pageSize, page * pageSize)
    return ok({ items: list.map(toAccount), total, page, pageSize })
  }),

  route('POST', '/api/v1/admin/users', (_p, body) => {
    const { username, realName, phone, role, isActive, password } = body as {
      username?: string
      realName?: string
      phone?: string
      role?: string
      isActive?: boolean
      password?: string
    }
    if (!username?.trim() || !realName?.trim() || !phone?.trim()) {
      return fail('BAD_REQUEST', '账号、真实姓名、手机号不能为空')
    }
    if (!password || password.length < 6) {
      return fail('BAD_REQUEST', '登录密码至少 6 位')
    }
    if (!isValidPhone(phone)) {
      return fail('BAD_REQUEST', '手机号格式不正确')
    }
    if (role !== 'super_admin' && role !== 'editor') {
      return fail('BAD_REQUEST', '角色参数无效')
    }
    if (mockUsers.some((u) => u.username === username)) {
      return fail('CONFLICT', '账号已存在')
    }
    const now = new Date().toISOString()
    const user: MockAdminUser = {
      id: genId('u'),
      username: username.trim(),
      password,
      realName: realName.trim(),
      phone: phone.trim(),
      roles: [role],
      avatar: '',
      isActive: isActive !== false,
      createdAt: now,
      updatedAt: now,
    }
    mockUsers.push(user)
    return ok(toAccount(user), '管理员账号创建成功')
  }),

  route('PUT', '/api/v1/admin/users/:id', (params, body) => {
    const user = mockUsers.find((u) => u.id === params.id)
    if (!user) return fail('NOT_FOUND', '管理员账号不存在')
    const { username, realName, phone, role, isActive, password } = body as {
      username?: string
      realName?: string
      phone?: string
      role?: string
      isActive?: boolean
      password?: string
    }
    if (!username?.trim() || !realName?.trim() || !phone?.trim()) {
      return fail('BAD_REQUEST', '账号、真实姓名、手机号不能为空')
    }
    if (!isValidPhone(phone)) {
      return fail('BAD_REQUEST', '手机号格式不正确')
    }
    if (role !== 'super_admin' && role !== 'editor') {
      return fail('BAD_REQUEST', '角色参数无效')
    }
    if (mockUsers.some((u) => u.username === username && u.id !== params.id)) {
      return fail('CONFLICT', '账号已存在')
    }
    if (password && password.length < 6) {
      return fail('BAD_REQUEST', '登录密码至少 6 位')
    }
    // 防止降级/禁用最后一个启用的超级管理员
    const wasSuperAdmin = user.roles.includes('super_admin')
    const willBeSuperAdmin = role === 'super_admin'
    const willBeActive = isActive !== false
    if (wasSuperAdmin && (!willBeSuperAdmin || !willBeActive)) {
      const otherActiveSuperAdmins = mockUsers.filter(
        (u) => u.id !== user.id && u.roles.includes('super_admin') && u.isActive,
      )
      if (otherActiveSuperAdmins.length === 0) {
        return fail('CONFLICT', '系统至少需要保留一个启用的超级管理员')
      }
    }
    user.username = username.trim()
    user.realName = realName.trim()
    user.phone = phone.trim()
    user.roles = [role]
    user.isActive = willBeActive
    if (password) user.password = password
    user.updatedAt = new Date().toISOString()
    return ok(toAccount(user), '管理员账号更新成功')
  }),

  route('PUT', '/api/v1/admin/users/:id/status', (params, body) => {
    const user = mockUsers.find((u) => u.id === params.id)
    if (!user) return fail('NOT_FOUND', '管理员账号不存在')
    const { isActive } = body as { isActive?: boolean }
    if (typeof isActive !== 'boolean') {
      return fail('BAD_REQUEST', '状态参数无效')
    }
    if (isActive === false && user.roles.includes('super_admin')) {
      const otherActiveSuperAdmins = mockUsers.filter(
        (u) => u.id !== user.id && u.roles.includes('super_admin') && u.isActive,
      )
      if (otherActiveSuperAdmins.length === 0) {
        return fail('CONFLICT', '系统至少需要保留一个启用的超级管理员')
      }
    }
    user.isActive = isActive
    user.updatedAt = new Date().toISOString()
    return ok(toAccount(user), isActive ? '账号已启用' : '账号已禁用')
  }),

  route('DELETE', '/api/v1/admin/users/:id', (params, _body, _q, auth) => {
    const user = mockUsers.find((u) => u.id === params.id)
    if (!user) return fail('NOT_FOUND', '管理员账号不存在')
    // 自我删除保护
    if (auth.userId === user.id) {
      return fail('CONFLICT', '不能删除当前登录的管理员账号')
    }
    // 超级管理员唯一保护
    if (user.roles.includes('super_admin')) {
      const otherActiveSuperAdmins = mockUsers.filter(
        (u) => u.id !== user.id && u.roles.includes('super_admin') && u.isActive,
      )
      if (otherActiveSuperAdmins.length === 0) {
        return fail('CONFLICT', '系统至少需要保留一个启用的超级管理员')
      }
    }
    mockUsers = mockUsers.filter((u) => u.id !== params.id)
    return ok(null, '管理员账号已删除')
  }),

  // ── 章节 ──
  route('GET', '/api/v1/admin/chapters', () => ok(chaptersWithLevels())),

  route('POST', '/api/v1/admin/chapters', (_p, body) => {
    const { title, subtitle, order, isPublished } = body as {
      title?: string
      subtitle?: string
      order?: number
      isPublished?: boolean
    }
    if (!title?.trim()) {
      return fail('BAD_REQUEST', '章节标题不能为空')
    }
    const chapter: MockChapter = {
      id: genId('ch'),
      title: title.trim(),
      subtitle: subtitle?.trim() ?? '',
      order: order ?? mockChapters.length + 1,
      isPublished: isPublished ?? false,
      createdAt: new Date().toISOString(),
    }
    mockChapters.push(chapter)
    return ok({ ...chapter, levels: [] }, '章节创建成功')
  }),

  route('PUT', '/api/v1/admin/chapters/:id', (params, body) => {
    const chapter = mockChapters.find((c) => c.id === params.id)
    if (!chapter) return fail('NOT_FOUND', '章节不存在')
    const { title, subtitle, order, isPublished } = body as {
      title?: string
      subtitle?: string
      order?: number
      isPublished?: boolean
    }
    if (title !== undefined) {
      if (!title.trim()) return fail('BAD_REQUEST', '章节标题不能为空')
      chapter.title = title.trim()
    }
    if (subtitle !== undefined) chapter.subtitle = subtitle.trim()
    if (order !== undefined) chapter.order = order
    if (isPublished !== undefined) chapter.isPublished = isPublished
    return ok(chapter, '章节更新成功')
  }),

  route('DELETE', '/api/v1/admin/chapters/:id', (params) => {
    const idx = mockChapters.findIndex((c) => c.id === params.id)
    if (idx === -1) return fail('NOT_FOUND', '章节不存在')
    mockChapters.splice(idx, 1)
    mockLevels = mockLevels.filter((lv) => lv.chapterId !== params.id)
    return ok(null, '章节删除成功')
  }),

  // ── 关卡 ──
  route('POST', '/api/v1/admin/chapters/:id/levels', (params, body) => {
    const chapter = mockChapters.find((c) => c.id === params.id)
    if (!chapter) return fail('NOT_FOUND', '章节不存在')
    const { title, description, order, isPublished } = body as {
      title?: string
      description?: string
      order?: number
      isPublished?: boolean
    }
    if (!title?.trim()) {
      return fail('BAD_REQUEST', '关卡标题不能为空')
    }
    const chapterLevels = mockLevels.filter((lv) => lv.chapterId === params.id)
    const level: MockLevel = {
      id: genId('lv'),
      chapterId: params.id,
      title: title.trim(),
      description: description?.trim() ?? '',
      order: order ?? chapterLevels.length + 1,
      isPublished: isPublished ?? false,
      createdAt: new Date().toISOString(),
    }
    mockLevels.push(level)
    return ok(level, '关卡创建成功')
  }),

  route('PUT', '/api/v1/admin/levels/:id', (params, body) => {
    const level = mockLevels.find((l) => l.id === params.id)
    if (!level) return fail('NOT_FOUND', '关卡不存在')
    const { title, description, order, isPublished } = body as {
      title?: string
      description?: string
      order?: number
      isPublished?: boolean
    }
    if (title !== undefined) {
      if (!title.trim()) return fail('BAD_REQUEST', '关卡标题不能为空')
      level.title = title.trim()
    }
    if (description !== undefined) level.description = description.trim()
    if (order !== undefined) level.order = order
    if (isPublished !== undefined) level.isPublished = isPublished
    return ok(level, '关卡更新成功')
  }),

  route('DELETE', '/api/v1/admin/levels/:id', (params) => {
    const idx = mockLevels.findIndex((l) => l.id === params.id)
    if (idx === -1) return fail('NOT_FOUND', '关卡不存在')
    mockLevels.splice(idx, 1)
    return ok(null, '关卡删除成功')
  }),

  // ── 文化图鉴 ──
  route('GET', '/api/v1/admin/cultural-items', (_p, _b, query) => {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.max(1, Number(query.pageSize) || 10)
    const keyword = (query.keyword ?? '').trim().toLowerCase()

    let items = [...mockCulturalItems]
    if (keyword) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(keyword) ||
          i.pinyin.toLowerCase().includes(keyword),
      )
    }
    if (query.category) {
      items = items.filter((i) => i.category === query.category)
    }
    if (query.rarity) {
      items = items.filter((i) => i.rarity === query.rarity)
    }
    if (query.status === 'published') {
      items = items.filter((i) => i.isPublished)
    }
    if (query.status === 'draft') {
      items = items.filter((i) => !i.isPublished)
    }

    // 按创建时间倒序
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const total = items.length
    const start = (page - 1) * pageSize
    return ok({
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    })
  }),

  route('GET', '/api/v1/admin/cultural-items/:id', (params) => {
    const item = mockCulturalItems.find((i) => i.id === params.id)
    if (!item) return fail('NOT_FOUND', '图鉴条目不存在')
    return ok(item)
  }),

  route('POST', '/api/v1/admin/cultural-items', (_p, body) => {
    const { name, pinyin, category, rarity, origin, description, image, isPublished } =
      body as Partial<MockCulturalItem>
    if (!name?.trim()) {
      return fail('BAD_REQUEST', '图鉴名称不能为空')
    }
    if (!category?.trim()) {
      return fail('BAD_REQUEST', '请选择分类')
    }
    const now = new Date().toISOString()
    const item: MockCulturalItem = {
      id: genId('ci'),
      name: name.trim(),
      pinyin: pinyin?.trim() ?? '',
      category: category.trim(),
      rarity: rarity?.trim() || 'common',
      origin: origin?.trim() ?? '',
      description: description?.trim() ?? '',
      image: image ?? '',
      viewCount: 0,
      isPublished: isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    }
    mockCulturalItems.push(item)
    return ok(item, '图鉴创建成功')
  }),

  route('PUT', '/api/v1/admin/cultural-items/:id', (params, body) => {
    const item = mockCulturalItems.find((i) => i.id === params.id)
    if (!item) return fail('NOT_FOUND', '图鉴条目不存在')
    const { name, pinyin, category, rarity, origin, description, image, isPublished } =
      body as Partial<MockCulturalItem>
    if (name !== undefined) {
      if (!name.trim()) return fail('BAD_REQUEST', '图鉴名称不能为空')
      item.name = name.trim()
    }
    if (category !== undefined) {
      if (!category.trim()) return fail('BAD_REQUEST', '请选择分类')
      item.category = category.trim()
    }
    if (pinyin !== undefined) item.pinyin = pinyin.trim()
    if (rarity !== undefined) item.rarity = rarity
    if (origin !== undefined) item.origin = origin.trim()
    if (description !== undefined) item.description = description.trim()
    if (image !== undefined) item.image = image
    if (isPublished !== undefined) item.isPublished = isPublished
    item.updatedAt = new Date().toISOString()
    return ok(item, '图鉴更新成功')
  }),

  route('PUT', '/api/v1/admin/cultural-items/:id/status', (params, body) => {
    const item = mockCulturalItems.find((i) => i.id === params.id)
    if (!item) return fail('NOT_FOUND', '图鉴条目不存在')
    const { isPublished } = body as { isPublished?: boolean }
    if (typeof isPublished !== 'boolean') {
      return fail('BAD_REQUEST', '发布状态参数无效')
    }
    item.isPublished = isPublished
    item.updatedAt = new Date().toISOString()
    return ok(item, isPublished ? '已上架' : '已下架')
  }),

  route('DELETE', '/api/v1/admin/cultural-items/:id', (params) => {
    const idx = mockCulturalItems.findIndex((i) => i.id === params.id)
    if (idx === -1) return fail('NOT_FOUND', '图鉴条目不存在')
    mockCulturalItems.splice(idx, 1)
    return ok(null, '图鉴删除成功')
  }),

  route('POST', '/api/v1/admin/upload/image', (_p, body) => {
    const { filename, data } = body as { filename?: string; data?: string }
    if (!data) {
      return fail('BAD_REQUEST', '图片数据为空')
    }
    return ok(
      {
        url: data, // base64 直接作为可预览的图片地址
        filename: filename ?? 'image.png',
        size: Math.round((data.length * 3) / 4),
      },
      '上传成功',
    )
  }),

  // ── 点位管理 ──
  route('GET', '/api/v1/admin/points', (_p, _b, query) => {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.max(1, Number(query.pageSize) || 10)
    const keyword = (query.keyword ?? '').trim().toLowerCase()

    let items = [...mockPoints]
    if (keyword) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.address.toLowerCase().includes(keyword) ||
          p.nfcTagId.toLowerCase().includes(keyword),
      )
    }
    if (query.status === 'active') {
      items = items.filter((p) => p.isActive)
    }
    if (query.status === 'inactive') {
      items = items.filter((p) => !p.isActive)
    }

    // 按创建时间倒序
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const total = items.length
    const start = (page - 1) * pageSize
    return ok({
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    })
  }),

  route('POST', '/api/v1/admin/points', (_p, body) => {
    const { name, description, address, nfcTagId, image, isActive } = body as Partial<MockPoint>
    if (!name?.trim()) {
      return fail('BAD_REQUEST', '点位名称不能为空')
    }
    if (!nfcTagId?.trim()) {
      return fail('BAD_REQUEST', 'NFC 标签 ID 不能为空')
    }
    // 校验 NFC ID 唯一
    const dup = mockPoints.some((p) => p.nfcTagId.toLowerCase() === nfcTagId.trim().toLowerCase())
    if (dup) {
      return fail('DUPLICATE_NFC', '该 NFC 标签 ID 已被其他点位占用')
    }
    const now = new Date().toISOString()
    const point: MockPoint = {
      id: genId('pt'),
      name: name.trim(),
      description: description?.trim() ?? '',
      address: address?.trim() ?? '',
      nfcTagId: nfcTagId.trim(),
      image: image ?? '',
      isActive: isActive ?? false,
      createdAt: now,
      updatedAt: now,
    }
    mockPoints.push(point)
    return ok(point, '点位创建成功')
  }),

  route('PUT', '/api/v1/admin/points/:id', (params, body) => {
    const point = mockPoints.find((p) => p.id === params.id)
    if (!point) return fail('NOT_FOUND', '点位不存在')
    const { name, description, address, nfcTagId, image, isActive } = body as Partial<MockPoint>
    if (name !== undefined) {
      if (!name.trim()) return fail('BAD_REQUEST', '点位名称不能为空')
      point.name = name.trim()
    }
    if (nfcTagId !== undefined) {
      if (!nfcTagId.trim()) return fail('BAD_REQUEST', 'NFC 标签 ID 不能为空')
      const dup = mockPoints.some(
        (p) => p.id !== point.id && p.nfcTagId.toLowerCase() === nfcTagId.trim().toLowerCase(),
      )
      if (dup) return fail('DUPLICATE_NFC', '该 NFC 标签 ID 已被其他点位占用')
      point.nfcTagId = nfcTagId.trim()
    }
    if (description !== undefined) point.description = description.trim()
    if (address !== undefined) point.address = address.trim()
    if (image !== undefined) point.image = image
    if (isActive !== undefined) point.isActive = isActive
    point.updatedAt = new Date().toISOString()
    return ok(point, '点位更新成功')
  }),

  route('PUT', '/api/v1/admin/points/:id/status', (params, body) => {
    const point = mockPoints.find((p) => p.id === params.id)
    if (!point) return fail('NOT_FOUND', '点位不存在')
    const { isActive } = body as { isActive?: boolean }
    if (typeof isActive !== 'boolean') {
      return fail('BAD_REQUEST', '启用状态参数无效')
    }
    point.isActive = isActive
    point.updatedAt = new Date().toISOString()
    return ok(point, isActive ? '点位已启用' : '点位已停用')
  }),

  route('DELETE', '/api/v1/admin/points/:id', (params) => {
    const idx = mockPoints.findIndex((p) => p.id === params.id)
    if (idx === -1) return fail('NOT_FOUND', '点位不存在')
    mockPoints.splice(idx, 1)
    return ok(null, '点位删除成功')
  }),

  // ── 商城商品 ──────────────────────────────────────────────

  route('GET', '/api/v1/admin/products', (_p, _b, query) => {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.max(1, Number(query.pageSize) || 10)
    const keyword = (query.keyword ?? '').trim().toLowerCase()

    let items = [...mockProducts]
    if (keyword) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.category.toLowerCase().includes(keyword),
      )
    }
    if (query.category) {
      items = items.filter((p) => p.category === query.category)
    }
    if (query.status === 'active') {
      items = items.filter((p) => p.isActive)
    }
    if (query.status === 'inactive') {
      items = items.filter((p) => !p.isActive)
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const total = items.length
    const start = (page - 1) * pageSize
    return ok({
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    })
  }),

  route('POST', '/api/v1/admin/products', (_p, body) => {
    const { name, category, price, originalPrice, stock, image, description, isActive } =
      body as Partial<MockProduct>
    if (!name?.trim()) {
      return fail('BAD_REQUEST', '商品名称不能为空')
    }
    if (!category?.trim()) {
      return fail('BAD_REQUEST', '请选择商品分类')
    }
    if (price === undefined || Number(price) < 0) {
      return fail('BAD_REQUEST', '售价不能小于 0')
    }
    if (stock === undefined || Number(stock) < 0) {
      return fail('BAD_REQUEST', '库存不能小于 0')
    }
    const now = new Date().toISOString()
    const product: MockProduct = {
      id: genId('pd'),
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      originalPrice: originalPrice === undefined ? Number(price) : Number(originalPrice),
      stock: Number(stock),
      sales: 0,
      image: image ?? '',
      description: description?.trim() ?? '',
      isActive: isActive ?? false,
      createdAt: now,
      updatedAt: now,
    }
    mockProducts.push(product)
    return ok(product, '商品创建成功')
  }),

  route('PUT', '/api/v1/admin/products/:id', (params, body) => {
    const product = mockProducts.find((p) => p.id === params.id)
    if (!product) return fail('NOT_FOUND', '商品不存在')
    const { name, category, price, originalPrice, stock, image, description, isActive } =
      body as Partial<MockProduct>
    if (name !== undefined) {
      if (!name.trim()) return fail('BAD_REQUEST', '商品名称不能为空')
      product.name = name.trim()
    }
    if (category !== undefined) {
      if (!category.trim()) return fail('BAD_REQUEST', '请选择商品分类')
      product.category = category.trim()
    }
    if (price !== undefined) {
      if (Number(price) < 0) return fail('BAD_REQUEST', '售价不能小于 0')
      product.price = Number(price)
    }
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice)
    if (stock !== undefined) {
      if (Number(stock) < 0) return fail('BAD_REQUEST', '库存不能小于 0')
      product.stock = Number(stock)
    }
    if (image !== undefined) product.image = image
    if (description !== undefined) product.description = description.trim()
    if (isActive !== undefined) product.isActive = isActive
    product.updatedAt = new Date().toISOString()
    return ok(product, '商品更新成功')
  }),

  route('PUT', '/api/v1/admin/products/:id/status', (params, body) => {
    const product = mockProducts.find((p) => p.id === params.id)
    if (!product) return fail('NOT_FOUND', '商品不存在')
    const { isActive } = body as { isActive?: boolean }
    if (typeof isActive !== 'boolean') {
      return fail('BAD_REQUEST', '上架状态参数无效')
    }
    product.isActive = isActive
    product.updatedAt = new Date().toISOString()
    return ok(product, isActive ? '商品已上架' : '商品已下架')
  }),

  route('DELETE', '/api/v1/admin/products/:id', (params) => {
    const idx = mockProducts.findIndex((p) => p.id === params.id)
    if (idx === -1) return fail('NOT_FOUND', '商品不存在')
    mockProducts.splice(idx, 1)
    return ok(null, '商品删除成功')
  }),

  // ── 订单管理 ──────────────────────────────────────────────

  route('GET', '/api/v1/admin/orders', (_p, _b, query) => {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.max(1, Number(query.pageSize) || 10)
    const keyword = (query.keyword ?? '').trim().toLowerCase()

    let items = [...mockOrders]
    if (keyword) {
      items = items.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(keyword) ||
          o.buyerName.toLowerCase().includes(keyword) ||
          o.buyerPhone.replace(/\s/g, '').includes(keyword.replace(/\s/g, '')),
      )
    }
    if (query.status) {
      items = items.filter((o) => o.status === query.status)
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const total = items.length
    const start = (page - 1) * pageSize
    return ok({
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    })
  }),

  route('GET', '/api/v1/admin/orders/:id', (params) => {
    const order = mockOrders.find((o) => o.id === params.id)
    if (!order) return fail('NOT_FOUND', '订单不存在')
    return ok(order)
  }),

  route('PUT', '/api/v1/admin/orders/:id/status', (params, body) => {
    const order = mockOrders.find((o) => o.id === params.id)
    if (!order) return fail('NOT_FOUND', '订单不存在')
    const { status } = body as { status?: string }
    if (!status) {
      return fail('BAD_REQUEST', '订单状态参数无效')
    }
    // 流转规则来自共享契约 ORDER_TRANSITIONS（与订单页一致）；终态无可流转状态
    const allowed = ORDER_TRANSITIONS[order.status] ?? []
    if (!allowed.some((a) => a.status === status)) {
      return fail('INVALID_STATUS', `订单状态不允许从 ${order.status} 流转到 ${status}`)
    }
    order.status = status as MockOrder['status']
    order.updatedAt = new Date().toISOString()
    const tip: Record<string, string> = {
      paid: '订单已标记为已付款',
      shipped: '订单已发货',
      completed: '订单已完成',
      cancelled: '订单已取消',
    }
    return ok(order, tip[status] ?? '订单状态已更新')
  }),

  // ── 数据看板 ──────────────────────────────────────────────

  route('GET', '/api/v1/admin/dashboard/summary', () => {
    const activePoints = mockPoints.filter((p) => p.isActive).length
    return ok({
      totalUsers: mockUsers.length,
      totalItems: mockCulturalItems.length,
      totalNodes: mockChapters.length + mockLevels.length + activePoints,
      todayActiveUsers: 823,
    })
  }),

  route('GET', '/api/v1/admin/dashboard/stats', () => {
    // 图鉴解锁 TOP 榜：按图鉴浏览热度派生（viewCount 折算解锁次数）
    const unlockRank = [...mockCulturalItems]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 8)
      .map((i) => ({
        id: i.id,
        name: i.name,
        count: Math.round(i.viewCount / 2),
      }))

    // 近 7 日扫码趋势（今天为 08-26）
    const scanTrend = [
      { date: '08-20', count: 312 },
      { date: '08-21', count: 358 },
      { date: '08-22', count: 296 },
      { date: '08-23', count: 421 },
      { date: '08-24', count: 385 },
      { date: '08-25', count: 463 },
      { date: '08-26', count: 467 },
    ]

    // 近 12 月用户增长（累计注册）
    const userTrend = [
      { month: '25-09', total: 1286 },
      { month: '25-10', total: 1520 },
      { month: '25-11', total: 1784 },
      { month: '25-12', total: 1996 },
      { month: '26-01', total: 2142 },
      { month: '26-02', total: 2278 },
      { month: '26-03', total: 2459 },
      { month: '26-04', total: 2610 },
      { month: '26-05', total: 2788 },
      { month: '26-06', total: 2956 },
      { month: '26-07', total: 3150 },
      { month: '26-08', total: 3286 },
    ]

    // 文化分类占比（按现有图鉴数据统计）
    const catMap = new Map<string, number>()
    for (const item of mockCulturalItems) {
      catMap.set(item.category, (catMap.get(item.category) ?? 0) + 1)
    }
    const categoryDist = [...catMap.entries()].map(([name, value]) => ({ name, value }))

    return ok({
      totalUsers: 3286,
      todayScans: 467,
      totalItems: mockCulturalItems.length,
      todayActiveUsers: 823,
      scanTrend,
      unlockRank,
      userTrend,
      categoryDist,
    })
  }),
]

// ── Vite 插件 ─────────────────────────────────────────────────

export function setupMockServer(server: ViteDevServer) {
  server.middlewares.use((req, res, next) => {
    // 只拦截 API 请求
    if (!req.url?.startsWith('/api')) {
      return next()
    }

    const method = req.method?.toUpperCase()
    const [pathname, queryString = ''] = req.url.split('?')
    const query = Object.fromEntries(new URLSearchParams(queryString))

    // 匹配路由
    let matched: { route: MockRoute; params: Record<string, string> } | null = null
    for (const r of routes) {
      if (r.method !== method) continue
      const m = pathname.match(r.pattern)
      if (m) {
        const params: Record<string, string> = {}
        r.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(m[i + 1])
        })
        matched = { route: r, params }
        break
      }
    }

    if (!matched) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          code: 'NOT_FOUND',
          message: `Mock 未注册: ${method} ${pathname}`,
          data: null,
        }),
      )
      return
    }

    const { route: matchedRoute, params } = matched

    // 读取请求体（POST/PUT）
    const hasBody = method === 'POST' || method === 'PUT'
    const respond = (body: unknown) => {
      const auth = { userId: parseMockUserId(req.headers) }
      const result = matchedRoute.handler(params, body, query, auth)
      Promise.resolve(result).then((data) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(data))
      })
    }

    if (hasBody) {
      const chunks: Buffer[] = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => {
        let body = {}
        try {
          body = JSON.parse(Buffer.concat(chunks).toString())
        } catch {
          // 忽略解析错误
        }
        respond(body)
      })
      return
    }

    respond({})
  })

  console.log('✅ [Mock Server] 已启动')
}
