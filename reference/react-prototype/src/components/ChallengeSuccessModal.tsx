import React, { useEffect } from 'react';
import { Star, BookOpen, ChevronRight, Gem, Award, ChevronLeft } from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';

interface ChallengeSuccessModalProps {
  onClose: () => void;
  onViewKnowledge: () => void;
  onNextLevel: () => void;
}

export const ChallengeSuccessModal: React.FC<ChallengeSuccessModalProps> = ({
  onClose,
  onViewKnowledge,
  onNextLevel,
}) => {
  useEffect(() => {
    soundManager.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.4 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fdfaf7] max-w-md mx-auto select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/40">
        <button
          id="success-back-btn"
          onClick={() => {
            soundManager.playTap();
            onClose();
          }}
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-full active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <h2 className="text-base font-black text-red-700 font-serif tracking-wide">畲韵奇旅</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-between px-5 py-6">
        <div className="w-full flex flex-col items-center">
          {/* Main Victory Title & English Subtitle (Image 7) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center mt-2 mb-4"
          >
            <h1 className="text-3xl font-black text-red-700 font-serif tracking-wide">闯关成功</h1>
            <span className="text-xs text-slate-500 font-medium tracking-wide mt-1">
              Challenge Successful
            </span>
          </motion.div>

          {/* 3 Animated Stars (Image 7) */}
          <div className="flex items-center gap-3 my-3">
            {[1, 2, 3].map((starIndex) => (
              <motion.div
                key={starIndex}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + starIndex * 0.15, type: 'spring' }}
              >
                <Star
                  className={`w-10 h-10 ${
                    starIndex === 2 ? 'w-12 h-12 fill-red-600 text-red-600' : 'fill-red-500 text-red-500'
                  } drop-shadow-md`}
                />
              </motion.div>
            ))}
          </div>

          {/* Rewards Card Container (Image 7) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-white rounded-3xl p-4 shadow-md border border-slate-100 mt-4 space-y-3"
          >
            {/* Header: 获得奖励 */}
            <div className="flex items-center gap-2 text-xs font-bold text-red-700">
              <Award className="w-4 h-4 text-red-600" />
              <span>获得奖励</span>
            </div>

            {/* Reward item 1: 文化积分 +100 */}
            <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Gem className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">文化积分</h4>
                  <span className="text-[10px] text-slate-400 font-medium">Culture Points</span>
                </div>
              </div>
              <span className="text-base font-black text-teal-600 font-mono">+100</span>
            </div>

            {/* Reward item 2: 凤凰装碎片 */}
            <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-100 border border-amber-200 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80"
                    alt="凤凰装碎片"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">凤凰装碎片</h4>
                  <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-red-600 h-full w-[40%] rounded-full" />
                  </div>
                </div>
              </div>
              <span className="text-xs font-black text-red-600 font-mono">2/10</span>
            </div>

            {/* Reward item 3: 解锁档案 (Image 7) */}
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 mb-2">
                解锁档案 (Unlocked Archive)
              </h4>
              <div className="w-full h-16 rounded-xl bg-slate-300 relative overflow-hidden flex items-end p-2.5">
                <img
                  src="https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&auto=format&fit=crop&q=80"
                  alt="畲族银饰锻造技艺"
                  className="absolute inset-0 w-full h-full object-cover opacity-75"
                  referrerPolicy="no-referrer"
                />
                <span className="relative z-10 text-xs font-bold text-white drop-shadow-md">
                  畲族银饰锻造技艺
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mascot Celebration Thumbnail (Image 7) */}
        <div className="my-4 w-40 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80"
            alt="Mascot Celebration"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Action Buttons (Image 7) */}
        <div className="w-full flex gap-3">
          <button
            id="btn-success-read-knowledge"
            onClick={() => {
              soundManager.playTap();
              onViewKnowledge();
            }}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>查看知识</span>
          </button>

          <button
            id="btn-success-next-level"
            onClick={() => {
              soundManager.playTap();
              onNextLevel();
            }}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#0c1c38] hover:bg-[#071329] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/20 active:scale-95 transition-all border border-slate-700/50"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          >
            <span>下一关</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
