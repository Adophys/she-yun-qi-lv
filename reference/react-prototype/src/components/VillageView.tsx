import React, { useState } from 'react';
import { UserProfile, WardrobeItem } from '../types';
import { SheAvatar } from './SheAvatar';
import { Compass, Sparkles, BookOpen, CheckCircle2, ChevronRight, MoreHorizontal, Shirt } from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface VillageViewProps {
  user: UserProfile;
  equippedItems: WardrobeItem[];
  onContinueJourney: () => void;
  onOpenWardrobe: () => void;
  onOpenScan: () => void;
  onOpenDetail: (itemId: string) => void;
  onUpdatePoints: (pointsDelta: number) => void;
}

export const VillageView: React.FC<VillageViewProps> = ({
  user,
  equippedItems,
  onContinueJourney,
  onOpenWardrobe,
  onOpenScan,
  onOpenDetail,
  onUpdatePoints,
}) => {
  const [dailyTaskCompleted, setDailyTaskCompleted] = useState(false);
  const [mascotBubble, setMascotBubble] = useState('今天要去哪里探索呀？');

  const mascotPhrases = [
    '今天要去哪里探索呀？',
    '听！那是梯田间传来的山哈调～',
    '凤冠的每一缕银丝，都藏着畲乡的记忆呢！',
    '去大均古村走走吧，那里有刚蒸好的乌米饭！',
    '快去收集彩带碎片，给阿喵换新装吧！',
  ];

  const handleMascotClick = () => {
    soundManager.playTap();
    const nextPhrase = mascotPhrases[Math.floor(Math.random() * mascotPhrases.length)];
    setMascotBubble(nextPhrase);
  };

  const handleCompleteDailyTask = () => {
    if (dailyTaskCompleted) return;
    soundManager.playVictory();
    setDailyTaskCompleted(true);
    onUpdatePoints(50);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 select-none">
      {/* Top mascot dialog bubble */}
      <div className="flex justify-center mb-1">
        <button
          id="mascot-dialog-bubble"
          onClick={handleMascotClick}
          className="relative px-5 py-2 bg-white/95 border-2 border-teal-600/80 rounded-full shadow-sm text-slate-800 text-sm font-bold tracking-tight active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
          <span>{mascotBubble}</span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-teal-600/80 transform rotate-45" />
        </button>
      </div>

      {/* Hero Character Stage */}
      <div
        id="village-mascot-stage"
        onClick={handleMascotClick}
        className="relative my-2 py-4 flex flex-col items-center justify-center cursor-pointer group"
      >
        {/* Wardrobe Quick Trigger Button */}
        <button
          id="village-wardrobe-badge-btn"
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playTap();
            onOpenWardrobe();
          }}
          className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-slate-200 hover:border-red-400 rounded-full text-xs font-bold text-slate-700 shadow-sm active:scale-95 transition-all"
        >
          <Shirt className="w-3.5 h-3.5 text-teal-600" />
          <span>IP衣橱</span>
        </button>

        {/* Character Illustration / Avatar */}
        <SheAvatar
          equippedItems={equippedItems}
          size="hero"
          showSpiritPhoenix={true}
          isDancing={true}
        />
      </div>

      {/* Main Action Button: 继续奇旅 */}
      <div className="my-3">
        <button
          id="btn-continue-journey"
          onClick={() => {
            soundManager.playTap();
            onContinueJourney();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-[#0c1c38] hover:bg-[#071329] text-white font-bold text-base shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group border border-slate-700/40"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Compass className="w-5 h-5 text-cyan-300 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <span className="tracking-widest text-lg font-serif">继续奇旅</span>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 2-Column Dashboard Cards: 每日任务 & 第一章进度 */}
      <div className="grid grid-cols-2 gap-3 my-3">
        {/* Daily Quest Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>每日任务</span>
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">探索古村落</h3>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span
              className={`text-xs font-bold ${
                dailyTaskCompleted ? 'text-emerald-600 flex items-center gap-1' : 'text-red-500'
              }`}
            >
              {dailyTaskCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已完成 (+50)
                </>
              ) : (
                '未完成'
              )}
            </span>
            <button
              id="daily-task-action-btn"
              onClick={handleCompleteDailyTask}
              disabled={dailyTaskCompleted}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                dailyTaskCompleted
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chapter Progress Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-full -mr-6 -mt-6 pointer-events-none" />
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-red-500" />
              <span>第一章进度</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800">4</span>
              <span className="text-sm font-bold text-slate-400">/10</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-red-600 h-full rounded-full transition-all duration-500 w-[40%]" />
            </div>
          </div>
        </div>
      </div>

      {/* New Discovery Card (Image 23) */}
      <div
        id="card-new-discovery"
        onClick={() => {
          soundManager.playTap();
          onOpenDetail('c-9');
        }}
        className="mt-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-center gap-3 active:scale-[0.99]"
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1630019852942-f89202989a59?w=300&auto=format&fit=crop&q=80"
            alt="凤凰银饰图谱"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
              新发现
            </span>
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mt-1 truncate">凤凰银饰图谱</h4>
          <p className="text-xs text-slate-500 mt-0.5 truncate">在老屋前触发AR扫描解锁</p>
        </div>
      </div>
    </div>
  );
};
