from enum import StrEnum


class CulturalCategory(StrEnum):
    CLOTHING = "clothing"
    PATTERN = "pattern"
    MUSIC = "music"
    CUISINE = "cuisine"
    CRAFT = "craft"


class Rarity(StrEnum):
    COMMON = "common"
    RARE = "rare"
    LEGENDARY = "legendary"
