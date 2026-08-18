import React from 'react';
import { AchievementBadge, UserProfile } from '../types';
import { Shield, BookOpen, Shirt, Settings, HelpCircle, Info, ChevronRight, Award, Compass, Eye } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ProfileViewProps {
  user: UserProfile;
  badges: AchievementBadge[];
  onOpenWardrobe: () => void;
  onOpenCollection: () => void;
  onOpenSettings: () => void;
  onOpenTerms: () => void;
  onOpenFeedback: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  badges,
  onOpenWardrobe,
  onOpenCollection,
  onOpenSettings,
  onOpenTerms,
  onOpenFeedback,
}) => {
  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 select-none">
      {/* User Header Profile Card (Image 15) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Soft background shape */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50/60 rounded-full -mr-10 -mt-10 pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Avatar with red ring */}
          <div className="w-18 h-18 rounded-full border-2 border-red-600 p-0.5 overflow-hidden bg-amber-50 shadow-sm shrink-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-serif">
              {user.name}
            </h2>
            <div className="mt-1 flex items-center gap-1 px-3 py-0.5 bg-rose-50 border border-rose-200 text-red-700 rounded-full text-xs font-bold w-fit">
              <Shield className="w-3.5 h-3.5" />
              <span>
                等级{user.level} {user.title}
              </span>
            </div>
          </div>
        </div>

        {/* Dashed line */}
        <div className="w-full border-b border-dashed border-slate-200 my-4" />

        {/* 3 Metric Columns: 通关数, 图鉴, AR发现 (Image 15) */}
        <div className="grid grid-cols-3 text-center">
          <div className="flex flex-col">
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl font-black text-red-600 font-mono">
                {user.completedStages}
              </span>
              <span className="text-xs text-slate-400 font-bold">/{user.totalStages}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-0.5">通关数</span>
          </div>

          <div className="flex flex-col border-x border-slate-100">
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-xl font-black text-red-600 font-mono">
                {user.collectedCards}
              </span>
              <span className="text-xs text-slate-400 font-bold">/{user.totalCards}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-0.5">图鉴</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-black text-red-600 font-mono">{user.arDiscovered}</span>
            <span className="text-xs text-slate-500 font-medium mt-0.5">AR发现</span>
          </div>
        </div>
      </div>

      {/* Achievement Badges Wall (成就勋章墙) (Image 15) */}
      <div className="mt-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-black text-slate-900 tracking-tight font-serif">
            成就勋章墙
          </h3>
        </div>

        {/* 2x3 Grid of Badges */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-2">
          {badges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center text-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  badge.isUnlocked
                    ? 'border-2 border-red-500 bg-red-50/50 shadow-xs'
                    : 'border-2 border-dashed border-slate-300 bg-slate-50'
                }`}
              >
                {badge.isUnlocked ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                    <span className="text-xl">🎖️</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400">???</span>
                )}
              </div>
              <span
                className={`text-[11px] font-bold mt-1.5 truncate max-w-full ${
                  badge.isUnlocked ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2 Quick Cards: 我的收藏 & 我的衣橱 (Image 15) */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          id="profile-quick-collection-btn"
          onClick={() => {
            soundManager.playTap();
            onOpenCollection();
          }}
          className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs hover:border-slate-300 flex flex-col items-center text-center active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tight">我的收藏</span>
        </button>

        <button
          id="profile-quick-wardrobe-btn"
          onClick={() => {
            soundManager.playTap();
            onOpenWardrobe();
          }}
          className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs hover:border-slate-300 flex flex-col items-center text-center active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 shadow-2xs">
            <Shirt className="w-6 h-6" />
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tight">我的衣橱</span>
        </button>
      </div>

      {/* Menu List Settings & Help (Image 15) */}
      <div className="mt-4 bg-white rounded-3xl p-2 border border-slate-100 shadow-sm divide-y divide-slate-100">
        <button
          id="profile-menu-settings"
          onClick={() => {
            soundManager.playTap();
            onOpenSettings();
          }}
          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 rounded-2xl transition-colors active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">设置</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          id="profile-menu-feedback"
          onClick={() => {
            soundManager.playTap();
            onOpenFeedback();
          }}
          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 rounded-2xl transition-colors active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">帮助与反馈</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          id="profile-menu-about"
          onClick={() => {
            soundManager.playTap();
            onOpenTerms();
          }}
          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 rounded-2xl transition-colors active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">关于畲韵奇旅</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
