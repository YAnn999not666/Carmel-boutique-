import React from 'react';
import goldMedalImg from '../assets/images/gold_medal_badge_1786876453546.jpg';
import silverMedalImg from '../assets/images/silver_medal_badge_1786876468886.jpg';
import bronzeMedalImg from '../assets/images/bronze_medal_badge_1786876479294.jpg';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md', className = '' }) => {
  if (rank === 1) {
    const sizeClasses =
      size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
    return (
      <div
        className={`relative shrink-0 rounded-xl bg-white p-0.5 border-2 border-amber-300 shadow-2xs flex items-center justify-center ${sizeClasses} ${className}`}
        title="1er - Médaille d'or"
      >
        <img
          src={goldMedalImg}
          alt="1er"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (rank === 2) {
    const sizeClasses =
      size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
    return (
      <div
        className={`relative shrink-0 rounded-xl bg-white p-0.5 border-2 border-slate-300 shadow-2xs flex items-center justify-center ${sizeClasses} ${className}`}
        title="2e - Médaille d'argent"
      >
        <img
          src={silverMedalImg}
          alt="2e"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (rank === 3) {
    const sizeClasses =
      size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
    return (
      <div
        className={`relative shrink-0 rounded-xl bg-white p-0.5 border-2 border-orange-300 shadow-2xs flex items-center justify-center ${sizeClasses} ${className}`}
        title="3e - Médaille de bronze"
      >
        <img
          src={bronzeMedalImg}
          alt="3e"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Rank 4+: Black background, white number text
  const sizeClasses =
    size === 'sm'
      ? 'w-7 h-7 text-[11px]'
      : size === 'lg'
      ? 'w-11 h-11 text-sm'
      : 'w-9 h-9 text-xs';

  return (
    <div
      className={`shrink-0 rounded-xl bg-black text-white font-mono font-black flex items-center justify-center border border-black shadow-xs ${sizeClasses} ${className}`}
      title={`Rang #${rank}`}
    >
      #{rank}
    </div>
  );
};
