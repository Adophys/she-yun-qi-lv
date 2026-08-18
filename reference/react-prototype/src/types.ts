export type TabType = 'village' | 'explore' | 'scan' | 'collection' | 'mine';

export type ScreenType =
  | 'main'
  | 'wardrobe'
  | 'puzzle'
  | 'challenge_success'
  | 'item_detail'
  | 'settings'
  | 'terms'
  | 'login';

export type WardrobeCategory = 'clothes' | 'headwear' | 'accessories' | 'skins';

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  fragments: number;
  totalFragments: number;
  isEquipped: boolean;
  isLocked: boolean;
  image: string;
  description: string;
  rarity?: '普通' | '稀有' | '传世';
}

export type CollectionCategory = 'clothing' | 'pattern' | 'music' | 'cuisine' | 'craft';

export interface CulturalItem {
  id: string;
  name: string;
  pinyin: string;
  category: CollectionCategory;
  rarity: '普通' | '稀有' | '传世';
  origin: string;
  material: string;
  symbolism: string;
  description: string;
  isDiscovered: boolean;
  stars: number;
  image: string;
  isFavorite: boolean;
  tags?: string[];
  audioSample?: string;
}

export interface ExploreNode {
  id: string;
  name: string;
  location: string;
  status: 'completed' | 'active' | 'locked';
  stars: number;
  previewImg: string;
  levelNum: number;
  chapter: string;
  description: string;
}

export interface AchievementBadge {
  id: string;
  name: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  description: string;
  color?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  level: number;
  title: string;
  points: number;
  completedStages: number;
  totalStages: number;
  collectedCards: number;
  totalCards: number;
  arDiscovered: number;
  phone: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  cacheSizeMB: number;
  isLoggedIn: boolean;
}

export interface PuzzlePiece {
  id: number;
  symbol: string;
  iconType: 'leaf' | 'fire' | 'star' | 'diamond';
  targetIndex: number;
  currentIndex: number | null; // null if in tray
  color: string;
  bgColor: string;
}
