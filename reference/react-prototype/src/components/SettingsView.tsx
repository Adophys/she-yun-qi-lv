import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsViewProps {
  user: UserProfile;
  onBack: () => void;
  onLogout: () => void;
  onUpdateSettings: (updated: Partial<UserProfile>) => void;
  onOpenTerms: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onBack,
  onLogout,
  onUpdateSettings,
  onOpenTerms,
}) => {
  const [soundOn, setSoundOn] = useState(user.soundEnabled);
  const [notifyOn, setNotifyOn] = useState(user.notificationsEnabled);
  const [cacheSize, setCacheSize] = useState(user.cacheSizeMB);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundManager.setEnabled(next);
    if (next) soundManager.playTap();
    onUpdateSettings({ soundEnabled: next });
  };

  const handleToggleNotify = () => {
    soundManager.playTap();
    const next = !notifyOn;
    setNotifyOn(next);
    onUpdateSettings({ notificationsEnabled: next });
  };

  const handleClearCache = () => {
    soundManager.playTap();
    setCacheSize(0);
    onUpdateSettings({ cacheSizeMB: 0 });
    setShowToast('已成功清理缓存 128 MB！');
    setTimeout(() => setShowToast(null), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fdfaf7] max-w-md mx-auto min-h-screen select-none">
      {/* Top Bar (Image 21) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
        <button
          id="settings-back-btn"
          onClick={() => {
            soundManager.playTap();
            onBack();
          }}
          className="p-1.5 text-slate-800 hover:bg-slate-100 rounded-full active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <h2 className="text-base font-black text-red-700 font-serif tracking-wide">设置</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Section 1: 账号与安全 (Image 21) */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-2 px-1">账号与安全</h3>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100">
            <button
              id="settings-change-password"
              onClick={() => {
                soundManager.playTap();
                setShowToast('已发送修改密码短信至绑定手机！');
                setTimeout(() => setShowToast(null), 2500);
              }}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-bold text-slate-800">修改密码</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <div className="w-full flex items-center justify-between p-4 text-left">
              <span className="text-sm font-bold text-slate-800">绑定的手机号</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono text-slate-500">{user.phone}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              id="settings-delete-account"
              onClick={() => {
                soundManager.playTap();
                if (confirm('注销账号将清除所有收集进度，确定继续吗？')) {
                  onLogout();
                }
              }}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-bold text-slate-800">注销账号</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Section 2: 游戏设置 (Image 21) */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-2 px-1">游戏设置</h3>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-bold text-slate-800">声音效果</span>
              <button
                id="toggle-sound-btn"
                onClick={handleToggleSound}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  soundOn ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    soundOn ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-bold text-slate-800">消息通知</span>
              <button
                id="toggle-notify-btn"
                onClick={handleToggleNotify}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  notifyOn ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    notifyOn ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: 通用 (Image 21) */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-2 px-1">通用</h3>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100">
            <button
              id="btn-clear-cache"
              onClick={handleClearCache}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-bold text-slate-800">清理缓存</span>
              <span className="text-xs font-mono text-slate-500">{cacheSize} MB</span>
            </button>

            <button
              id="btn-about-us"
              onClick={() => {
                soundManager.playTap();
                onOpenTerms();
              }}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-bold text-slate-800">关于我们</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Action: 退出登录 (Image 21) */}
        <div className="pt-6">
          <button
            id="btn-logout"
            onClick={() => {
              soundManager.playTap();
              onLogout();
            }}
            className="w-full py-3.5 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 text-red-600 font-bold text-sm shadow-2xs active:scale-[0.98] transition-all"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 z-50">
          <Check className="w-4 h-4 text-teal-400" />
          <span>{showToast}</span>
        </div>
      )}
    </div>
  );
};
