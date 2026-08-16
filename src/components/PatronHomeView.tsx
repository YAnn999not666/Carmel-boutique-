import React from 'react';
import { Award, Package, TrendingUp, ChevronRight } from 'lucide-react';
import { Product, Sale, PatronNavTab } from '../types';
import { TotalsBanner } from './TotalsBanner';
import { TopPodium } from './TopPodium';
import { AmountDisplay } from './AmountDisplay';
import { RankBadge } from './RankBadge';
import { Last7DaysSalesChart } from './Last7DaysSalesChart';

interface PatronHomeViewProps {
  products: Product[];
  sales: Sale[];
  onNavigate: (tab: PatronNavTab) => void;
}

export const PatronHomeView: React.FC<PatronHomeViewProps> = ({
  products,
  sales,
  onNavigate,
}) => {
  // Synchronized active (unclosed) sales session - identical to Caissier home
  const activeSessionSales = sales.filter((s) => !s.isClosed);

  const totalAmount = activeSessionSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const waveTotal = activeSessionSales.filter((s) => s.paymentType === 'Wave').reduce((sum, s) => sum + s.totalAmount, 0);
  const waveBusinessTotal = activeSessionSales.filter((s) => s.paymentType === 'Wave Business').reduce((sum, s) => sum + s.totalAmount, 0);
  const orangeMoneyTotal = activeSessionSales.filter((s) => s.paymentType === 'OM').reduce((sum, s) => sum + s.totalAmount, 0);
  const cashTotal = activeSessionSales.filter((s) => s.paymentType === 'Cash').reduce((sum, s) => sum + s.totalAmount, 0);
  const totalSalesCount = activeSessionSales.length;

  // Comparison with previous closed sales
  const closedSales = sales.filter((s) => s.isClosed);
  const previousRevenue = closedSales.slice(0, 10).reduce((sum, s) => sum + s.totalAmount, 0);

  let percentChange: number | null = null;
  if (previousRevenue > 0) {
    percentChange = Math.round(((totalAmount - previousRevenue) / previousRevenue) * 100);
  } else if (totalAmount > 0) {
    percentChange = 100;
  } else {
    percentChange = 0;
  }

  const periodStats = {
    period: 'today' as const,
    periodLabel: "Aujourd'hui",
    previousPeriodLabel: 'hier',
    currentRevenue: totalAmount,
    previousRevenue,
    currentSalesCount: totalSalesCount,
    previousSalesCount: closedSales.length,
    percentChange,
    isIncrease: percentChange !== null && percentChange > 0,
    isDecrease: percentChange !== null && percentChange < 0,
    waveTotal,
    waveBusinessTotal,
    orangeMoneyTotal,
    cashTotal,
  };

  // Top Selling Products for the active unclosed session
  const productSalesMap = new Map<
    string,
    { product: Product | undefined; name: string; quantity: number; revenue: number }
  >();

  const normalizeKey = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  activeSessionSales.forEach((sale) => {
    const key = normalizeKey(sale.productName);
    const existing = productSalesMap.get(key);
    const prod = products.find((p) => normalizeKey(p.name) === key);

    if (existing) {
      existing.quantity += sale.quantity;
      existing.revenue += sale.totalAmount;
    } else {
      productSalesMap.set(key, {
        product: prod,
        name: prod?.name || sale.productName,
        quantity: sale.quantity,
        revenue: sale.totalAmount,
      });
    }
  });

  const allTopSales = Array.from(productSalesMap.values())
    .map((data) => ({
      product: data.product,
      name: data.product?.name || data.name,
      imageUrl: data.product?.imageUrl,
      unitPrice: data.product?.unitPrice || (data.quantity > 0 ? data.revenue / data.quantity : 0),
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);

  const top3Sales = allTopSales.slice(0, 3);
  const remainingSales = allTopSales.slice(3, 8);

  return (
    <div className="space-y-6">
      {/* BANDEAU DU HAUT PLEINE LARGEUR: TOTAL ENCAISSÉ + MÉTHODES DE PAIEMENT + SYNCHRONISÉ */}
      <TotalsBanner
        totalAmount={totalAmount}
        waveTotal={waveTotal}
        waveBusinessTotal={waveBusinessTotal}
        orangeMoneyTotal={orangeMoneyTotal}
        cashTotal={cashTotal}
        totalSalesCount={totalSalesCount}
        periodStats={periodStats}
      />

      {/* GRAPHIQUE DES VENTES DES 7 DERNIERS JOURS (RECHARTS) */}
      <Last7DaysSalesChart sales={sales} />

      {/* BLOC TOP VENTES DU JOUR */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 lg:p-8 space-y-6">
        {/* En-tête du bloc */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-wider">
              Top ventes du jour
            </h3>
          </div>

          <button
            onClick={() => onNavigate('patron_products')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-[0.98] text-indigo-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-200/80 shadow-2xs"
          >
            <span>Voir tout le classement</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {allTopSales.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-500 space-y-3">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-extrabold text-sm sm:text-base text-slate-700">
              Aucune vente enregistrée aujourd'hui
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Les meilleures ventes du jour apparaîtront automatiquement dès qu'une vente sera effectuée par la caisse.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* MINI-PODIUM TOP 3 */}
            <TopPodium items={top3Sales} />

            {/* SUITE DU CLASSEMENT (RANG 4+) */}
            {remainingSales.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Suivi du classement
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 w-full">
                  {remainingSales.map((item, idx) => {
                    const rank = idx + 4;
                    return (
                      <div
                        key={idx}
                        className="w-full bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-3 sm:p-4 transition-all shadow-2xs hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        {/* Left: Rank, Photo, Name & Unit Price */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="shrink-0">
                            <RankBadge rank={rank} size="md" />
                          </div>

                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                              <Package className="w-6 h-6" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2" title={item.name}>
                              {item.name}
                            </h4>
                            {item.unitPrice ? (
                              <p className="text-xs text-slate-500 font-mono font-semibold mt-0.5">
                                Prix unit. : <AmountDisplay amount={item.unitPrice} size="sm" className="text-slate-700 font-bold" />
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {/* Right: Quantity Sold & Total Revenue cleanly organized */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
                          <div className="flex flex-col items-start sm:items-end">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Volume</span>
                            <span className="text-xs font-black font-mono bg-indigo-50 text-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-200 mt-0.5">
                              {item.quantity} vendu{item.quantity > 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total CA</span>
                            <div className="mt-0.5">
                              <AmountDisplay amount={item.revenue} size="sm" className="text-slate-950 font-black font-mono" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
