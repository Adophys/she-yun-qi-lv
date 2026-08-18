# 畲韵奇旅 - FastAPI 后端

## 技术栈

- FastAPI
- SQLAlchemy 2 (async)
- PostgreSQL 16
- pydantic-settings
- uv

## 开发启动

```bash
# 1. 确保 PostgreSQL 已启动 (在项目根目录执行 docker compose up -d)

# 2. 进入后端目录并安装依赖
cd backend
cp .env.example .env
uv sync

# 3. 初始化数据库表与初始数据
uv run python -m app.commands.init_db
uv run python -m app.commands.seed_demo_data

# 4. 启动开发服务器
uv run uvicorn app.main:app --reload
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
