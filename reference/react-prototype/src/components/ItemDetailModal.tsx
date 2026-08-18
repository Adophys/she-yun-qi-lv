import React, { useState } from 'react';
import { CulturalItem } from '../types';
import { ChevronLeft, Heart, MapPin, Gem, Flame, Share2, Check, Download } from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ItemDetailModalProps {
  item: CulturalItem;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onToggleFavorite }) => {
  const [isSaved, setIsSaved] = useState(true);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleSaveToArchive = () => {
    soundManager.playTap();
    setIsSaved(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  const handleShare = () => {
    soundManager.playTap();
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-md max-w-md mx-auto overflow-y-auto select-none">
      {/* Top Floating Nav Buttons (Image 5) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <button
          id="detail-close-btn"
          onClick={() => {
            soundManager.playTap();
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-800 hover:bg-white active:scale-95 transition-all"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          id="detail-fav-btn"
          onClick={() => {
            soundManager.playTap();
            onToggleFavorite(item.id);
          }}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-800 hover:bg-white active:scale-95 transition-all"
        >
          <Heart
            className={`w-5 h-5 ${item.isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-700'}`}
          />
        </button>
      </div>

      {/* Hero Artifact Photo Display */}
      <div className="relative w-full h-80 bg-slate-950 flex items-center justify-center overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover opacity-95"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
      </div>

      {/* Main Info Bottom Sheet Card (Image 5) */}
      <div className="-mt-8 relative z-10 flex-1 bg-white rounded-t-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header Row: Name, Subtitle & Rarity Tag */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif">
                {item.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5">
                {item.pinyin}
              </p>
            </div>

            <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-red-600 rounded-full text-xs font-bold flex items-center gap-1 shadow-2xs">
              <span>★</span>
              <span>{item.rarity}</span>
            </span>
          </div>

          {/* Section: 文化内涵 (Cultural Meaning) */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-4 bg-red-700 rounded-full" />
              <h3 className="text-sm font-black text-slate-900 tracking-tight">文化内涵</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed tracking-normal text-justify">
              {item.description}
            </p>
          </div>

          {/* 3 Metric Grid Cards: 发源地, 材质, 象征意义 */}
          <div className="grid grid-cols-3 gap-2.5 my-6">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700 mb-1.5">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">发源地</span>
              <span className="text-xs font-black text-slate-800 mt-0.5">{item.origin}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700 mb-1.5">
                <Gem className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">材质</span>
              <span className="text-xs font-black text-slate-800 mt-0.5 truncate max-w-full">
                {item.material}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-red-600 mb-1.5">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">象征意义</span>
              <span className="text-xs font-black text-red-700 mt-0.5">{item.symbolism}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Image 5) */}
        <div className="space-y-2.5 pt-2">
          <button
            id="btn-detail-save-archive"
            onClick={handleSaveToArchive}
            className="w-full py-3.5 rounded-2xl bg-[#0c1c38] hover:bg-[#071329] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-slate-700/50"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>已收入图鉴</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-300" />
                <span>收入图鉴</span>
              </>
            )}
          </button>

          <button
            id="btn-detail-share"
            onClick={handleShare}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-900 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4 text-slate-800" />
            <span>分享旅程</span>
          </button>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-1.5 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-300/60" />
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 z-50 animate-bounce">
          <Share2 className="w-4 h-4 text-teal-400" />
          <span>已生成分享图并复制文化卡链接！</span>
        </div>
      )}
    </div>
  );
};
