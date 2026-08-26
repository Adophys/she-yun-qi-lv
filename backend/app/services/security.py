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
        ttl = settings.access_token_ttl_minutes
    else:
        secret = settings.admin_jwt_secret
        issuer = settings.admin_jwt_issuer
        audience = settings.admin_jwt_audience
        ttl = settings.access_token_ttl_minutes

    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "iss": issuer,
        "aud": audience,
        "iat": now,
        "exp": now + timedelta(minutes=ttl),
    }
    return jwt.encode(payload, secret, algorithm="HS256")
