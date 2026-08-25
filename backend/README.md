# 畲韵奇旅 - FastAPI 后端

## 技术栈

- FastAPI
- SQLAlchemy 2 (async)
- PostgreSQL 16
- pydantic-settings
- uv

## 开发启动

### 方式 A：SQLite 快速启动（不依赖 Docker，适合立刻开写）

```bash
cd backend
cp .env.example .env          # 已内置 sqlite+aiosqlite 的 DATABASE_URL
# 如未内置，把 DATABASE_URL 改为：sqlite+aiosqlite:///./sheyunqilv.db
uv sync
uv run uvicorn app.main:app --reload --reload-dir app
# 浏览器打开 http://127.0.0.1:8000/docs
```

> SQLite 仅用于本地快速开发，生产必须用 PostgreSQL。`app_env=local` 启动时会自动 `create_all` 建表。

### 方式 B：PostgreSQL（推荐，与生产一致）

```bash
# 1. 确保 PostgreSQL 已启动 (在项目根目录执行 docker compose up -d)

# 2. 进入后端目录并安装依赖
cd backend
cp .env.example .env
# 把 DATABASE_URL 改为 postgresql+asyncpg://sheyunqilv:sheyunqilv@localhost:5432/sheyunqilv
uv sync

# 3. 初始化数据库表与初始数据
uv run python -m app.commands.init_db
uv run python -m app.commands.seed_demo_data

# 4. 启动开发服务器
uv run uvicorn app.main:app --reload --reload-dir app
```

## 命令脚本

| 命令 | 说明 |
|---|---|
| `uv run python -m app.commands.init_db` | 建表 + 创建初始管理员 |
| `uv run python -m app.commands.seed_demo_data` | 写入演示数据 |
| `uv run python -m app.commands.drop_db` | 删除所有表（危险） |

## 项目结构

```
app/
├── main.py              # 应用工厂
├── core/                # 配置、日志、中间件、异常
├── db/                  # 数据库基础、会话、mixins
├── api/                 # HTTP 路由层
│   ├── health.py
│   ├── response.py      # 统一响应 envelope
│   ├── schema.py        # ApiModel 基类
│   └── v1/
│       ├── app/         # 小程序接口
│       └── admin/       # 管理端接口
├── domain/              # 业务枚举、值对象、业务异常
├── models/              # SQLAlchemy ORM 模型
├── repositories/        # 数据访问层
├── services/            # 业务逻辑层
├── integrations/        # 外部服务适配
└── commands/            # CLI 维护命令
```

## 分层约定

- `api` → `services` → `repositories` → `models/domain` → `db`
- 路由层禁止直接调用 repositories，禁止堆 SQL
- 所有响应使用 `ApiResponse[T]` 统一 envelope
- 模型字段使用 snake_case，JSON 输出使用 camelCase（ApiModel alias）

## 测试

```bash
uv run pytest --cov=app --cov-report=term-missing
```
