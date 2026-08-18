import React, { useState } from 'react';
import { ExploreNode, PuzzlePiece } from '../types';
import { X, Lightbulb, Sparkles, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { motion } from 'motion/react';

interface PuzzleGameViewProps {
  node: ExploreNode;
  onClose: () => void;
  onSuccess: () => void;
}

export const PuzzleGameView: React.FC<PuzzleGameViewProps> = ({ node, onClose, onSuccess }) => {
  // Initial puzzle pieces (3 are missing from the 9-grid puzzle)
  const [pieces, setPieces] = useState<PuzzlePiece[]>([
    {
      id: 1,
      symbol: '🍃',
      iconType: 'leaf',
      targetIndex: 0,
      currentIndex: null,
      color: '#0d9488',
      bgColor: '#ccfbf1',
    },
    {
      id: 2,
      symbol: '🔥',
      iconType: 'fire',
      targetIndex: 1,
      currentIndex: null,
      color: '#dc2626',
      bgColor: '#fee2e2',
    },
    {
      id: 3,
      symbol: '⭐',
      iconType: 'star',
      targetIndex: 5,
      currentIndex: null,
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      id: 4,
      symbol: '💎',
      iconType: 'diamond',
      targetIndex: 8,
      currentIndex: null,
      color: '#4f46e5',
      bgColor: '#e0e7ff',
    },
  ]);

  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [hintActive, setHintActive] = useState(false);
  const [speech, setSpeech] = useState('太棒了！就快完成了！');

  // Count placed pieces (starting at 7/10 as in screenshot Image 13)
  const placedCount = pieces.filter((p) => p.currentIndex !== null).length;
  const currentProgress = 7 + placedCount; // Max 10 (when 3 pieces placed)

  const handleSelectPiece = (pieceId: number) => {
    soundManager.playTap();
    setSelectedPieceId(selectedPieceId === pieceId ? null : pieceId);
  };

  const handleSlotClick = (slotIndex: number) => {
    if (selectedPieceId === null) {
      soundManager.playTap();
      return;
    }

    const piece = pieces.find((p) => p.id === selectedPieceId);
    if (!piece) return;

    if (piece.targetIndex === slotIndex) {
      // Correct placement!
      soundManager.playSnap();
      const updatedPieces = pieces.map((p) =>
        p.id === selectedPieceId ? { ...p, currentIndex: slotIndex } : p
      );
      setPieces(updatedPieces);
      setSelectedPieceId(null);
      setSpeech('太厉害了！这块绣纹完美吻合！');

      // Check if all pieces placed
      const allPlaced = updatedPieces.filter((p) => p.currentIndex !== null).length >= 3;
      if (allPlaced) {
        setTimeout(() => {
          onSuccess();
        }, 600);
      }
    } else {
      // Wrong slot
      soundManager.playTap();
      setSpeech('这里的纹样好像不太对哦，换一个位置试试？');
    }
  };

  const handleHint = () => {
    soundManager.playTap();
    setHintActive(true);
    setSpeech('观察右上角的凤凰刺绣图样，寻找对称的几何绣纹吧！');
    setTimeout(() => setHintActive(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f0f4f8] max-w-md mx-auto select-none overflow-y-auto">
      {/* Top Header Bar (Image 13) */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <button
          id="puzzle-close-btn"
          onClick={() => {
            soundManager.playTap();
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar (Image 13) */}
        <div className="flex-1 mx-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
            <span>拼图进度</span>
            <span className="font-mono text-red-600 font-black">{currentProgress} / 10</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentProgress / 10) * 100}%` }}
            />
          </div>
        </div>

        <button
          id="puzzle-hint-btn"
          onClick={handleHint}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            hintActive
              ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-200'
              : 'bg-[#0f172a] text-white hover:bg-slate-800'
          }`}
          title="提示"
        >
          <Lightbulb className="w-5 h-5" />
        </button>
      </div>

      {/* Mascot Speech Bubble & Thumbnail Target (Image 13) */}
      <div className="px-4 py-3 flex flex-col items-end">
        <div className="bg-white px-4 py-2 rounded-2xl rounded-tr-xs border border-slate-200 shadow-sm text-xs font-bold text-slate-800 max-w-[220px] text-right">
          {speech}
        </div>
        {/* Reference Thumbnail */}
        <div className="w-20 h-10 rounded-lg overflow-hidden border-2 border-white shadow-md bg-amber-50 mt-2">
          <img
            src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80"
            alt="Reference Target"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Main Puzzle Board (Image 13) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 my-2">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-white rounded-3xl p-3 shadow-xl border-4 border-slate-200/80 flex items-center justify-center">
          {/* Subtle Phoenix Embroidery Vector Backdrop */}
          <div className="absolute inset-4 rounded-2xl overflow-hidden opacity-90">
            <svg viewBox="0 0 300 300" className="w-full h-full" fill="none">
              {/* Central Phoenix Totem Embroidery */}
              <defs>
                <linearGradient id="sheEmbroideryGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <rect width="300" height="300" fill="#f8fafc" />
              {/* Diamond lattice weave */}
              <path
                d="M150 20 L280 150 L150 280 L20 150 Z"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path d="M150 50 L250 150 L150 250 L50 150 Z" stroke="#e2e8f0" strokeWidth="2" />

              {/* Phoenix Wings Details */}
              <path
                d="M150 60 C180 80 240 70 260 120 C230 130 190 110 150 140 C110 110 70 130 40 120 C60 70 120 80 150 60 Z"
                fill="url(#sheEmbroideryGrad)"
                opacity="0.3"
              />
              <path
                d="M150 140 L180 240 L150 220 L120 240 Z"
                fill="#dc2626"
                opacity="0.4"
              />
            </svg>
          </div>

          {/* 3x3 Snap Grid */}
          <div className="relative z-10 grid grid-cols-3 gap-2 w-full h-full">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((slotIndex) => {
              const placedPiece = pieces.find((p) => p.currentIndex === slotIndex);
              const isTargetForSelected =
                selectedPieceId !== null &&
                pieces.find((p) => p.id === selectedPieceId)?.targetIndex === slotIndex;

              // Pre-filled slots vs empty puzzle slots
              const isMissingSlot = [0, 1, 5].includes(slotIndex);

              return (
                <div
                  key={slotIndex}
                  id={`puzzle-slot-${slotIndex}`}
                  onClick={() => isMissingSlot && !placedPiece && handleSlotClick(slotIndex)}
                  className={`relative rounded-2xl flex items-center justify-center transition-all ${
                    placedPiece
                      ? 'bg-white shadow-md border-2 border-teal-500'
                      : isMissingSlot
                      ? `border-2 border-dashed ${
                          isTargetForSelected && hintActive
                            ? 'border-amber-500 bg-amber-50/70 animate-pulse'
                            : 'border-slate-300 bg-slate-100/80 hover:bg-slate-200/60'
                        } cursor-pointer`
                      : 'bg-transparent border border-transparent pointer-events-none'
                  }`}
                >
                  {/* Empty missing slot icon (Image 13) */}
                  {isMissingSlot && !placedPiece && (
                    <div className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center opacity-40">
                      <div className="grid grid-cols-2 gap-1 w-4 h-4">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-xs" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-xs" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-xs" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-xs" />
                      </div>
                    </div>
                  )}

                  {/* Render placed piece */}
                  {placedPiece && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full h-full rounded-2xl flex flex-col items-center justify-center text-xl font-black shadow-inner"
                      style={{ backgroundColor: placedPiece.bgColor, color: placedPiece.color }}
                    >
                      <span>{placedPiece.symbol}</span>
                      <Check className="w-4 h-4 text-teal-600 mt-1 stroke-[3]" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Piece Tray: 拖拽/点击碎片完成拼图 (Image 13) */}
      <div className="bg-white rounded-t-3xl shadow-xl p-5 border-t border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 text-center mb-3">
          点击碎片完成拼图
        </h4>

        <div className="flex justify-center gap-3">
          {pieces.map((piece) => {
            const isPlaced = piece.currentIndex !== null;
            const isSelected = selectedPieceId === piece.id;

            return (
              <button
                key={piece.id}
                id={`puzzle-piece-${piece.id}`}
                disabled={isPlaced}
                onClick={() => handleSelectPiece(piece.id)}
                className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isPlaced
                    ? 'opacity-30 cursor-not-allowed bg-slate-100 border border-slate-200'
                    : isSelected
                    ? 'scale-110 shadow-lg ring-4 ring-red-400 border-2 border-red-500'
                    : 'bg-white shadow-md border-2 border-slate-200 hover:border-slate-400 active:scale-95'
                }`}
                style={{
                  backgroundColor: isPlaced ? '#f1f5f9' : piece.bgColor,
                }}
              >
                <span className="text-2xl">{piece.symbol}</span>
                <span className="text-[10px] font-bold mt-1" style={{ color: piece.color }}>
                  {piece.iconType}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
