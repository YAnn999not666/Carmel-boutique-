import React, { useState } from 'react';
import { Search, Trash2, Receipt, FileText } from 'lucide-react';
import { Sale } from '../types';
import { PaymentBadge } from './PaymentBadge';
import { AmountDisplay } from './AmountDisplay';

interface SalesHistoryProps {
  sales: Sale[];
  onSelectSaleForReceipt: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onClearAllSales: () => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  sales,
  onSelectSaleForReceipt,
  onDeleteSale,
  onClearAllSales,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('Tous');

  // Filtered sales
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.clientName && sale.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sale.paymentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'Tous' || sale.paymentType === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <section className="bg-white rounded-3xl shadow-sm border border-slate-200/90 flex flex-col overflow-hidden h-full">
      {/* Header section */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            Ventes du jour
          </h2>
          <span className="bg-indigo-50 text-indigo-800 font-black text-xs px-2.5 py-0.5 rounded-full border border-indigo-200">
            {sales.length}
          </span>
        </div>

        {/* Clear all action */}
        {sales.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les ventes du jour ?')) {
                onClearAllSales();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 active:scale-[0.98] text-red-700 text-xs font-black border border-red-200 flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Search & Filter bar */}
      <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 transition-all"
          >
            <option value="Tous">Tous les modes</option>
            <option value="Wave">Wave</option>
            <option value="Wave Business">Wave Business</option>
            <option value="OM">Orange Money</option>
            <option value="Cash">Espèces</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      {filteredSales.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs font-bold my-auto">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          {sales.length === 0
            ? 'Aucune vente enregistrée pour le moment.'
            : 'Aucun résultat correspondant à votre recherche.'}
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs font-bold border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
              <tr>
                <th className="p-3">Client / Produit</th>
                <th className="p-3">Mode</th>
                <th className="p-3 text-center">Qté</th>
                <th className="p-3 text-right">Total Net</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredSales.map((sale) => {
                return (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-black text-slate-900 text-sm">
                        {sale.productName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        {sale.clientName ? (
                          <span className="font-semibold">
                            {sale.clientTitle} {sale.clientName}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Paiement Comptant</span>
                        )}
                        <span>•</span>
                        <span>{sale.timeFormatted || sale.timestamp}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <PaymentBadge type={sale.paymentType} size="sm" />
                    </td>

                    <td className="p-3 text-center font-mono font-bold text-slate-900">
                      {sale.quantity}
                    </td>

                    <td className="p-3 text-right">
                      <AmountDisplay
                        amount={sale.totalAmount}
                        size="sm"
                        className="text-indigo-900 font-black"
                      />
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectSaleForReceipt(sale)}
                          title="Imprimer Reçu"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 transition-all cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer la vente "${sale.productName}" ?`)) {
                              onDeleteSale(sale.id);
                            }
                          }}
                          title="Supprimer"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
