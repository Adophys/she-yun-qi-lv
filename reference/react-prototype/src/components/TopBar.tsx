import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, Zap, ChevronLeft } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TopBarProps {
  user: UserProfile;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onAvatarClick?: () => void;
  onPointsClick?: () => void;
  rightBadgeType?: 'points' | 'levelPoints' | 'none';
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  title = '畲韵奇旅',
  showBack = false,
  onBack,
  onAvatarClick,
  onPointsClick,
  rightBadgeType = 'levelPoints',
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-200/50 select-none">
      <div className="flex items-center gap-2.5">
        {showBack ? (
          <button
            id="top-back-btn"
            onClick={() => {
              soundManager.playTap();
              onBack?.();
            }}
            className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-200/60 rounded-full transition-colors active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        ) : (
          <div
            id="top-avatar-btn"
            onClick={() => {
              soundManager.playTap();
              onAvatarClick?.();
            }}
            className="relative cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full border-2 border-red-500/80 overflow-hidden bg-amber-50 shadow-sm flex items-center justify-center p-0.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-black px-1 py-0.2 rounded-full border border-white shadow-xs">
              Lv.{user.level}
            </span>
          </div>
        )}

        <div className="flex flex-col">
          <h1 className="text-lg font-black tracking-tight text-[#0f172a] font-serif flex items-center gap-1.5">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightBadgeType === 'levelPoints' && (
          <button
            id="top-level-points-badge"
            onClick={() => {
              soundManager.playTap();
              onPointsClick?.();
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/90 border border-slate-200 hover:bg-slate-200/60 text-slate-800 rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
              ★
            </div>
            <span>
              等级{user.level} | {user.points} 积分
            </span>
          </button>
        )}

        {rightBadgeType === 'points' && (
          <button
            id="top-energy-points-badge"
            onClick={() => {
              soundManager.playTap();
              onPointsClick?.();
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/90 border border-slate-200 hover:bg-slate-200/60 text-slate-800 rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="font-mono text-xs font-black">{user.points}</span>
          </button>
        )}
      </div>
    </header>
  );
};
