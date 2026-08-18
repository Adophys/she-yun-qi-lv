import React, { useState } from 'react';
import { UserProfile, WardrobeCategory, WardrobeItem } from '../types';
import { SheAvatar } from './SheAvatar';
import { Shirt, Smile, Gem, Sparkles, Lock, Check, ChevronLeft, Plus } from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface WardrobeViewProps {
  user: UserProfile;
  items: WardrobeItem[];
  onBack: () => void;
  onEquipItem: (itemId: string) => void;
  onCraftFragment: (itemId: string) => void;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  user,
  items,
  onBack,
  onEquipItem,
  onCraftFragment,
}) => {
  const [activeCategory, setActiveCategory] = useState<WardrobeCategory>('clothes');

  const categories = [
    { id: 'clothes' as WardrobeCategory, label: '服饰', icon: Shirt },
    { id: 'headwear' as WardrobeCategory, label: '头饰', icon: Smile },
    { id: 'accessories' as WardrobeCategory, label: '配饰', icon: Gem },
    { id: 'skins' as WardrobeCategory, label: '皮肤', icon: Sparkles },
  ];

  const filteredItems = items.filter((i) => i.category === activeCategory);

  // Calculate unlock percentage
  const totalItems = items.length;
  const unlockedCount = items.filter((i) => !i.isLocked).length;
  const unlockPercent = Math.round((unlockedCount / totalItems) * 100);

  const handleEquip = (item: WardrobeItem) => {
    if (item.isLocked) {
      soundManager.playTap();
      return;
    }
    soundManager.playEquip();
    onEquipItem(item.id);
  };

  const handleCraft = (e: React.MouseEvent, item: WardrobeItem) => {
    e.stopPropagation();
    soundManager.playTap();
    if (user.points < 50) {
      alert('文化积分不足，请先通关或AR扫描获取积分！');
      return;
    }
    onCraftFragment(item.id);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f0f4f8] max-w-md mx-auto min-h-screen select-none">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
        <button
          id="wardrobe-back-btn"
          onClick={() => {
            soundManager.playTap();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回村落</span>
        </button>

        <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-800">
          ★ 等级{user.level} | {user.points} 积分
        </span>
      </div>

      {/* 3D Podium Mascot Showcase Stage (Image 1) */}
      <div className="relative py-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-100/60 to-slate-200/40">
        {/* Stage Tag */}
        <div className="absolute top-3 left-4 flex items-center gap-1 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-bold text-teal-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>IP衣橱 · 换装展示</span>
        </div>

        {/* Character on Podium */}
        <div className="relative flex flex-col items-center">
          <SheAvatar equippedItems={items} size="hero" showSpiritPhoenix={false} isDancing={false} />

          {/* Pedestal Stand Oval Shadow (Image 1) */}
          <div className="w-48 h-6 bg-slate-300/60 rounded-full filter blur-[1px] -mt-2 border border-slate-400/30 flex items-center justify-center">
            <div className="w-40 h-3 bg-slate-400/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Bottom Sheet Drawer with Items (Image 1) */}
      <div className="flex-1 bg-white rounded-t-3xl shadow-xl p-4 flex flex-col border-t border-slate-200/60">
        {/* Drawer Pull Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

        {/* 4 Category Tabs (Image 1) */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`wardrobe-tab-${cat.id}`}
                onClick={() => {
                  soundManager.playTap();
                  setActiveCategory(cat.id);
                }}
                className={`flex flex-col items-center py-2 relative transition-all active:scale-95 ${
                  isActive ? 'text-red-700 font-black' : 'text-slate-500 hover:text-slate-800 font-bold'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-1 transition-all ${
                    isActive ? 'bg-rose-50 text-red-600 shadow-2xs' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs">{cat.label}</span>
                {isActive && <div className="w-8 h-1 bg-red-600 rounded-full mt-1.5" />}
              </button>
            );
          })}
        </div>

        {/* Dashed Separator */}
        <div className="w-full border-b border-dashed border-slate-200 mb-4" />

        {/* Section Header: 凤凰盛装 & 解锁进度 */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-black text-slate-900 font-serif tracking-tight">凤凰盛装</h3>
          <span className="text-xs font-bold text-slate-500">解锁进度: {unlockPercent}%</span>
        </div>

        {/* Item Cards Grid (Image 1) */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-72 pb-6">
          {filteredItems.map((item) => {
            const isFull = item.fragments >= item.totalFragments;

            return (
              <div
                key={item.id}
                id={`wardrobe-item-${item.id}`}
                onClick={() => handleEquip(item)}
                className={`rounded-2xl p-3 flex flex-col border transition-all cursor-pointer relative active:scale-[0.98] ${
                  item.isEquipped
                    ? 'border-red-500 bg-rose-50/30 ring-2 ring-red-200'
                    : item.isLocked
                    ? 'border-slate-200 bg-slate-50/80 opacity-75'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Equipped Badge (Image 1) */}
                {item.isEquipped && (
                  <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                    已穿戴
                  </span>
                )}

                {/* Item Thumbnail */}
                <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100/80 flex items-center justify-center relative mb-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {item.isLocked && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Item Title */}
                <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>

                {/* Progress Bar & Fragment Count (Image 1) */}
                <div className="mt-2">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.isEquipped ? 'bg-red-600' : 'bg-teal-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (item.fragments / item.totalFragments) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.fragments}/{item.totalFragments} 碎片
                    </span>
                    {!isFull && (
                      <button
                        onClick={(e) => handleCraft(e, item)}
                        className="text-[10px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-0.5 bg-teal-50 px-1.5 py-0.5 rounded-md"
                        title="花费50积分兑换碎片"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>兑换</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
