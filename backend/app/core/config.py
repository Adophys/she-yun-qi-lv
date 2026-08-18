from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = Field(default="local", alias="APP_ENV")
    database_url: str = Field(alias="DATABASE_URL")

    app_jwt_secret: str = Field(alias="APP_JWT_SECRET")
    admin_jwt_secret: str = Field(alias="ADMIN_JWT_SECRET")
    app_jwt_issuer: str = Field(default="sheyunqilv-app", alias="APP_JWT_ISSUER")
    app_jwt_audience: str = Field(default="sheyunqilv-miniapp", alias="APP_JWT_AUDIENCE")
    admin_jwt_issuer: str = Field(default="sheyunqilv-admin", alias="ADMIN_JWT_ISSUER")
    admin_jwt_audience: str = Field(default="sheyunqilv-web", alias="ADMIN_JWT_AUDIENCE")

    access_token_ttl_minutes: int = Field(default=30, alias="ACCESS_TOKEN_TTL_MINUTES")
    refresh_token_ttl_days: int = Field(default=7, alias="REFRESH_TOKEN_TTL_DAYS")

    initial_admin_username: str = Field(default="admin", alias="INITIAL_ADMIN_USERNAME")
    initial_admin_password: str = Field(default="admin123", alias="INITIAL_ADMIN_PASSWORD")

    @model_validator(mode="after")
    def check_secrets(self):
        if self.app_env == "production":
            for name, value in [
                ("app_jwt_secret", self.app_jwt_secret),
                ("admin_jwt_secret", self.admin_jwt_secret),
            ]:
                if len(value) < 32:
                    raise ValueError(f"{name} must be at least 32 characters in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
