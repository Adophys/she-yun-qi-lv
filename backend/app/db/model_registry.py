# 显式导入全部模型，供 create_all / drop_all 使用


def import_all_models() -> None:
    from app.models import (  # noqa: F401
        accounts,
        achievements,
        cultural,
        explore,
        shop,
        wardrobe,
    )
