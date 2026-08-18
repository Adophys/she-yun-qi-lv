# 畲韵奇旅 - Vue 3 管理端

## 技术栈

- Vue 3 + TypeScript
- Vue Router
- Vite
- `@lucide/vue` 图标

## 开发启动

```bash
pnpm install
pnpm dev
```

## 项目结构

```
src/
├── api/           # 接口封装
├── components/    # 可复用组件
├── composables/   # 组合式函数
├── config/        # 菜单与导航配置
├── layout/        # 布局组件
├── router/        # 路由
├── types/         # 类型定义
├── utils/         # 工具函数
└── views/         # 页面视图
```

## 认证说明

- Access Token 仅存内存，页面刷新后通过 HttpOnly Cookie 中的 refresh token 恢复会话
- 登录调用 `POST /api/v1/admin/auth/login`
- 401 时自动 single-flight 刷新一次
