/**
 * 文化图鉴领域常量（key 与后端 CulturalCategory / Rarity 枚举保持一致）。
 */
export const CULTURAL_CATEGORIES = [
  { key: 'clothing', label: '服饰' },
  { key: 'pattern', label: '纹样' },
  { key: 'music', label: '音乐' },
  { key: 'cuisine', label: '饮食' },
  { key: 'craft', label: '工艺' },
]

export const RARITY_META = {
  common: { label: '普通', color: '#6B6560', bg: '#F1EFEC' },
  rare: { label: '稀有', color: '#B8860B', bg: '#FBF3E0' },
  legendary: { label: '传说', color: '#8B1E3F', bg: '#F6E3E8' },
}

export function rarityLabel(key) {
  return (RARITY_META[key] || RARITY_META.common).label
}

export function rarityColor(key) {
  return (RARITY_META[key] || RARITY_META.common).color
}
