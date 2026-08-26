from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from app.core.config import Settings, get_settings

password_hash = PasswordHash.recommended()


def hash_password(plain: str) -> str:
    return password_hash.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return password_hash.verify(plain, hashed)


def create_access_token(subject: str, domain: str, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    if domain == "app":
        secret = settings.app_jwt_secret
        issuer = settings.app_jwt_issuer
        audience = settings.app_jwt_audience
    else:
        secret = settings.admin_jwt_secret
        issuer = settings.admin_jwt_issuer
        audience = settings.admin_jwt_audience

    return _create_token(subject, secret, issuer, audience, settings.access_token_ttl_minutes)


def create_refresh_token(subject: str, domain: str, settings: Settings | None = None) -> str:
    """MVP 简化：refresh 复用同密钥，TTL 用 refresh_token_ttl_days。"""
    settings = settings or get_settings()
    if domain == "app":
        secret = settings.app_jwt_secret
        issuer = settings.app_jwt_issuer
        audience = settings.app_jwt_audience
    else:
        secret = settings.admin_jwt_secret
        issuer = settings.admin_jwt_issuer
        audience = settings.admin_jwt_audience

    return _create_token(
        subject, secret, issuer, audience, settings.refresh_token_ttl_days * 24 * 60
    )


def _create_token(subject: str, secret: str, issuer: str, audience: str, ttl_minutes: int) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "iss": issuer,
        "aud": audience,
        "iat": now,
        "exp": now + timedelta(minutes=ttl_minutes),
    }
    return jwt.encode(payload, secret, algorithm="HS256")
