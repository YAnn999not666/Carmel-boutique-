import React, { useState } from 'react';
import { Package, AlertTriangle, Boxes, Search } from 'lucide-react';
import { Product, Category, SubCategory } from '../types';
import { formatFCFA } from '../utils/formatters';

interface PatronStockViewProps {
  products: Product[];
  categories?: Category[];
  subCategories?: SubCategory[];
}

export const PatronStockView: React.FC<PatronStockViewProps> = ({
  products,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  // Total Metrics
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.unitPrice, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Filtered Products
  let filtered = products;

  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (statusFilter === 'LOW') {
    filtered = filtered.filter((p) => p.stock > 0 && p.stock <= 10);
  } else if (statusFilter === 'OUT') {
    filtered = filtered.filter((p) => p.stock === 0);
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards (Same visible typography style as Historique) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Total Produits</span>
            <Boxes className="w-6 h-6 text-indigo-600 shrink-0" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{products.length}</p>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1.5">
            {totalStockItems} unités en inventaire
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Valeur du Stock</span>
            <Package className="w-6 h-6 text-emerald-600 shrink-0" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-tight">
            {formatFCFA(totalStockValue)}
          </p>
          <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-1.5">Prix de vente total</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-amber-200 shadow-sm bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Stock Faible</span>
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900 font-mono tracking-tight">{lowStockCount}</p>
          <p className="text-xs sm:text-sm font-bold text-amber-700 mt-1.5">Sous le seuil d'alerte (≤10)</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-red-200 shadow-sm bg-red-50/20">
          <div className="flex items-center justify-between text-red-800 mb-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Rupture de Stock</span>
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-900 font-mono tracking-tight">{outOfStockCount}</p>
          <p className="text-xs sm:text-sm font-bold text-red-700 mt-1.5">Produits épuisés (0 unité)</p>
        </div>
      </div>

      {/* Main Stock Table Container */}
      <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl border-2 border-slate-200/90 shadow-sm space-y-5">
        <div className="pb-1">
          <h3 className="font-black text-slate-900 text-lg sm:text-xl uppercase tracking-wider">
            État & Suivi du Stock
          </h3>
        </div>

        {/* Filter Toolbar: Full width search bar on top, then filter tabs directly below */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100">
          <div className="relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Chercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-indigo-600 font-bold text-xs sm:text-sm rounded-xl pl-12 pr-4 py-3.5 outline-none transition-all shadow-2xs text-slate-900"
            />
          </div>

          <div className="w-full flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black mb-1 transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-2xs'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {products.length}
              </span>
              <span>Tous</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('LOW')}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'LOW'
                  ? 'bg-white text-amber-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black mb-1 transition-all ${
                  statusFilter === 'LOW'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                    : 'bg-amber-100/70 text-amber-800'
                }`}
              >
                {lowStockCount}
              </span>
              <span>Faible</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('OUT')}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'OUT'
                  ? 'bg-white text-rose-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black mb-1 transition-all ${
                  statusFilter === 'OUT'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs'
                    : 'bg-rose-100/70 text-rose-800'
                }`}
              >
                {outOfStockCount}
              </span>
              <span>Rupture</span>
            </button>
          </div>
        </div>

        {/* Stock List with black dividers */}
        <div className="divide-y-2 divide-slate-900 pt-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold text-sm">
              Aucun produit trouvé.
            </div>
          ) : (
            filtered.map((product) => {
              const isOut = product.stock === 0;
              const isLow = product.stock > 0 && product.stock <= 10;

              return (
                <div
                  key={product.id}
                  className="py-4 px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/90 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 font-bold shadow-2xs">
                        <Package className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-slate-900 text-sm sm:text-base break-words whitespace-normal leading-snug">
                        {product.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 font-mono mt-0.5">
                        Prix: <span className="font-black text-slate-800">{formatFCFA(product.unitPrice)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Stock actuel
                      </span>
                      <span
                        className={`font-black text-sm sm:text-base font-mono ${
                          isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                        }`}
                      >
                        {product.stock} {product.stock > 1 ? 'unités' : 'unité'}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs ${
                        isOut
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : isLow
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isOut ? 'Rupture' : isLow ? 'Stock faible' : 'En Stock'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
