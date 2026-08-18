# 畲韵奇旅 - uni-app 微信小程序

## 技术栈

- uni-app 3.0
- Vue 3
- 微信小程序

## 开发启动

```bash
npm install
npm run dev:mp-weixin
```

然后使用微信开发者工具打开 `dist/dev/mp-weixin`。

## 项目结构

```
src/
├── pages/           # 页面
├── components/      # 可复用组件
├── api/             # 领域 API
├── config/          # 环境配置
├── constants/       # 常量
├── router/          # 路由常量与跳转
├── services/        # 复杂业务流程
├── static/          # 静态资源与 tabbar 图标
├── storage/         # 本地存储封装
├── stores/          # 跨页面状态
└── utils/           # 工具函数
```

## 分层约定

页面 → Store / Service → 领域 API → HTTP Client → Transport → FastAPI

- 页面禁止直接拼 URL、禁止直接读写 Token
- `http.js` 内置 single-flight refresh、401 最多重试一次
