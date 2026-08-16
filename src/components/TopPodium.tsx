import React, { useState, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Package, X, Info } from 'lucide-react';
import { Product } from '../types';
import { AmountDisplay } from './AmountDisplay';
import podiumAnimationData from '../assets/podium_lottie.json';
import goldMedalImg from '../assets/images/gold_medal_badge_1786876453546.jpg';
import silverMedalImg from '../assets/images/silver_medal_badge_1786876468886.jpg';
import bronzeMedalImg from '../assets/images/bronze_medal_badge_1786876479294.jpg';

export interface PodiumItem {
  product?: Product;
  name: string;
  quantity: number;
  revenue: number;
  unitPrice?: number;
  imageUrl?: string;
}

interface TopPodiumProps {
  items: PodiumItem[];
}

export const TopPodium: React.FC<TopPodiumProps> = ({ items }) => {
  const [activePopupIndex, setActivePopupIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActivePopupIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!items || items.length === 0) return null;

  const first = items[0];
  const second = items[1];
  const third = items[2];

  // Podiums structure definition: [2nd (left), 1st (center), 3rd (right)]
  const podiumSlots = [
    {
      item: second,
      rank: 2,
      rankLabel: '2e Place',
      medalImg: silverMedalImg,
      badgeBorder: 'border-slate-300',
      badgeBg: 'bg-slate-700',
      pillColor: 'bg-slate-100 text-slate-800 border-slate-300',
      accentColor: 'text-slate-700',
      pillarNumberColor: 'text-slate-800 bg-white/90 border-slate-300',
      elevationClass: 'translate-y-6 sm:translate-y-10 md:translate-y-14 lg:translate-y-16', // Left pillar height offset
      colOrder: 'order-1',
      // Safe popover positioning for Left slot (never truncated on the left)
      popoverPosition: 'left-0 sm:left-2 -translate-x-0',
      arrowPosition: 'left-8 sm:left-12 -translate-x-1/2',
    },
    {
      item: first,
      rank: 1,
      rankLabel: '1ère Place',
      medalImg: goldMedalImg,
      badgeBorder: 'border-amber-400 ring-2 ring-amber-200',
      badgeBg: 'bg-amber-600',
      pillColor: 'bg-amber-50 text-amber-900 border-amber-300',
      accentColor: 'text-amber-600',
      pillarNumberColor: 'text-amber-900 bg-amber-100/95 border-amber-400 shadow-amber-200/50',
      elevationClass: '-translate-y-6 sm:-translate-y-12 md:-translate-y-16 lg:-translate-y-20', // Center pillar elevated
      colOrder: 'order-2',
      // Safe popover positioning for Center slot
      popoverPosition: 'left-1/2 -translate-x-1/2',
      arrowPosition: 'left-1/2 -translate-x-1/2',
    },
    {
      item: third,
      rank: 3,
      rankLabel: '3e Place',
      medalImg: bronzeMedalImg,
      badgeBorder: 'border-orange-300',
      badgeBg: 'bg-orange-700',
      pillColor: 'bg-orange-50 text-orange-900 border-orange-200',
      accentColor: 'text-orange-600',
      pillarNumberColor: 'text-orange-950 bg-orange-100/95 border-orange-300 shadow-orange-200/50',
      elevationClass: 'translate-y-10 sm:translate-y-16 md:translate-y-22 lg:translate-y-26', // Right pillar lowest offset
      colOrder: 'order-3',
      // Safe popover positioning for Right slot (never truncated on the right)
      popoverPosition: 'right-0 sm:right-2 left-auto -translate-x-0',
      arrowPosition: 'right-8 sm:right-12 left-auto -translate-x-1/2',
    },
  ];

  return (
    <div ref={containerRef} className="w-full max-w-2xl sm:max-w-3xl mx-auto relative flex flex-col items-center select-none pt-4 pb-2">
      {/* 3 Products positioned directly on top of their respective podium pillars */}
      <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 relative z-30 items-end px-2 sm:px-4">
        {podiumSlots.map((slot) => {
          const item = slot.item;
          const isPopupOpen = activePopupIndex === slot.rank;

          if (!item) {
            return (
              <div
                key={slot.rank}
                className={`flex flex-col items-center text-center ${slot.colOrder} ${slot.elevationClass}`}
              >
                <div className="w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 text-xs sm:text-sm font-bold bg-slate-50/40">
                  <span>{slot.rankLabel}</span>
                </div>
              </div>
            );
          }

          const photoUrl = item.imageUrl || item.product?.imageUrl;
          const unitPrice = item.unitPrice || item.product?.unitPrice || 0;

          return (
            <div
              key={slot.rank}
              className={`flex flex-col items-center text-center relative ${slot.colOrder} ${slot.elevationClass} ${
                isPopupOpen ? 'z-50' : 'z-10'
              }`}
              onMouseEnter={() => setActivePopupIndex(slot.rank)}
              onMouseLeave={() => setActivePopupIndex(null)}
            >
              {/* Product Card: ONLY IMAGE displayed on podium with controlled, clean responsive size */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopupIndex(isPopupOpen ? null : slot.rank);
                }}
                className={`group relative p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl transition-all duration-300 cursor-pointer focus:outline-none ${
                  isPopupOpen
                    ? 'bg-white shadow-2xl ring-4 ring-indigo-500 scale-108 z-50'
                    : 'bg-white/95 hover:bg-white shadow-lg hover:shadow-2xl hover:scale-105 border border-slate-200/90'
                }`}
                title="Cliquez ou survolez pour afficher les informations"
              >
                {/* Product Photo - Capped for clean desktop and mobile presentation */}
                <div className="relative shrink-0 overflow-hidden rounded-xl sm:rounded-2xl">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 max-w-[128px] max-h-[128px] object-cover bg-white transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 max-w-[128px] max-h-[128px] bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Package className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14" />
                    </div>
                  )}

                  {/* Info Badge Indicator */}
                  <div className="absolute bottom-1.5 right-1.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-slate-900/85 backdrop-blur-md text-white flex items-center justify-center text-[10px] sm:text-xs shadow-md border border-white/50 group-hover:bg-indigo-600 transition-colors">
                    <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </button>

              {/* Glass Frosted Popover with Product Details (Nom, Prix, Volume, CA) */}
              {isPopupOpen && (
                <div
                  className={`absolute z-50 bottom-[calc(100%+12px)] ${slot.popoverPosition} w-72 sm:w-80 max-w-[calc(100vw-2rem)] p-4 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-white/95 border border-white/90 shadow-2xl ring-1 ring-slate-900/10 text-slate-800 transition-all animate-in fade-in zoom-in-95 duration-200 text-left`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Popover Header with Medal & Full Product Name */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl bg-white p-1 border shadow-xs flex items-center justify-center shrink-0 ${slot.badgeBorder}`}>
                        <img
                          src={slot.medalImg}
                          alt={slot.rankLabel}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wider block">
                          {slot.rankLabel}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight break-words" title={item.name}>
                          {item.name}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActivePopupIndex(null)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Popover Content details */}
                  <div className="py-3 space-y-2.5">
                    {/* Unit Price */}
                    {unitPrice > 0 && (
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-500 font-bold">Prix unitaire :</span>
                        <AmountDisplay
                          amount={unitPrice}
                          size="sm"
                          className="text-slate-800 font-black font-mono"
                        />
                      </div>
                    )}

                    {/* Quantity sold */}
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-500 font-bold">Volume vendu :</span>
                      <span className="font-black font-mono px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs sm:text-sm">
                        {item.quantity} article{item.quantity > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Total Revenue generated */}
                    <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-100">
                      <span className="text-slate-700 font-black">Chiffre d'affaires :</span>
                      <AmountDisplay
                        amount={item.revenue}
                        size="base"
                        className="text-slate-950 font-black font-mono"
                        currencyClassName={slot.accentColor}
                      />
                    </div>
                  </div>

                  {/* Arrow Indicator at bottom pointing to the product */}
                  <div className={`absolute top-full ${slot.arrowPosition} -mt-1 border-4 border-transparent border-t-white/95`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lottie Animated Podium Stage Base + Explicit Sharp Fixed Ranking Numbers (1, 2, 3) */}
      <div className="w-full -mt-6 sm:-mt-10 md:-mt-14 lg:-mt-18 relative flex justify-center overflow-visible">
        <div className="w-full aspect-[1300/760] relative">
          {/* Base Animation (Podium pillars + celebratory blast, without spotlights) */}
          <Lottie
            animationData={podiumAnimationData}
            loop={false}
            autoplay={true}
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Ranking Numbers 1, 2, 3 anchored cleanly to exact inside area of the podium front faces */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* 2 on Left Pillar */}
            <div className="absolute left-[22.5%] top-[62%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="text-white font-mono font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
                2
              </span>
            </div>

            {/* 1 on Center Pillar */}
            <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="text-amber-300 font-mono font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] select-none">
                1
              </span>
            </div>

            {/* 3 on Right Pillar */}
            <div className="absolute left-[77.5%] top-[69%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="text-white font-mono font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
                3
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
