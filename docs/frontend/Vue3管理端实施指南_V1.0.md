# Vue 3 管理端实施指南 V1.0

## 1. 环境准备

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

## 2. 目录约定

```
src/
├── api/           # 接口封装（按领域）
├── components/    # 可复用组件
├── composables/   # 组合式函数
├── config/        # 菜单与导航
├── layout/        # 布局
├── router/        # 路由
├── types/         # 类型
├── utils/         # 工具
└── views/         # 页面
```

## 3. API 封装

所有请求通过 `src/api/http.ts` 中的 `get/post` 方法，自动解析统一 envelope：

```ts
import { get } from '@/api/http'
import type { DashboardSummary } from '@/types/admin'

export async function getSummary(): Promise<DashboardSummary> {
  return get('/admin/dashboard/summary')
}
```

## 4. 路由

在 `src/router/index.ts` 中注册新页面，`meta.title` 用于设置页面标题。

## 5. 视图组件

每个视图一个 `.vue` 文件，命名 `PascalCaseView.vue`。

## 6. 认证

- 登录调用 `api/auth.ts` 的 `login`
- Access Token 内存存储（后续接入）
- 401 自动刷新（后续接入）
