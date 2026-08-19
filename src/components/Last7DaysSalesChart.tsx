import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Sale } from '../types';
import { AmountDisplay } from './AmountDisplay';

interface Last7DaysSalesChartProps {
  sales: Sale[];
}

interface DayData {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // e.g., "Lun 10/08" or "Aujourd'hui"
  shortDay: string; // e.g., "Dim 16"
  fullDate: string; // e.g., "Dimanche 16 Août"
  revenue: number;
  salesCount: number;
  isToday: boolean;
}

export const Last7DaysSalesChart: React.FC<Last7DaysSalesChartProps> = ({ sales }) => {
  // Compute the last 7 calendar days up to today
  const daysMap = new Map<string, { revenue: number; salesCount: number }>();
  const last7DaysList: DayData[] = [];

  const today = new Date();
  const dayNamesShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNamesShort = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Août',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ];

  // Helper to parse date from sale
  const parseSaleDateKey = (dateFormatted: string, timestamp: string): string => {
    if (dateFormatted) {
      if (dateFormatted.includes('/')) {
        const parts = dateFormatted.split('/');
        if (parts.length === 3) {
          const day = parts[0].trim().padStart(2, '0');
          const month = parts[1].trim().padStart(2, '0');
          let year = parts[2].trim();
          if (year.length === 2) year = `20${year}`;
          return `${year}-${month}-${day}`;
        }
      }
      if (dateFormatted.includes('-')) {
        return dateFormatted.substring(0, 10);
      }
    }
    if (timestamp) {
      const parsed = new Date(timestamp);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    return '';
  };

  // Populate daysMap with sales
  sales.forEach((s) => {
    const key = parseSaleDateKey(s.dateFormatted, s.timestamp);
    if (key) {
      const current = daysMap.get(key) || { revenue: 0, salesCount: 0 };
      current.revenue += s.totalAmount || 0;
      current.salesCount += 1;
      daysMap.set(key, current);
    }
  });

  // Generate 7 days in chronological order (from 6 days ago -> today)
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const isToday = i === 0;
    const isYesterday = i === 1;

    const weekdayShort = dayNamesShort[d.getDay()];
    const monthShort = monthNamesShort[d.getMonth()];

    let dayLabel = `${weekdayShort} ${day}`;
    if (isToday) dayLabel = "Aujourd'hui";
    else if (isYesterday) dayLabel = 'Hier';

    const shortDay = `${weekdayShort} ${day}`;
    const fullDate = `${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`;

    const stat = daysMap.get(dateKey) || { revenue: 0, salesCount: 0 };

    last7DaysList.push({
      dateKey,
      dayLabel,
      shortDay,
      fullDate,
      revenue: stat.revenue,
      salesCount: stat.salesCount,
      isToday,
    });
  }

  // Calculate 7-day totals, best day, and worst day (excluding today for comparative past analysis)
  const total7DaysRevenue = last7DaysList.reduce((sum, d) => sum + d.revenue, 0);
  const total7DaysSales = last7DaysList.reduce((sum, d) => sum + d.salesCount, 0);
  const dailyAverageRevenue = Math.round(total7DaysRevenue / 7);
  const bestDay = [...last7DaysList].sort((a, b) => b.revenue - a.revenue)[0];
  const worstDay = [...last7DaysList]
    .filter((d) => !d.isToday)
    .sort((a, b) => a.revenue - b.revenue)[0];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DayData;
      const isBest = bestDay && data.dateKey === bestDay.dateKey && data.revenue > 0;
      const isWorst = worstDay && data.dateKey === worstDay.dateKey && (!bestDay || data.dateKey !== bestDay.dateKey) && !data.isToday;

      return (
        <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-700/80 text-xs sm:text-sm space-y-1.5 min-w-[170px]">
          <p className="font-bold text-slate-300 capitalize pb-1 border-b border-slate-800">
            {data.fullDate}{' '}
            {data.isToday && <span className="text-amber-400 font-bold ml-1">(Aujourd'hui)</span>}
            {isBest && !data.isToday && <span className="text-amber-400 font-bold ml-1">(Meilleur jour)</span>}
            {isWorst && <span className="text-rose-400 font-bold ml-1">(Moins bon jour)</span>}
          </p>
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-slate-400 font-medium">Chiffre d'affaires :</span>
            <span className="font-black text-amber-400 font-mono text-sm">
              {Math.round(data.revenue).toLocaleString('fr-FR')} FCFA
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 font-medium">Transactions :</span>
            <span className="font-black text-indigo-300 font-mono">
              {data.salesCount} vente{data.salesCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 lg:p-8 space-y-6">
      {/* Header with Title only (without toggle filter and without subtitle) */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-wider">
          Ventes des 7 derniers jours
        </h3>
      </div>

      {/* 3 KPIs Cards with clear, highly visible typography */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total 7 derniers jours */}
        <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600">
            Total 7 derniers jours
          </span>
          <div className="my-2">
            <AmountDisplay
              amount={total7DaysRevenue}
              size="lg"
              className="font-black text-slate-950 font-mono text-xl sm:text-2xl"
            />
          </div>
          <span className="text-xs font-bold text-slate-600">
            {total7DaysSales} transaction{total7DaysSales > 1 ? 's' : ''} enregistrée{total7DaysSales > 1 ? 's' : ''}
          </span>
        </div>

        {/* Card 2: Moyenne journalière */}
        <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600">
            Moyenne journalière
          </span>
          <div className="my-2">
            <AmountDisplay
              amount={dailyAverageRevenue}
              size="lg"
              className="font-black text-slate-950 font-mono text-xl sm:text-2xl"
            />
          </div>
          <span className="text-xs font-bold text-slate-600">
            Calculé sur la période
          </span>
        </div>

        {/* Card 3: Meilleure journée */}
        <div className="bg-amber-50/80 hover:bg-amber-50 transition-colors border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900">
            Meilleure journée ({bestDay?.shortDay || '-'})
          </span>
          <div className="my-2">
            <AmountDisplay
              amount={bestDay?.revenue || 0}
              size="lg"
              className="font-black text-amber-950 font-mono text-xl sm:text-2xl"
            />
          </div>
          <span className="text-xs font-bold text-amber-800">
            {bestDay?.salesCount || 0} vente{(bestDay?.salesCount || 0) > 1 ? 's' : ''} réalisée{(bestDay?.salesCount || 0) > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Recharts Simple & Clean Bar Chart */}
      <div className="w-full h-64 sm:h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7DaysList} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="shortDay"
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fill: '#475569', fontSize: 12, fontWeight: 800 }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
              tickFormatter={(val) =>
                val >= 1000 ? `${Math.round(val / 1000)}k` : `${val}`
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9', radius: 12 }} />
            <Bar
              dataKey="revenue"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            >
              {last7DaysList.map((entry, index) => {
                const isWorst =
                  worstDay &&
                  entry.dateKey === worstDay.dateKey &&
                  (!bestDay || entry.dateKey !== bestDay.dateKey) &&
                  !entry.isToday;

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isToday
                        ? '#4F46E5' // Indigo-600 for today
                        : entry.revenue === bestDay?.revenue && entry.revenue > 0
                        ? '#F59E0B' // Amber-500 for best day
                        : isWorst
                        ? '#EF4444' // Red-500 for worst day
                        : '#818CF8' // Indigo-400 for standard days
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4-Item Legend: 2x2 Square Grid on mobile, inline flex on desktop */}
      <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-3.5 sm:gap-6 pt-2 text-xs font-black text-slate-700 max-w-xs sm:max-w-none mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-md bg-indigo-600 shrink-0 shadow-2xs" />
          <span className="truncate">Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-md bg-amber-500 shrink-0 shadow-2xs" />
          <span className="truncate">Meilleur jour</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-md bg-red-500 shrink-0 shadow-2xs" />
          <span className="truncate">Mauvais jour</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-md bg-indigo-400 shrink-0 shadow-2xs" />
          <span className="truncate">Autres jours</span>
        </div>
      </div>
    </div>
  );
};
