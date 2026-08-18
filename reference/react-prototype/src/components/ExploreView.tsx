import React from 'react';
import { ExploreNode, UserProfile } from '../types';
import { Check, Lock, Play, Star, MapPin } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { motion } from 'motion/react';

interface ExploreViewProps {
  user: UserProfile;
  nodes: ExploreNode[];
  onStartChallenge: (node: ExploreNode) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ user, nodes, onStartChallenge }) => {
  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 select-none">
      {/* Top Header Progress Banner (Image 9) */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between px-4 py-2 bg-teal-50 border border-teal-200/80 rounded-full shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-teal-700 font-bold text-xs">🚩 节点</span>
            <div className="w-28 sm:w-36 bg-teal-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all"
                style={{ width: `${(user.completedStages / user.totalStages) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800">
            {user.completedStages}/{user.totalStages}
          </span>
        </div>

        {/* Floating Chapter Location Pill */}
        <div className="flex justify-center -mt-2.5">
          <div className="px-5 py-1 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span className="text-teal-600">⛰️</span>
            <span>绿野梯田 · 村落</span>
          </div>
        </div>
      </div>

      {/* Winding Map Path */}
      <div className="relative max-w-sm mx-auto min-h-[500px] flex flex-col items-center py-4">
        {/* Subtle winding SVG road background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-200/80 fill-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 280 60 Q 120 120 80 180 T 200 320 T 100 460"
            strokeWidth="8"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        </svg>

        {/* Nodes mapped along the winding path */}
        <div className="w-full relative flex flex-col space-y-12">
          {nodes.map((node, index) => {
            const isCompleted = node.status === 'completed';
            const isActive = node.status === 'active';
            const isLocked = node.status === 'locked';

            // Positioning alternating left and right for organic journey feel
            const alignClass =
              index % 3 === 0
                ? 'self-end mr-8'
                : index % 3 === 1
                ? 'self-start ml-6'
                : 'self-center';

            return (
              <div key={node.id} className={`relative flex flex-col items-center ${alignClass}`}>
                {/* Node Button and Indicator */}
                {isCompleted && (
                  <div className="flex flex-col items-center">
                    <button
                      id={`explore-node-${node.id}`}
                      onClick={() => {
                        soundManager.playTap();
                        onStartChallenge(node);
                      }}
                      className="w-14 h-14 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    >
                      <Check className="w-7 h-7 stroke-[3]" />
                    </button>
                    {/* Star Rating below */}
                    <div className="flex gap-1 mt-1.5 text-red-500">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx <= node.stars
                              ? 'fill-red-500 text-red-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isActive && (
                  <div className="flex flex-col items-center relative">
                    {/* Thumbnail preview tag */}
                    <div className="relative mb-2 flex items-center">
                      <div className="w-24 h-14 rounded-lg overflow-hidden border-2 border-white shadow-md bg-amber-50">
                        <img
                          src={node.previewImg}
                          alt={node.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Glowing Active Ring & Action Button */}
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative p-3 rounded-full bg-rose-100/70"
                    >
                      <button
                        id={`explore-active-node-${node.id}`}
                        onClick={() => {
                          soundManager.playTap();
                          onStartChallenge(node);
                        }}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#991b1b] to-[#dc2626] text-white flex flex-col items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-all group"
                      >
                        <Play className="w-7 h-7 fill-white text-white ml-0.5" />
                        <span className="text-[9px] font-bold mt-0.5 tracking-tight">当前探索</span>
                      </button>
                    </motion.div>

                    {/* Active Node Floating Banner */}
                    <div className="mt-2 px-4 py-1.5 bg-white/95 border border-slate-200 rounded-full shadow-md flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <span className="text-teal-600">🖌️</span>
                      <span>{node.name}</span>
                    </div>
                  </div>
                )}

                {isLocked && (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-400 flex items-center justify-center shadow-xs">
                      <Lock className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 mt-1">未解锁</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
