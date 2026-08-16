import React from 'react';
import { PeriodType, PeriodComparison } from '../utils/statsUtils';
import { AmountDisplay } from './AmountDisplay';

interface TotalsBannerProps {
  totalAmount: number;
  waveTotal: number;
  waveBusinessTotal: number;
  orangeMoneyTotal: number;
  cashTotal: number;
  totalSalesCount: number;
  onCloseDay?: () => void;
  isTodayClosed?: boolean;
  selectedPeriod?: PeriodType;
  onSelectPeriod?: (period: PeriodType) => void;
  periodStats?: PeriodComparison;
  showPeriodSelector?: boolean;
}

export const TotalsBanner: React.FC<TotalsBannerProps> = ({
  totalAmount,
  waveTotal,
  waveBusinessTotal,
  orangeMoneyTotal,
  cashTotal,
  totalSalesCount,
}) => {
  // Compute percentage breakdown
  const wavePct = totalAmount > 0 ? (waveTotal / totalAmount) * 100 : 0;
  const waveBusinessPct = totalAmount > 0 ? (waveBusinessTotal / totalAmount) * 100 : 0;
  const omPct = totalAmount > 0 ? (orangeMoneyTotal / totalAmount) * 100 : 0;
  const cashPct = totalAmount > 0 ? (cashTotal / totalAmount) * 100 : 0;

  return (
    <div className="space-y-6 mb-8">
      {/* 1. Main Total Banner Card */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden">
        {/* Subtle accent top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 w-full flex-wrap">
          <p className="text-slate-600 text-xs sm:text-sm font-black uppercase tracking-wider">
            Total encaissé • Aujourd'hui
          </p>

          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-800 text-xs sm:text-sm font-black px-3.5 py-1 rounded-full border border-indigo-200/80 shadow-2xs">
            <span>{totalSalesCount}</span>
            <span className="text-[11px] uppercase font-bold text-indigo-600">
              vente{totalSalesCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Main Amount */}
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <AmountDisplay
            amount={totalAmount}
            size="5xl"
            className="text-slate-900 font-extrabold"
            currencyClassName="text-indigo-600"
          />
        </div>

        {/* Proportional Distribution Bar */}
        {totalAmount > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Répartition des encaissements</span>
              <span>100% calculé</span>
            </div>

            {/* Segmented bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
              {wavePct > 0 && (
                <div
                  style={{ width: `${wavePct}%` }}
                  title={`Wave: ${Math.round(wavePct)}%`}
                  className="h-full bg-sky-500 rounded-sm transition-all duration-500"
                />
              )}
              {waveBusinessPct > 0 && (
                <div
                  style={{ width: `${waveBusinessPct}%` }}
                  title={`Wave Business: ${Math.round(waveBusinessPct)}%`}
                  className="h-full bg-blue-600 rounded-sm transition-all duration-500"
                />
              )}
              {omPct > 0 && (
                <div
                  style={{ width: `${omPct}%` }}
                  title={`Orange Money: ${Math.round(omPct)}%`}
                  className="h-full bg-orange-500 rounded-sm transition-all duration-500"
                />
              )}
              {cashPct > 0 && (
                <div
                  style={{ width: `${cashPct}%` }}
                  title={`Espèces: ${Math.round(cashPct)}%`}
                  className="h-full bg-emerald-500 rounded-sm transition-all duration-500"
                />
              )}
            </div>

            {/* Mini Legend */}
            <div className="flex items-center gap-3 flex-wrap text-[11px] font-extrabold pt-0.5">
              {wavePct > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sky-900">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Wave ({Math.round(wavePct)}%)
                </span>
              )}
              {waveBusinessPct > 0 && (
                <span className="inline-flex items-center gap-1.5 text-blue-900">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Wave Bus. ({Math.round(waveBusinessPct)}%)
                </span>
              )}
              {omPct > 0 && (
                <span className="inline-flex items-center gap-1.5 text-orange-900">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  OM ({Math.round(omPct)}%)
                </span>
              )}
              {cashPct > 0 && (
                <span className="inline-flex items-center gap-1.5 text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Espèces ({Math.round(cashPct)}%)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Mobile Payments & Cash Grid with Minimalist Official Logos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Box 1: Wave */}
        <div className="bg-white border-2 border-sky-200/90 hover:border-sky-400 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-all active:scale-[0.98]">
          <div className="flex flex-col justify-center min-w-0 flex-1 space-y-0.5">
            <span className="text-xs font-black uppercase tracking-wider text-sky-950 truncate">
              Wave
            </span>
            <AmountDisplay amount={waveTotal} size="xl" className="text-slate-900" />
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl overflow-hidden bg-sky-50 border border-sky-200 p-1 flex items-center justify-center shadow-2xs">
            <img
              src="/W.jpg"
              alt="Wave"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Box 2: Wave Business */}
        <div className="bg-white border-2 border-blue-200/90 hover:border-blue-400 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-all active:scale-[0.98]">
          <div className="flex flex-col justify-center min-w-0 flex-1 space-y-0.5">
            <span className="text-xs font-black uppercase tracking-wider text-blue-950 truncate">
              Wave Business
            </span>
            <AmountDisplay amount={waveBusinessTotal} size="xl" className="text-slate-900" />
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl overflow-hidden bg-blue-50 border border-blue-200 p-1 flex items-center justify-center shadow-2xs">
            <img
              src="/Wb.png"
              alt="Wave Business"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Box 3: Orange Money / OM */}
        <div className="bg-white border-2 border-orange-200/90 hover:border-orange-400 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-all active:scale-[0.98]">
          <div className="flex flex-col justify-center min-w-0 flex-1 space-y-0.5">
            <span className="text-xs font-black uppercase tracking-wider text-orange-950 truncate">
              OM
            </span>
            <AmountDisplay amount={orangeMoneyTotal} size="xl" className="text-slate-900" />
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl overflow-hidden bg-orange-50 border border-orange-200 p-1 flex items-center justify-center shadow-2xs">
            <img
              src="/Om.png"
              alt="OM"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Box 4: Cash / Espèces */}
        <div className="bg-white border-2 border-emerald-200/90 hover:border-emerald-400 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-all active:scale-[0.98]">
          <div className="flex flex-col justify-center min-w-0 flex-1 space-y-0.5">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-950 truncate">
              Cash / Espèces
            </span>
            <AmountDisplay amount={cashTotal} size="xl" className="text-slate-900" />
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center shadow-2xs">
            <img
              src="/Cash.jpg"
              alt="Cash"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
