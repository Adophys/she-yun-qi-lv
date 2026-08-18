# 畲韵奇旅 (She Culture Journey)

大学生创新创业大赛项目 —— 基于微信小程序的畲族文化数字化体验与科普平台。

本项目为模块化单体 Monorepo，包含三个独立工程：

| 工程 | 目录 | 技术栈 | 说明 |
|---|---|---|---|
| 后端 | `backend/` | FastAPI + SQLAlchemy 2 + PostgreSQL 16 | RESTful API、业务逻辑、数据持久化 |
| 管理端 | `frontend/` | Vue 3 + TypeScript + Vite | 运营后台，管理文化内容、用户、关卡 |
| 小程序 | `miniapp/uni-app/` | uni-app + Vue 3 | 微信小程序，用户端核心体验 |

> 文档位于 `docs/`，包含架构设计、数据库设计、接口契约与部署说明。

## 快速开始

### 环境要求

- Docker Desktop（本地 PostgreSQL）
- Python 3.12 + [uv](https://github.com/astral-sh/uv)
- Node.js 20+（推荐 22 LTS），pnpm（管理端）、npm（小程序）
- 微信开发者工具（预览/调试小程序）

### 启动顺序

```bash
# 1. 启动本地 PostgreSQL
cp .env.example .env
docker compose up -d

# 2. 启动后端
cd backend
cp .env.example .env
uv sync
uv run python -m app.commands.init_db
uv run python -m app.commands.seed_demo_data
uv run uvicorn app.main:app --reload

# 3. 启动管理端
cd ../frontend
cp .env.example .env
pnpm install
pnpm dev

# 4. 启动小程序
cd ../miniapp/uni-app
cp .env.example .env.development
npm install
npm run dev:mp-weixin
```

## 项目结构

```
.
├── backend/            # FastAPI 后端
├── frontend/           # Vue 3 管理端
├── miniapp/uni-app/    # uni-app 微信小程序
├── docs/               # 架构、数据库、接口、部署文档
├── deploy/             # 生产 Nginx / Docker 部署配置
├── storage/            # 本地私有媒体存储
└── reference/          # 早期原型参考代码（React / 原生小程序骨架）
```

## 核心功能域

- **村落主页**：IP 形象展示、每日任务、章节进度、快捷入口
- **章节探索**：地图式关卡、解锁机制、星级评分
- **AR / NFC 扫描**：识别文化符号解锁图鉴卡片
- **文化图鉴**：服饰、纹样、音乐、饮食、工艺五大类收藏
- **IP 衣橱**：服饰、头饰、配饰、皮肤换装与碎片合成
- **凤凰拼图**：纹样拼图小游戏
- **个人中心**：成就勋章、收藏、衣橱、设置、帮助反馈

## 团队与协作

- **GitHub 仓库**：`she-yun-qi-lv`
- **协作者**：@web-demo-lab、@mute-sheep

### 分支策略

| 分支 | 用途 | 保护规则 |
|---|---|---|
| `main` | 生产就绪代码 | 禁止直推，需 PR + 1 review |
| `develop` | 集成测试 | 允许直推 |
| `feature/*` | 功能开发 | 命名如 `feature/scan-page` |
| `fix/*` | Bug 修复 | 命名如 `fix/login-redirect` |

### 分工建议

| 成员 | 建议负责 |
|---|---|
| 小陈 (Adophys) | 后端 API + 数据库 + 部署 |
| @web-demo-lab | 管理端 Vue 3 |
| @mute-sheep | 小程序 uni-app |

## 协作规范

1. 三个工程独立依赖、独立构建，通过 `docs/` 中的接口契约连接。
2. 后端严格分层：`api → services → repositories → models/domain → db`。
3. 小程序严格分层：`pages → stores/services → api → http → transport`。
4. 提交前请阅读各子工程的 `README.md`。
5. 提交信息格式：`type(scope): description`，如 `feat(scan): AR 扫描页面骨架`。

## 文档索引

- [需求分析](docs/requirements/需求分析_V1.0.md)
- [M1 任务分工](docs/development/M1任务分工.md)
- [系统整体架构设计](docs/architecture/系统整体架构设计_V1.0.md)
- [数据库设计](docs/database/数据库设计_V1.0.md)
- [接口契约](docs/architecture/接口契约_V1.0.md)
- [FastAPI 后端工程实施指南](docs/backend/FastAPI后端工程实施指南_V1.0.md)
- [Vue 3 管理端实施指南](docs/frontend/Vue3管理端实施指南_V1.0.md)
- [uni-app 小程序实施指南](docs/miniapp/uni-app小程序实施指南_V1.0.md)
- [生产环境部署指南](docs/deployment/部署指南_V1.0.md)
