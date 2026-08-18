# FastAPI 后端工程实施指南 V1.0

## 1. 环境准备

```bash
cd backend
cp .env.example .env
uv sync
```

## 2. 目录约定

```
app/
├── api/           # HTTP 路由与 DTO
├── core/          # 配置、日志、中间件、异常
├── db/            # ORM 基础、会话
├── domain/        # 业务枚举与异常
├── models/        # SQLAlchemy 模型
├── repositories/  # 数据访问
├── services/      # 业务逻辑
├── integrations/  # 外部服务
└── commands/      # CLI 脚本
```

## 3. 新增一个业务模块的步骤

以「文化图鉴」为例：

1. 在 `app/domain/cultural.py` 中补充枚举
2. 在 `app/models/cultural.py` 中定义 `CulturalItem` 表
3. 在 `app/repositories/cultural.py` 中写查询方法
4. 在 `app/services/cultural.py` 中写业务方法
5. 在 `app/api/v1/app/cultural_items/router.py` 中暴露接口
6. 在 `app/api/v1/app/router.py` 中 include_router
7. 在 `app/db/model_registry.py` 中导入模型

## 4. 模型规范

- 继承 `Base + UUIDPrimaryKeyMixin + TimestampMixin`
- 表名单数 snake_case
- 列带中文 `comment`
- 枚举使用 Python `StrEnum`

## 5. API 规范

- 使用 `ApiResponse[T]` 统一响应
- schemas 继承 `ApiModel`，字段 snake_case，输出 camelCase
- 路由层只做校验与调用 services

## 6. 测试

```bash
uv run pytest --cov=app --cov-report=term-missing
```

## 7. 常用命令

```bash
uv run uvicorn app.main:app --reload
uv run python -m app.commands.init_db
uv run python -m app.commands.seed_demo_data
uv run python -m app.commands.drop_db
```
