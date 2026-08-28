# 畲韵奇旅 · Vue 3 管理端

畲族文化 AR 导览项目 · 后台管理系统（Web 管理端）。

## 技术栈

- Vue 3 + TypeScript（`<script setup>` 组合式 API）
- Vue Router 4
- Vite 6
- lucide-vue-next 图标
- 开发环境内置 Mock 服务器（`src/mock`，仅本地调试，生产构建不打包）

## 环境要求

- Node.js ≥ 18
- 包管理器：npm / pnpm 均可（下文以 npm 为例）

## 本地开发启动

```bash
# 1. 安装依赖
npm install

# 2. 准备环境变量（可选，不配置则使用默认值）
cp .env.example .env

# 3. 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

启动后：

- **默认使用 Mock 数据源**：开发环境由 Vite Mock 服务器拦截 `/api/v1` 请求，无需后端即可完整调试
- **对接真实后端**：修改 `.env` 中 `VITE_API_BASE_URL` 或 `PROXY_TARGET` 后重启即可（详见下方环境变量说明）
- Mock 服务器随 vite 插件加载，仅 `development` 模式启用，不影响生产构建

## 生产打包构建

```bash
# 类型检查 + 构建（产物输出到 dist/ 目录）
npm run build

# 本地预览构建产物（模拟生产环境）
npm run preview
```

### 生产部署方式

构建产物为 `dist/` 静态文件，可直接部署到任意静态服务器 / CDN / nginx：

- **同域部署（推荐）**：将 `dist/` 放到 nginx 站点目录，`/api/v1` 由 nginx 反向代理到后端服务，前端代码零配置
- **跨域部署**：在构建环境 `.env.production` 中设置 `VITE_API_BASE_URL=https://api.example.com/api/v1`，构建后所有请求直连该后端（需后端开启 CORS）

nginx 同域反向代理参考：

```nginx
server {
    listen 80;
    server_name admin.example.com;

    root /var/www/sheyun-admin/dist;
    index index.html;

    # SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 环境变量说明

环境变量定义见 [.env.example](.env.example)，复制为 `.env` / `.env.development` / `.env.production` 后按需修改：

| 变量 | 默认值 | 作用 |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | 后端接口基础地址。默认走同域 `/api/v1`（开发由 Mock 拦截 / 生产由 nginx 转发）；设为完整地址时请求直连该后端 |
| `VITE_POINT_WEB_BASE` | `https://sheyun.example.com` | 点位管理页生成二维码使用的 H5 端根地址，部署时改为实际域名 |
| `PROXY_TARGET` | `http://127.0.0.1:8000` | 仅本地开发使用：Vite 将 `/api`、`/health` 请求代理到该后端（不随前端打包，不进 `import.meta.env`） |

> 说明：`VITE_` 前缀的变量会注入前端代码（`import.meta.env`）；`PROXY_TARGET` 仅供 `vite.config.ts` 开发代理使用，不暴露给前端。

## 项目结构

```
src/
├── api/           # 接口封装（http.ts 统一请求 + 各业务模块 api）
├── components/    # 可复用组件
├── composables/   # 组合式函数
├── config/        # 菜单与导航配置
├── layout/        # 布局组件
├── mock/          # 本地 Mock 服务器（仅开发模式加载）
├── router/        # 路由
├── types/         # 类型定义与业务枚举契约
├── utils/         # 工具函数
└── views/         # 页面视图
```

## 认证说明

- Access Token 仅存内存，页面刷新后通过 HttpOnly Cookie 中的 refresh token 恢复会话
- 登录调用 `POST /api/v1/admin/auth/login`
- 401 时自动 single-flight 刷新一次
