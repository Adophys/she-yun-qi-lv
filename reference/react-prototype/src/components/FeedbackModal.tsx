import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface FeedbackModalProps {
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    soundManager.playTap();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={() => {
            soundManager.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-black text-slate-900 font-serif tracking-tight mb-2">
          帮助与反馈
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          无论是文化知识建议、AR扫描问题还是功能期待，我们都非常期待您的声音。
        </p>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">感谢您的反馈！</h4>
            <p className="text-xs text-slate-500 mt-1">我们将持续优化畲乡文化奇旅体验。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              rows={4}
              placeholder="请输入您的问题或建议..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className="w-full py-3 rounded-2xl bg-[#0c1c38] hover:bg-[#071329] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>提交反馈</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
