import React, { useState } from 'react';
import { CollectionCategory, CulturalItem, UserProfile } from '../types';
import { Shirt, Grid3X3, Music, UtensilsCrossed, Hammer, Star, BookOpen, Search } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface CollectionViewProps {
  user: UserProfile;
  items: CulturalItem[];
  onSelectItem: (item: CulturalItem) => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({ user, items, onSelectItem }) => {
  const [activeCategory, setActiveCategory] = useState<CollectionCategory>('clothing');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'clothing' as CollectionCategory, label: '服饰', icon: Shirt },
    { id: 'pattern' as CollectionCategory, label: '纹样', icon: Grid3X3 },
    { id: 'music' as CollectionCategory, label: '音乐', icon: Music },
    { id: 'cuisine' as CollectionCategory, label: '饮食', icon: UtensilsCrossed },
    { id: 'craft' as CollectionCategory, label: '工艺', icon: Hammer },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 select-none">
      {/* Title & Collection Progress Pill (Image 19) */}
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif">文化图鉴</h2>
        <div className="mt-1.5 flex items-center gap-1.5 px-3.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-700">
          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
          <span>已收集 {user.collectedCards}/{user.totalCards}</span>
        </div>
      </div>

      {/* 5 Category Filter Tabs (Image 19) */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`collection-cat-${cat.id}`}
              onClick={() => {
                soundManager.playTap();
                setActiveCategory(cat.id);
              }}
              className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-red-700 text-white shadow-md shadow-red-700/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${isActive ? 'text-red-700' : 'text-slate-500'}`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dashed Separator (Image 19) */}
      <div className="w-full border-b-2 border-dashed border-slate-200/80 mb-5" />

      {/* Grid of Cultural Items */}
      <div className="grid grid-cols-2 gap-3.5">
        {filteredItems.map((item) => {
          if (!item.isDiscovered) {
            return (
              <div
                key={item.id}
                className="bg-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[190px] border border-slate-200/60 shadow-2xs"
              >
                <div className="w-20 h-20 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-400 font-bold text-2xl mb-3">
                  ?
                </div>
                <span className="text-xs font-bold text-slate-500">???</span>
                <span className="text-[10px] text-slate-400 mt-0.5">未解锁</span>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              id={`collection-item-${item.id}`}
              onClick={() => {
                soundManager.playTap();
                onSelectItem(item);
              }}
              className="bg-white rounded-2xl p-2.5 flex flex-col border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative group active:scale-[0.98]"
            >
              {/* Corner Tag for new or rare items */}
              {item.isFavorite && (
                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                  新发现
                </div>
              )}

              {/* Artifact Picture Thumbnail */}
              <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title and Stars Rating */}
              <div className="p-1.5 flex flex-col items-center text-center">
                <h3 className="text-sm font-black text-slate-900 tracking-tight font-serif mt-1">
                  {item.name}
                </h3>
                <div className="flex gap-1 mt-1 text-red-500">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s <= item.stars ? 'fill-red-500 text-red-500' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
