# 显式导入全部模型，供 create_all / drop_all 使用


def import_all_models() -> None:
    from app.models import accounts, achievements, cultural, explore, wardrobe  # noqa: F401
