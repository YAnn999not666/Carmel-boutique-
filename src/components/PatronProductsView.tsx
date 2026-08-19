import React, { useState } from 'react';
import {
  Search,
  Package,
  Filter,
  ArrowUpDown,
  Moon,
  AlertTriangle,
  Boxes,
  ArrowUpRight,
  Award,
} from 'lucide-react';
import { Product, Sale, Category, SubCategory, PatronNavTab } from '../types';
import { formatFCFA } from '../utils/formatters';
import {
  computePeriodStats,
  getDormantProducts,
  parseSaleDate,
} from '../utils/statsUtils';
import { TopPodium } from './TopPodium';
import { AmountDisplay } from './AmountDisplay';
import { RankBadge } from './RankBadge';

interface PatronProductsViewProps {
  products: Product[];
  sales: Sale[];
  categories: Category[];
  subCategories: SubCategory[];
  onNavigate?: (tab: PatronNavTab) => void;
}

export const PatronProductsView: React.FC<PatronProductsViewProps> = ({
  products,
  sales,
  categories,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue' | 'name'>('quantity');
  const [activeTab, setActiveTab] = useState<'ALL' | 'DORMANT'>('ALL');

  // Helper to normalize strings for robust matching
  const normalizeKey = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // 1. Compute Period Comparison Stats for Today (Active unclosed sales)
  const activeTodaySales = sales.filter((s) => !s.isClosed);
  const periodStats = computePeriodStats(activeTodaySales, 'today');

  // 2. Compute Dormant Products (stock > 0 and 0 sales in last 30 days)
  const dormantProducts = getDormantProducts(products, sales);

  // 3. Compute Product Sales Stats for today (Journalier)
  const productStatsMap = new Map<
    string,
    {
      product?: Product;
      name: string;
      quantitySold: number;
      revenue: number;
      salesCount: number;
    }
  >();

  // Initialize with catalog products
  products.forEach((p) => {
    productStatsMap.set(normalizeKey(p.name), {
      product: p,
      name: p.name,
      quantitySold: 0,
      revenue: 0,
      salesCount: 0,
    });
  });

  // Accumulate active unclosed sales for today
  activeTodaySales.forEach((s) => {
    const key = normalizeKey(s.productName);
    const existing = productStatsMap.get(key);
    if (existing) {
      existing.quantitySold += s.quantity;
      existing.revenue += s.totalAmount;
      existing.salesCount += 1;
    } else {
      const prod = products.find((p) => normalizeKey(p.name) === key);
      productStatsMap.set(key, {
        product: prod,
        name: prod?.name || s.productName,
        quantitySold: s.quantity,
        revenue: s.totalAmount,
        salesCount: 1,
      });
    }
  });

  let statsList = Array.from(productStatsMap.values());

  // Filter by Search Term
  if (searchTerm.trim()) {
    const term = normalizeKey(searchTerm);
    statsList = statsList.filter((item) => normalizeKey(item.name).includes(term));
  }

  // Filter by Category
  if (selectedCategory !== 'ALL') {
    statsList = statsList.filter((item) => item.product?.categoryId === selectedCategory);
  }

  // Dynamic Ranking & Sorting (Prioritize quantity sold -> sales count -> revenue)
  statsList.sort((a, b) => {
    if (sortBy === 'quantity') {
      if (b.quantitySold !== a.quantitySold) return b.quantitySold - a.quantitySold;
      if (b.salesCount !== a.salesCount) return b.salesCount - a.salesCount;
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'revenue') {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      if (b.quantitySold !== a.quantitySold) return b.quantitySold - a.quantitySold;
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  // 4. Continuous All-Time Top Selling Products (Historique continu sur toutes les ventes)
  const allTimeProductStatsMap = new Map<
    string,
    {
      product?: Product;
      name: string;
      quantitySold: number;
      revenue: number;
    }
  >();

  products.forEach((p) => {
    allTimeProductStatsMap.set(normalizeKey(p.name), {
      product: p,
      name: p.name,
      quantitySold: 0,
      revenue: 0,
    });
  });

  sales.forEach((s) => {
    const key = normalizeKey(s.productName);
    const existing = allTimeProductStatsMap.get(key);
    if (existing) {
      existing.quantitySold += s.quantity;
      existing.revenue += s.totalAmount;
    } else {
      const prod = products.find((p) => normalizeKey(p.name) === key);
      allTimeProductStatsMap.set(key, {
        product: prod,
        name: prod?.name || s.productName,
        quantitySold: s.quantity,
        revenue: s.totalAmount,
      });
    }
  });

  const topSalesContinuous = Array.from(allTimeProductStatsMap.values())
    .filter((item) => item.quantitySold > 0)
    .sort((a, b) => b.quantitySold - a.quantitySold || b.revenue - a.revenue)
    .slice(0, 6);

  const todayActiveRevenue = activeTodaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalVolumeSold = activeTodaySales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Suivi du classement
        </h2>
      </div>

      {/* Overview Metrics Cards with increased font size & clickable C.A. card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: C.A. Ventes (Clickable -> Navigates to Historique with diagonal arrow) */}
        <div
          onClick={() => onNavigate?.('patron_history')}
          className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between gap-2 cursor-pointer hover:border-indigo-600 hover:shadow-md transition-all group"
          title="Cliquez pour voir l'historique complet des ventes"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm sm:text-base font-black uppercase text-indigo-700 tracking-wider">
              C.A. Ventes
            </p>
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="pt-1">
            <p className="text-2xl sm:text-3xl font-black font-mono text-indigo-950 tracking-tight">
              {formatFCFA(todayActiveRevenue)}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Total généré aujourd'hui
            </p>
          </div>
        </div>

        {/* Card 2: Volume Total */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between gap-2">
          <p className="text-sm sm:text-base font-black uppercase text-emerald-700 tracking-wider">
            Volume Ventes
          </p>
          <div className="pt-1">
            <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-950 tracking-tight">
              {totalVolumeSold} unité{totalVolumeSold > 1 ? 's' : ''}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1">
              {activeTodaySales.length} transaction{activeTodaySales.length > 1 ? 's' : ''} aujourd'hui
            </p>
          </div>
        </div>

        {/* Card 3: Produits Sans Vente (Dormants - sans "(30j)" et sans "Voir") */}
        <div
          onClick={() => setActiveTab('DORMANT')}
          className={`p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-sm ${
            activeTab === 'DORMANT'
              ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-400/30'
              : 'bg-white border-slate-300 hover:border-purple-300 hover:bg-purple-50/30'
          }`}
        >
          <p className="text-sm sm:text-base font-black uppercase text-purple-700 tracking-wider flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-purple-600" />
            <span>Produits Sans Vente</span>
          </p>
          <div className="pt-1">
            <p className="text-2xl sm:text-3xl font-black font-mono text-purple-950 tracking-tight">
              {dormantProducts.length} article{dormantProducts.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs font-bold text-purple-700 mt-1">
              Stock disponible mais inactif
            </p>
          </div>
        </div>
      </div>

      {/* Filter & View Controls Bar: Search & Selectors FIRST, then Horizontal Status Tabs */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/90 space-y-4">
        {/* Search full width + Two filters stacked below each taking full width */}
        <div className="flex flex-col gap-3.5 w-full">
          {/* Full width search bar */}
          <div className="relative w-full">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-2xs"
            />
          </div>

          {/* Filter 1: Categories (Full Width) */}
          <div className="relative w-full">
            <Filter className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 font-black text-xs sm:text-sm rounded-xl pl-12 pr-4 py-3.5 outline-none cursor-pointer focus:bg-white focus:border-indigo-600 transition-all shadow-2xs"
            >
              <option value="ALL">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Sort By (Full Width) */}
          <div className="relative w-full">
            <ArrowUpDown className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 font-black text-xs sm:text-sm rounded-xl pl-12 pr-4 py-3.5 outline-none cursor-pointer focus:bg-white focus:border-indigo-600 transition-all shadow-2xs"
            >
              <option value="quantity">Trier par Quantités Vendues</option>
              <option value="revenue">Trier par Chiffre d'Affaires</option>
              <option value="name">Trier par Nom Alphabétique</option>
            </select>
          </div>
        </div>

        {/* Row 2: Status Filter Tabs placed SIDE-BY-SIDE HORIZONTALLY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`w-full justify-center px-4 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-2 ${
              activeTab === 'ALL'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4 shrink-0" />
            <span className="truncate">Tous les produits ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DORMANT')}
            className={`w-full justify-center px-4 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-2 ${
              activeTab === 'DORMANT'
                ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Moon className="w-4 h-4 shrink-0 text-purple-600" />
            <span className="truncate">Sans Vente ({dormantProducts.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW CONTENT BASED ON TAB */}

      {/* 1. TAB: PRODUITS DORMANTS (SANS VENTE) */}
      {activeTab === 'DORMANT' && (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 bg-purple-50/80 border-b-2 border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-purple-950 text-base sm:text-lg uppercase tracking-wider">
                  Produits Sans Vente
                </h3>
                <p className="text-xs sm:text-sm text-purple-700 font-semibold mt-0.5">
                  Articles en stock n'ayant enregistré aucune vente récente
                </p>
              </div>
            </div>
          </div>

          {dormantProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Package className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="font-extrabold text-base text-slate-800">
                Aucun produit dormant détecté !
              </p>
              <p className="text-xs sm:text-sm text-slate-400">
                Tous vos produits en stock ont été vendus au moins une fois récemment.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-slate-900">
              {dormantProducts.map((item) => {
                const cat = categories.find((c) => c.id === item.product.categoryId);

                return (
                  <div
                    key={item.product.id}
                    className="p-4 sm:p-5 hover:bg-purple-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 font-bold">
                          <Package className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base break-words whitespace-normal leading-snug">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold flex-wrap">
                          {cat && (
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-extrabold text-xs">
                              {cat.name}
                            </span>
                          )}
                          <span>Prix unit: <span className="font-mono text-slate-700">{formatFCFA(item.product.unitPrice)}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Stock Actuel */}
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Stock Actuel
                        </p>
                        <p className="text-sm sm:text-base font-black text-slate-900 font-mono">
                          {item.stock} unité{item.stock > 1 ? 's' : ''}
                        </p>
                        <p className="text-[11px] text-slate-500 font-bold font-mono">
                          Val: {formatFCFA(item.totalTiedUpCapital)}
                        </p>
                      </div>

                      {/* Inactivité */}
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider border ${
                            item.daysSinceLastSale === null
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {item.daysSinceLastSale === null
                            ? 'Jamais vendu'
                            : `Inactif depuis ${item.daysSinceLastSale}j`}
                        </span>
                        {item.lastSaleDateFormatted && (
                          <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-1">
                            Dernière vente: {item.lastSaleDateFormatted}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: TOUS LES PRODUITS (Performance globale / classement avec barres noires de séparation) */}
      {activeTab === 'ALL' && (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-100 border-b-2 border-slate-300">
            <h3 className="font-black text-sm sm:text-base lg:text-lg text-slate-900 uppercase tracking-wider">
              Classement et performance journalière des produits
            </h3>
          </div>

          {statsList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold text-sm sm:text-base">
              Aucun produit ne correspond à la recherche.
            </div>
          ) : (
            <div className="divide-y-2 divide-slate-900">
              {statsList.map((item, index) => {
                const cat = categories.find((c) => c.id === item.product?.categoryId);
                const percentageOfRevenue =
                  todayActiveRevenue > 0
                    ? ((item.revenue / todayActiveRevenue) * 100).toFixed(1)
                    : '0';

                return (
                  <div
                    key={index}
                    className="p-4 sm:p-5 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <RankBadge rank={index + 1} size="md" />

                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 font-bold">
                          <Package className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base break-words whitespace-normal leading-snug">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold flex-wrap">
                          {cat && (
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-extrabold text-xs">
                              {cat.name}
                            </span>
                          )}
                          {item.product && (
                            <span>Prix unit: <span className="font-mono text-slate-700">{formatFCFA(item.product.unitPrice)}</span></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Qté Vendue
                        </p>
                        <p className="text-sm sm:text-base font-black text-slate-900 font-mono">
                          {item.quantitySold} unité{item.quantitySold > 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                          Revenu Généré
                        </p>
                        <p className="text-sm sm:text-base font-black text-indigo-950 font-mono">
                          {formatFCFA(item.revenue)}
                        </p>
                      </div>

                      <div className="text-right bg-indigo-50/80 px-3.5 py-1.5 rounded-xl border border-indigo-100 shadow-2xs">
                        <p className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                          Part C.A.
                        </p>
                        <p className="text-xs sm:text-sm font-black text-indigo-900 font-mono">
                          {percentageOfRevenue}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. BLOC TOP DES PRODUITS LES PLUS VENDUS (CONTINU ET RESPONSIF AVEC PODIUM) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 lg:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-wider">
              Top des produits les plus vendus
            </h3>
          </div>
        </div>

        {topSalesContinuous.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold text-xs sm:text-sm border border-dashed border-slate-200 rounded-xl">
            Aucune vente enregistrée pour établir le classement continu.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Podium */}
            <TopPodium
              items={topSalesContinuous.slice(0, 3).map((item) => ({
                product: item.product,
                name: item.name,
                quantity: item.quantitySold,
                revenue: item.revenue,
                unitPrice: item.product?.unitPrice,
                imageUrl: item.product?.imageUrl,
              }))}
            />

            {/* Remaining (4th and beyond) */}
            {topSalesContinuous.length > 3 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Suivi du classement
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 w-full">
                  {topSalesContinuous.slice(3, 10).map((item, idx) => {
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

                          {item.product?.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
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
                            {item.product && (
                              <p className="text-xs text-slate-500 font-mono font-semibold mt-0.5">
                                Prix unit. : <AmountDisplay amount={item.product.unitPrice} size="sm" className="text-slate-700 font-bold" />
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Quantity Sold & Total Revenue cleanly organized */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
                          <div className="flex flex-col items-start sm:items-end">
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Volume</span>
                            <span className="text-xs font-black font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-0.5">
                              {item.quantitySold} vendu{item.quantitySold > 1 ? 's' : ''}
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
