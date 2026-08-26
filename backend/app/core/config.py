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

    # 微信小程序（code2session）；未配置时 wx-login 走 mock 模式（本地联调用）
    wechat_app_id: str | None = Field(default=None, alias="WECHAT_APPID")
    wechat_secret: str | None = Field(default=None, alias="WECHAT_SECRET")

    # 商城真实支付 feature flag：资质未办齐时保持 false（前端提示意向收集）
    shop_payment_enabled: bool = Field(default=False, alias="SHOP_PAYMENT_ENABLED")

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
    # pydantic-settings 动态字段在 mypy 下误报缺参数，属已知问题
    return Settings()  # type: ignore[call-arg]
