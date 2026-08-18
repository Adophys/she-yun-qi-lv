# uni-app 小程序实施指南 V1.0

## 1. 环境准备

```bash
cd miniapp/uni-app
npm install
cp .env.example .env.development
npm run dev:mp-weixin
```

然后微信开发者工具打开 `dist/dev/mp-weixin`。

## 2. 目录约定

```
src/
├── pages/           # 页面
├── components/      # 组件
├── api/             # 领域 API
├── config/          # 环境配置
├── constants/       # 常量
├── router/          # 路由路径常量
├── services/        # 业务流程
├── static/          # 静态资源
├── storage/         # 本地存储封装
├── stores/          # 全局状态
└── utils/           # 工具函数
```

## 3. 页面开发

新增页面需同时更新：

1. `src/pages/{name}/{name}.vue`
2. `pages.json` 中注册页面路径

## 4. API 调用

通过 `src/api/http.js` 发起请求：

```js
import { http } from '@/api/http'

export async function getCulturalItems() {
  return http.get('/cultural-items')
}
```

禁止页面直接拼 URL 或读写 token。

## 5. 路由跳转

使用 `src/router/routes.js` 中的常量：

```js
import { ROUTE_PATHS } from '@/router/routes'

uni.navigateTo({ url: `${ROUTE_PATHS.PUZZLE}?id=${nodeId}` })
```

## 6. 状态管理

使用 `src/stores/session.js` 管理登录态：

```js
const { setUser, setToken } = useSessionStore()
```

## 7. UI 还原

参考 `docs/designs/ui-screens/` 下的截图与 HTML 原型，按设计稿实现页面。
