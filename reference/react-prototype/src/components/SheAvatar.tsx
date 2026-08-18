import React from 'react';
import { motion } from 'motion/react';
import { WardrobeItem } from '../types';

interface SheAvatarProps {
  equippedItems: WardrobeItem[];
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSpiritPhoenix?: boolean;
  isDancing?: boolean;
  className?: string;
}

export const SheAvatar: React.FC<SheAvatarProps> = ({
  equippedItems,
  size = 'md',
  showSpiritPhoenix = false,
  isDancing = false,
  className = '',
}) => {
  const hasCrown = equippedItems.some((i) => i.category === 'headwear' && i.isEquipped && i.name.includes('凤冠'));
  const hasHat = equippedItems.some((i) => i.category === 'headwear' && i.isEquipped && i.name.includes('斗笠'));
  const hasEarrings = equippedItems.some((i) => i.category === 'accessories' && i.isEquipped && i.name.includes('耳环'));
  const hasNecklace = equippedItems.some((i) => i.category === 'accessories' && i.isEquipped && i.name.includes('项圈'));
  const isSkinGrand = equippedItems.some((i) => i.category === 'skins' && i.isEquipped && i.name.includes('祈福'));

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-44',
    lg: 'w-48 h-64',
    hero: 'w-64 h-80 sm:w-72 sm:h-92',
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}>
      {/* Glow / Spotlight backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 via-amber-400/5 to-transparent rounded-full filter blur-xl -z-10" />

      {/* Floating Spirit Phoenix if requested (As seen in Village Home Image 23) */}
      {showSpiritPhoenix && (
        <motion.div
          animate={{
            y: [-8, 8, -8],
            x: [4, -4, 4],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-4 -right-2 sm:-top-6 sm:right-0 z-20 pointer-events-none drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"
        >
          <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {/* Phoenix body & wings */}
            <path
              d="M50 35 C42 15 20 20 15 35 C10 50 30 65 48 55 C45 68 35 78 20 85 C40 85 55 72 58 58 C65 72 80 82 95 85 C80 75 72 65 70 52 C85 60 95 45 90 32 C82 18 62 20 52 35 Z"
              fill="url(#fireGrad)"
            />
            {/* Crown feathers */}
            <path d="M50 30 Q50 10 58 8 Q55 22 53 28 Z" fill="#fef08a" />
            <path d="M48 30 Q44 12 38 10 Q43 22 47 28 Z" fill="#fef08a" />
            {/* Eyes & Glow */}
            <circle cx="46" cy="32" r="1.5" fill="#78350f" />
            <circle cx="54" cy="32" r="1.5" fill="#78350f" />
            {/* Sparkling particles */}
            <circle cx="28" cy="22" r="2" fill="#fff" opacity="0.9" />
            <circle cx="75" cy="26" r="1.5" fill="#fef08a" opacity="0.8" />
            <circle cx="50" cy="75" r="2" fill="#fdba74" opacity="0.8" />
          </svg>
        </motion.div>
      )}

      {/* Floating Light Arc Under Character (from Image 23) */}
      <motion.div
        animate={{
          scaleX: [0.95, 1.05, 0.95],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-2 w-3/4 h-3 bg-gradient-to-r from-transparent via-cyan-300 to-transparent rounded-full filter blur-[2px] opacity-80"
      />

      {/* Main Avatar Body Container */}
      <motion.div
        animate={
          isDancing
            ? {
                y: [0, -6, 0],
                rotate: [-1.5, 1.5, -1.5],
              }
            : {
                y: [0, -4, 0],
              }
        }
        transition={{
          duration: isDancing ? 2.2 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-full h-full flex flex-col items-center justify-center"
      >
        {/* SVG Chibi Mascot Vector Artwork */}
        <svg
          viewBox="0 0 200 270"
          className="w-full h-full drop-shadow-[0_12px_24px_rgba(15,23,42,0.15)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff1e6" />
              <stop offset="100%" stopColor="#fcd5b5" />
            </linearGradient>
            <linearGradient id="dressRedGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="50%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="dressNavyGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#e2e8f0" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="goldRibbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Hair Back */}
          <path d="M60 85 C40 120 45 180 52 200 C58 202 65 195 62 170 C60 145 68 110 75 90 Z" fill="#1e1b18" />
          <path d="M140 85 C160 120 155 180 148 200 C142 202 135 195 138 170 C140 145 132 110 125 90 Z" fill="#1e1b18" />

          {/* Hair Braids with colorful bands */}
          <circle cx="50" cy="140" r="4" fill="#ef4444" />
          <circle cx="50" cy="170" r="4" fill="#06b6d4" />
          <circle cx="150" cy="140" r="4" fill="#ef4444" />
          <circle cx="150" cy="170" r="4" fill="#06b6d4" />

          {/* Legs & Shoes */}
          <rect x="86" y="210" width="10" height="35" rx="5" fill="url(#skinGrad)" />
          <rect x="104" y="210" width="10" height="35" rx="5" fill="url(#skinGrad)" />
          {/* Shoes - Cloud Embroidered Shoes */}
          <path d="M80 240 C80 236 94 236 98 240 C100 244 94 249 84 249 C80 249 76 245 80 240 Z" fill="#b91c1c" />
          <path d="M78 239 Q84 235 90 239" stroke="#fde047" strokeWidth="1.5" />
          <path d="M102 240 C102 236 116 236 120 240 C122 244 116 249 106 249 C102 249 98 245 102 240 Z" fill="#b91c1c" />
          <path d="M100 239 Q106 235 112 239" stroke="#fde047" strokeWidth="1.5" />

          {/* Traditional She Phoenix Robe / Skirt */}
          <path
            d="M72 150 L128 150 L145 215 L55 215 Z"
            fill={isSkinGrand ? 'url(#dressNavyGrad)' : 'url(#dressRedGrad)'}
          />
          {/* Skirt embroidered border */}
          <path d="M55 210 L145 210 L145 216 L55 216 Z" fill="url(#goldRibbon)" />
          <path d="M60 195 L140 195" stroke="#fde047" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Upper Body & Jacket */}
          <path
            d="M72 115 C72 110 85 105 100 105 C115 105 128 110 128 115 L132 155 L68 155 Z"
            fill={isSkinGrand ? 'url(#dressNavyGrad)' : 'url(#dressRedGrad)'}
          />
          {/* Traditional Right Lapel (大襟右衽) Embroidered Border */}
          <path
            d="M95 106 C105 106 120 115 125 132 L120 155"
            stroke="url(#goldRibbon)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Phoenix chest embroidery medallion */}
          <circle cx="100" cy="132" r="9" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M96 132 Q100 126 104 132 Q100 138 96 132 Z" fill="#fbbf24" />

          {/* Woven Sash / Belt (畲族彩带) */}
          <rect x="70" y="148" width="60" height="7" rx="2" fill="url(#goldRibbon)" />
          {/* Dangling Ribbon Ends */}
          <path d="M98 155 L96 185 L101 182 L103 155 Z" fill="#ef4444" />
          <path d="M102 155 L104 190 L108 186 L107 155 Z" fill="#10b981" />

          {/* Sleeves & Arms */}
          <path
            d="M72 115 C60 125 45 140 40 150 C38 155 45 158 50 154 C55 145 68 135 73 130 Z"
            fill={isSkinGrand ? 'url(#dressNavyGrad)' : 'url(#dressRedGrad)'}
          />
          <path d="M40 150 L47 156" stroke="url(#goldRibbon)" strokeWidth="3" />
          {/* Right Arm raised joyfully */}
          <path
            d="M128 115 C145 110 160 95 168 85 C172 82 174 88 170 93 C160 106 142 125 132 135 Z"
            fill={isSkinGrand ? 'url(#dressNavyGrad)' : 'url(#dressRedGrad)'}
          />
          <path d="M165 87 L171 93" stroke="url(#goldRibbon)" strokeWidth="3" />

          {/* Little hands */}
          <circle cx="43" cy="154" r="5" fill="url(#skinGrad)" />
          <circle cx="170" cy="88" r="5" fill="url(#skinGrad)" />

          {/* Neck and Silver Torc / Necklace */}
          <rect x="94" y="98" width="12" height="12" rx="3" fill="url(#skinGrad)" />
          {hasNecklace && (
            <g>
              <ellipse cx="100" cy="108" rx="14" ry="6" fill="none" stroke="url(#silverGrad)" strokeWidth="3" />
              <circle cx="95" cy="113" r="2" fill="url(#silverGrad)" />
              <circle cx="100" cy="114" r="2.5" fill="url(#silverGrad)" />
              <circle cx="105" cy="113" r="2" fill="url(#silverGrad)" />
            </g>
          )}

          {/* Head & Face */}
          <ellipse cx="100" cy="72" rx="32" ry="30" fill="url(#skinGrad)" />

          {/* Cute Ears & Earrings */}
          <ellipse cx="68" cy="74" rx="4.5" ry="6" fill="url(#skinGrad)" />
          <ellipse cx="132" cy="74" rx="4.5" ry="6" fill="url(#skinGrad)" />
          {hasEarrings && (
            <g>
              {/* Left silver dangling earring */}
              <circle cx="68" cy="80" r="1.5" fill="url(#silverGrad)" />
              <path d="M68 81 L68 92" stroke="url(#silverGrad)" strokeWidth="1" />
              <polygon points="65,92 71,92 68,97" fill="url(#silverGrad)" />

              {/* Right silver dangling earring */}
              <circle cx="132" cy="80" r="1.5" fill="url(#silverGrad)" />
              <path d="M132 81 L132 92" stroke="url(#silverGrad)" strokeWidth="1" />
              <polygon points="129,92 135,92 132,97" fill="url(#silverGrad)" />
            </g>
          )}

          {/* Cheerful Eyes & Lashes */}
          <ellipse cx="86" cy="72" rx="5" ry="6" fill="#1e1b18" />
          <circle cx="84" cy="70" r="2" fill="#ffffff" />
          <circle cx="88" cy="74" r="1" fill="#ffffff" />
          <path d="M81 65 Q86 63 91 66" stroke="#1e1b18" strokeWidth="1.5" strokeLinecap="round" />

          <ellipse cx="114" cy="72" rx="5" ry="6" fill="#1e1b18" />
          <circle cx="112" cy="70" r="2" fill="#ffffff" />
          <circle cx="116" cy="74" r="1" fill="#ffffff" />
          <path d="M109 66 Q114 63 119 65" stroke="#1e1b18" strokeWidth="1.5" strokeLinecap="round" />

          {/* Sweet blush & Smile */}
          <ellipse cx="80" cy="78" rx="5" ry="3" fill="#f87171" opacity="0.6" />
          <ellipse cx="120" cy="78" rx="5" ry="3" fill="#f87171" opacity="0.6" />
          <path d="M96 79 Q100 84 104 79" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Forehead Bangs */}
          <path
            d="M68 62 C75 52 90 48 100 48 C110 48 125 52 132 62 C125 55 110 56 100 58 C90 56 75 55 68 62 Z"
            fill="#1e1b18"
          />

          {/* Headwear Layer: Phoenix Crown (凤冠) */}
          {hasCrown && !hasHat && (
            <g className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">
              {/* Crown Base Silver Band */}
              <path
                d="M66 52 C76 42 124 42 134 52 L132 46 C122 38 78 38 68 46 Z"
                fill="url(#silverGrad)"
                stroke="#64748b"
                strokeWidth="0.8"
              />
              {/* Crown Center Phoenix Crest */}
              <path
                d="M100 18 C95 28 85 35 78 44 C90 40 110 40 122 44 C115 35 105 28 100 18 Z"
                fill="url(#silverGrad)"
                stroke="#475569"
                strokeWidth="0.8"
              />
              {/* Phoenix Head & Wings filigree */}
              <circle cx="100" cy="22" r="3.5" fill="#f59e0b" />
              <path d="M98 21 L94 18" stroke="#ef4444" strokeWidth="1.5" />
              <path d="M102 21 L106 18" stroke="#ef4444" strokeWidth="1.5" />
              {/* Dangling Silver & Red Tassels on side */}
              <path d="M70 48 L65 72" stroke="url(#silverGrad)" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="65" cy="74" r="2.5" fill="#b91c1c" />
              <path d="M130 48 L135 72" stroke="url(#silverGrad)" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="135" cy="74" r="2.5" fill="#b91c1c" />
              {/* Pearl ornaments on forehead fringe */}
              <circle cx="85" cy="50" r="2" fill="#ffffff" />
              <circle cx="92" cy="48" r="2" fill="#ef4444" />
              <circle cx="100" cy="47" r="2.5" fill="#3b82f6" />
              <circle cx="108" cy="48" r="2" fill="#ef4444" />
              <circle cx="115" cy="50" r="2" fill="#ffffff" />
            </g>
          )}

          {/* Headwear Layer: Flower Bamboo Hat (花斗笠) */}
          {hasHat && (
            <g className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
              <path d="M60 52 L100 24 L140 52 Z" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
              <path d="M72 45 L100 28 L128 45" stroke="#ef4444" strokeWidth="1.5" />
              <circle cx="100" cy="24" r="4" fill="#b91c1c" />
              {/* Red Silk Tassels */}
              <path d="M96 28 L92 48" stroke="#ef4444" strokeWidth="2" />
              <path d="M104 28 L108 48" stroke="#ef4444" strokeWidth="2" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
