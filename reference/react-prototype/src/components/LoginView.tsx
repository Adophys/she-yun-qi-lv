import React, { useState } from 'react';
import { MessageSquare, Smartphone, Check, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onOpenTerms: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onOpenTerms }) => {
  const [agreed, setAgreed] = useState(true);
  const [phone, setPhone] = useState('13888888888');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = () => {
    if (!agreed) {
      alert('请先阅读并勾选服务协议与隐私政策！');
      return;
    }
    soundManager.playTap();
    onLoginSuccess();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] max-w-md mx-auto min-h-screen select-none relative overflow-hidden">
      {/* Background Phoenix Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-500/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Top Brand Logo Emblem & Titles (Image 17) */}
      <div className="flex flex-col items-center pt-8 relative z-10">
        {/* Emblem circular badge */}
        <div className="w-24 h-24 rounded-full bg-white p-2 border-4 border-amber-200/80 shadow-xl flex items-center justify-center mb-4">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 flex items-center justify-center text-white shadow-inner">
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
              <path
                d="M50 20 C35 10 15 25 20 45 C25 65 50 85 50 85 C50 85 75 65 80 45 C85 25 65 10 50 20 Z"
                fill="#fde047"
              />
              <path d="M50 20 L50 85" stroke="#991b1b" strokeWidth="3" />
              <circle cx="50" cy="35" r="5" fill="#fff" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-black text-[#0f172a] font-serif tracking-tight">畲韵奇旅</h1>
        <p className="text-sm font-medium text-slate-500 tracking-wider mt-1.5">
          探索数字民族之美
        </p>

        {/* Inputs */}
        <div className="w-full space-y-3 mt-8">
          <input
            type="text"
            placeholder="手机号/邮箱"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3.5 bg-white/90 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-2xs"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-white/90 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-2xs"
          />
          <button
            id="btn-form-login"
            onClick={handleLogin}
            className="w-full py-3.5 bg-slate-300/80 hover:bg-slate-400 text-slate-700 font-bold text-sm rounded-2xl shadow-2xs active:scale-[0.98] transition-all"
          >
            登录
          </button>
        </div>
      </div>

      {/* Fast Login Buttons & Agreements (Image 17) */}
      <div className="space-y-3.5 pb-4 relative z-10">
        {/* WeChat Login */}
        <button
          id="btn-login-wechat"
          onClick={handleLogin}
          className="w-full py-4 rounded-2xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
        >
          <MessageSquare className="w-5 h-5 fill-white text-teal-600" />
          <span>微信一键登录</span>
        </button>

        {/* Phone Login */}
        <button
          id="btn-login-phone"
          onClick={handleLogin}
          className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-2xs flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
        >
          <Smartphone className="w-5 h-5 text-slate-700" />
          <span>手机号登录/注册</span>
        </button>

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-2 pt-2 px-1">
          <button
            id="checkbox-agreement"
            onClick={() => setAgreed(!agreed)}
            className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center transition-colors ${
              agreed ? 'bg-red-600 border-red-600 text-white' : 'border-slate-400 bg-white'
            }`}
          >
            {agreed && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          <p className="text-[11px] text-slate-500 leading-snug">
            我已阅读并同意
            <button
              onClick={onOpenTerms}
              className="text-red-700 font-bold hover:underline mx-0.5"
            >
              《服务协议》
            </button>
            与
            <button
              onClick={onOpenTerms}
              className="text-red-700 font-bold hover:underline mx-0.5"
            >
              《隐私政策》
            </button>
            ，未注册绑定的手机号验证后将自动创建账号。
          </p>
        </div>
      </div>
    </div>
  );
};
