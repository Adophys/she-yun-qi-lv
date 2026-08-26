FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency manifests first for layer caching
COPY pyproject.toml ./

# Install production dependencies
RUN uv sync --frozen --no-dev

# Copy application code + alembic 迁移
COPY app/ ./app/
COPY alembic.ini ./
COPY alembic/ ./alembic/

# Create non-root user
RUN groupadd -r syql && useradd -r -g syql syql && chown -R syql:syql /app
USER syql

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*"]
