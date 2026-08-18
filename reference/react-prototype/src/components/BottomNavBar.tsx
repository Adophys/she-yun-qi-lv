import React from 'react';
import { TabType } from '../types';
import { MapPin, Compass, Scan, LayoutGrid, User } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'village' as TabType, label: '村落', icon: MapPin },
    { id: 'explore' as TabType, label: '探索', icon: Compass },
    { id: 'scan' as TabType, label: '扫描', isCenter: true },
    { id: 'collection' as TabType, label: '收藏', icon: LayoutGrid },
    { id: 'mine' as TabType, label: '我的', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
      <div className="flex items-center justify-around relative">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;

          if (t.isCenter) {
            return (
              <div key={t.id} className="relative -top-5 flex flex-col items-center">
                <button
                  id="nav-scan-center-btn"
                  onClick={() => {
                    soundManager.playTap();
                    onTabChange('scan');
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#991b1b] to-[#dc2626] text-white ring-4 ring-red-100 shadow-red-500/30'
                      : 'bg-gradient-to-tr from-[#1e293b] to-[#334155] text-white ring-4 ring-slate-100 hover:from-[#0f172a] hover:to-[#1e293b]'
                  }`}
                  aria-label="扫描"
                >
                  <Scan className="w-7 h-7 stroke-[2.2]" />
                </button>
                <span className={`text-[11px] font-bold mt-1 ${isActive ? 'text-red-700' : 'text-slate-600'}`}>
                  扫描
                </span>
              </div>
            );
          }

          const IconComponent = t.icon!;

          return (
            <button
              key={t.id}
              id={`nav-tab-${t.id}`}
              onClick={() => {
                soundManager.playTap();
                onTabChange(t.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-red-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-600 rounded-full" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
