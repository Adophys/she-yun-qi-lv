# 畲韵奇旅 - uni-app 小程序端

基于 uni-app + Vue 3 的微信小程序（用户端核心体验）。

## 快速开始

```bash
npm install
cp .env.example .env.development   # 按需修改后端地址
npm run dev:mp-weixin
```

然后用微信开发者工具打开 `dist/dev/mp-weixin`（AppID 请替换 `manifest.json` / `project.config.json` 中的 `touristappid`）。

## 目录约定

```
src/
├── pages/           # 页面
├── components/      # 可复用组件（预留）
├── api/             # 领域 API（home/explore/scan/wardrobe/achievements/users/shop/cultural/auth）
├── config/          # 环境配置 + 功能开关
├── constants/       # 常量（分类/稀有度/隐私协议/商城状态）
├── router/          # 路由路径常量
├── services/        # 业务流程（app-bootstrap 启动引导）
├── static/          # 静态资源与 tabbar 图标
├── storage/         # 本地存储封装（Key 统一管理）
├── stores/          # 跨页面状态（session 登录态）
└── utils/           # 工具函数（格式化/图片/登录拦截）
```

## 页面清单

| 页面 | 说明 |
|---|---|
| pages/index | 村落主页：IP 形象、每日任务、章节进度、快捷入口 |
| pages/explore | 章节探索：节点列表、解锁状态 |
| pages/scan | 扫码解锁：二维码/NFC 码值识别 |
| pages/collection | 文化图鉴：五大分类、解锁/剪影 |
| pages/item-detail | 图鉴详情：文化内涵、分享 |
| pages/mine | 个人中心：积分/通关/图鉴统计、菜单 |
| pages/wardrobe | IP 衣橱：碎片进度、合成 |
| pages/puzzle | 凤凰拼图：3x3 / 4x4 滑动拼图 |
| pages/achievements | 成就勋章墙 |
| pages/settings | 设置：音效/通知/清缓存/协议/注销 |
| pages/terms | 用户协议 + 隐私政策 |
| pages/login | 微信一键登录 / 游客模式 |
| pages/shop 等 | 商城模块（分类/商品/购物车/订单/地址，按接口契约接入） |

## 分层与规范

- 页面 → Store/Service → 领域 API → HTTP Client → Transport → FastAPI
- 页面禁止直接拼 URL、禁止直接读写 Token
- `http.js` 内置单飞刷新、401 最多重试一次；失效后自动跳登录
- 新增页面需同时更新 `src/pages/{name}/{name}.vue` 与 `pages.json`

## 功能开关（src/config/api.js）

- `FEATURE_FLAGS.shopEnabled`：商城入口开关（后端商城接口就绪后置 true）
- `FEATURE_FLAGS.shopPaymentEnabled`：微信支付开关（资质未办齐时 false，支付降级为意向收集）

## 与后端接口契约

以 `docs/architecture/接口契约_V1.0.md` 为唯一依据；后端当前已实现：auth / home / cultural-items / explore-nodes / scan / wardrobe / achievements / users；商城接口按契约接入，待后端实现后可直接联调。
