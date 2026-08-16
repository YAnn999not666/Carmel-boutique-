import React, { useState } from 'react';
import {
  Search,
  Receipt,
  FileText,
  Calendar,
  Filter,
  X,
  Lock,
  CheckCircle2,
  ChevronRight,
  Coins,
  Tag,
  TrendingUp,
  Clock,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Sale, PaymentType } from '../types';
import { formatFCFA } from '../utils/formatters';
import { PaymentBadge } from './PaymentBadge';
import { AmountDisplay } from './AmountDisplay';
import { exportSalesToCSV, exportSalesToPDF } from '../utils/exportUtils';

interface SalesListProps {
  sales: Sale[];
  closedDates?: string[];
  onSelectSaleForReceipt: (sale: Sale) => void;
  onDeleteSale?: (id: string) => void;
  onClearAllSales?: () => void;
  compact?: boolean;
  isPatron?: boolean;
}

// Helper to format YYYY-MM-DD to DD/MM/YYYY
function formatDateFR(yyyyMmDd: string): string {
  if (!yyyyMmDd) return '';
  const parts = yyyyMmDd.split('-');
  if (parts.length === 3) {
    const day = parts[2];
    const month = parts[1];
    const year = parts[0];
    return `${day}/${month}/${year}`;
  }
  return yyyyMmDd;
}

// Helper to convert DD/MM/YYYY, DD-MM-YYYY, or timestamp to YYYY-MM-DD for accurate date filtering
function parseFormattedDateToYYYYMMDD(dateFormatted: string, timestamp?: string): string {
  if (dateFormatted && typeof dateFormatted === 'string') {
    const cleanDate = dateFormatted.trim();
    if (cleanDate.includes('/')) {
      const parts = cleanDate.split('/');
      if (parts.length === 3) {
        // Format is STRICTLY DD/MM/YYYY (jj/MM/aaaa)
        const day = parts[0].trim().padStart(2, '0');
        const month = parts[1].trim().padStart(2, '0');
        let year = parts[2].trim();
        if (year.length === 2) year = `20${year}`;
        return `${year}-${month}-${day}`;
      }
    }
    if (cleanDate.includes('-')) {
      const parts = cleanDate.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          // DD-MM-YYYY
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      return cleanDate.substring(0, 10);
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

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get time of day period label
function getTimePeriod(timeFormatted: string): { label: string; bg: string; text: string } {
  if (!timeFormatted) return { label: 'Journée', bg: 'bg-slate-100', text: 'text-slate-700' };
  const hour = parseInt(timeFormatted.split(':')[0], 10);
  if (isNaN(hour)) return { label: 'Journée', bg: 'bg-slate-100', text: 'text-slate-700' };

  if (hour >= 6 && hour < 12) {
    return { label: 'Matinée', bg: 'bg-amber-50', text: 'text-amber-800' };
  } else if (hour >= 12 && hour < 18) {
    return { label: 'Après-midi', bg: 'bg-sky-50', text: 'text-sky-800' };
  } else {
    return { label: 'Soirée', bg: 'bg-indigo-50', text: 'text-indigo-800' };
  }
}

const getTodayYYYYMMDD = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayYYYYMMDD = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFirstDayOfMonthYYYYMMDD = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

export const SalesList: React.FC<SalesListProps> = ({
  sales,
  closedDates = [],
  onSelectSaleForReceipt,
  compact = false,
  isPatron = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('Tous');

  // Default to TODAY's date filter as requested
  const [startDate, setStartDate] = useState<string>(getTodayYYYYMMDD());
  const [endDate, setEndDate] = useState<string>(getTodayYYYYMMDD());

  // Quick Date Presets
  const handleSetToday = () => {
    const today = getTodayYYYYMMDD();
    setStartDate(today);
    setEndDate(today);
  };

  const handleSetYesterday = () => {
    const yest = getYesterdayYYYYMMDD();
    setStartDate(yest);
    setEndDate(yest);
  };

  const handleSetThisMonth = () => {
    setStartDate(getFirstDayOfMonthYYYYMMDD());
    setEndDate(getTodayYYYYMMDD());
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  // Filter logic
  const filteredSales = sales.filter((sale) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      sale.productName.toLowerCase().includes(term) ||
      (sale.clientName && sale.clientName.toLowerCase().includes(term)) ||
      sale.cashierName.toLowerCase().includes(term) ||
      sale.paymentType.toLowerCase().includes(term) ||
      sale.id.toLowerCase().includes(term);

    const matchesFilter = filterType === 'Tous' || sale.paymentType === filterType;

    // Date range filtering
    const saleDateYYYYMMDD = parseFormattedDateToYYYYMMDD(sale.dateFormatted, sale.timestamp);
    let matchesDate = true;

    if (compact) {
      // In compact mode (Home page), display all active unclosed sales until "Clôturer la journée" is clicked
      matchesDate = !sale.isClosed;
    } else {
      if (startDate && saleDateYYYYMMDD < startDate) {
        matchesDate = false;
      }
      if (endDate && saleDateYYYYMMDD > endDate) {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  // Total displayed sum reflects the current date range / interval and filters!
  const totalFilteredSum = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Compact Mode Render for Home Page Right Column
  if (compact) {
    return (
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4 w-full">
        {/* Compact Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 text-base uppercase tracking-wider">
              Ventes du Jour
            </h3>
            <span className="bg-indigo-50 text-indigo-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
              {filteredSales.length}
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:bg-white focus:border-indigo-600 transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs rounded-xl px-3 py-2 outline-none cursor-pointer focus:bg-white focus:border-indigo-600 transition-all"
          >
            <option value="Tous">Tous modes</option>
            <option value="Wave">Wave</option>
            <option value="Wave Business">Wave Business</option>
            <option value="OM">OM</option>
            <option value="Cash">Espèces</option>
          </select>
        </div>

        {/* Compact Sales List */}
        {filteredSales.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-2xl">
            Aucune vente enregistrée aujourd'hui.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredSales.map((sale) => {
              const period = getTimePeriod(sale.timeFormatted);

              return (
                <div
                  key={sale.id}
                  className="bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-3.5 transition-all flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        #{sale.id.slice(-6)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-extrabold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {sale.timeFormatted}
                      </span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.2 rounded ${period.bg} ${period.text}`}
                      >
                        {period.label}
                      </span>
                      <PaymentBadge type={sale.paymentType} size="sm" useShortLabel={true} />
                    </div>

                    <div className="font-black text-xs sm:text-sm text-slate-900 break-words line-clamp-2 leading-snug">
                      {sale.productName}{' '}
                      <span className="text-indigo-600 font-black">x{sale.quantity}</span>
                    </div>

                    {sale.clientName && (
                      <div className="text-xs font-bold text-slate-500 break-words">
                        Client:{' '}
                        <span className="text-slate-800">
                          {sale.clientTitle} {sale.clientName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 pt-0.5">
                    <AmountDisplay
                      amount={sale.totalAmount}
                      size="sm"
                      className="text-slate-900 font-black bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => onSelectSaleForReceipt(sale)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Reçu</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Group filtered sales into Date Blocks
  const salesByDateMap = new Map<
    string,
    { dateFormatted: string; dateYYYYMMDD: string; items: Sale[] }
  >();

  filteredSales.forEach((sale) => {
    const dateKey = sale.dateFormatted || 'Inconnue';
    const dateYYYYMMDD = parseFormattedDateToYYYYMMDD(sale.dateFormatted, sale.timestamp);
    if (!salesByDateMap.has(dateKey)) {
      salesByDateMap.set(dateKey, { dateFormatted: dateKey, dateYYYYMMDD, items: [] });
    }
    salesByDateMap.get(dateKey)!.items.push(sale);
  });

  // Convert map to array and sort date groups descending (newest first)
  const dateGroups = Array.from(salesByDateMap.values()).sort((a, b) => {
    return b.dateYYYYMMDD.localeCompare(a.dateYYYYMMDD);
  });

  // Dynamic Revenue Banner for Patron Mode
  let dynamicBannerLabel = "Le chiffre d'affaires du jour est :";
  const todayStr = getTodayYYYYMMDD();
  const yestStr = getYesterdayYYYYMMDD();

  if (!startDate && !endDate) {
    dynamicBannerLabel = "Le chiffre d'affaires global est :";
  } else if (startDate === todayStr && endDate === todayStr) {
    dynamicBannerLabel = "Le chiffre d'affaires du jour est :";
  } else if (startDate === yestStr && endDate === yestStr) {
    dynamicBannerLabel = `Le chiffre d'affaires d'hier (${formatDateFR(startDate)}) est :`;
  } else if (startDate && endDate && startDate === endDate) {
    dynamicBannerLabel = `Le chiffre d'affaires du ${formatDateFR(startDate)} est :`;
  } else if (startDate && endDate && startDate !== endDate) {
    dynamicBannerLabel = `Le chiffre d'affaires du ${formatDateFR(startDate)} au ${formatDateFR(endDate)} est :`;
  } else if (startDate && !endDate) {
    dynamicBannerLabel = `Le chiffre d'affaires à partir du ${formatDateFR(startDate)} est :`;
  } else if (!startDate && endDate) {
    dynamicBannerLabel = `Le chiffre d'affaires jusqu'au ${formatDateFR(endDate)} est :`;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
          <Receipt className="w-7 h-7 text-indigo-600" />
          <span>{isPatron ? 'Historique et C.A' : 'Historique'}</span>
        </h2>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => exportSalesToCSV(filteredSales, isPatron ? 'ventes_patron' : 'ventes_caissier')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
            title="Exporter la sélection au format Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() =>
              exportSalesToPDF(filteredSales, {
                title: isPatron ? 'Rapport Financier des Ventes' : 'Historique des Ventes',
                subtitle: `Sélection : ${filteredSales.length} transaction(s)`,
                filenamePrefix: isPatron ? 'rapport_patron' : 'rapport_ventes',
              })
            }
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Exporter le rapport imprimable au format PDF"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* BANNIÈRE DYNAMIQUE C.A. POUR LE PATRON */}
      {isPatron && (
        <div className="bg-white p-5 sm:p-6 lg:p-7 rounded-3xl border-2 border-indigo-600 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-black uppercase text-indigo-700 tracking-wider">
              {dynamicBannerLabel}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Cumul des ventes sur la sélection ({filteredSales.length} transaction
              {filteredSales.length > 1 ? 's' : ''})
            </p>
          </div>
          <AmountDisplay
            amount={totalFilteredSum}
            size="4xl"
            className="text-indigo-950 font-extrabold"
            currencyClassName="text-indigo-600"
          />
        </div>
      )}

      {/* Search & Date Filter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/90 space-y-4">
        {/* Row 1: Search + Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2 relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par produit, client, caissier, référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-sm sm:text-base rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-black text-sm rounded-2xl px-4 py-3.5 outline-none cursor-pointer focus:bg-white focus:border-indigo-600 transition-all shadow-2xs"
            >
              <option value="Tous">Tous les modes de règlement</option>
              <option value="Wave">Wave (W)</option>
              <option value="Wave Business">Wave Business (WB)</option>
              <option value="OM">OM (Orange Money)</option>
              <option value="Cash">Cash (Espèces)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date Filters & Interval */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider shrink-0">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Intervalle :</span>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs">
              <span className="text-xs font-black text-slate-500 uppercase">Du</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-black text-slate-900 outline-none cursor-pointer"
                title="Format jj/mm/aaaa"
              />
              {startDate && (
                <span className="text-[11px] font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {formatDateFR(startDate)}
                </span>
              )}
            </div>

            {/* End Date */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs">
              <span className="text-xs font-black text-slate-500 uppercase">Au</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-black text-slate-900 outline-none cursor-pointer"
                title="Format jj/mm/aaaa"
              />
              {endDate && (
                <span className="text-[11px] font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {formatDateFR(endDate)}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <button
              type="button"
              onClick={handleSetToday}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black active:scale-[0.98] transition-all cursor-pointer border ${
                startDate === getTodayYYYYMMDD() && endDate === getTodayYYYYMMDD()
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
              }`}
            >
              Aujourd'hui
            </button>

            <button
              type="button"
              onClick={handleSetYesterday}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black active:scale-[0.98] transition-all cursor-pointer border ${
                startDate === getYesterdayYYYYMMDD() && endDate === getYesterdayYYYYMMDD()
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              Hier
            </button>

            <button
              type="button"
              onClick={handleSetThisMonth}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 transition-all cursor-pointer"
            >
              Ce mois
            </button>

            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleClearDates}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-[0.98] text-slate-900 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Tout afficher</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DATE BLOCKS DISPLAY */}
      {dateGroups.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 text-sm font-bold border border-slate-200/90 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          {sales.length === 0
            ? 'Aucune vente enregistrée aujourd\'hui.'
            : 'Aucun enregistrement ne correspond aux dates ou filtres sélectionnés.'}
        </div>
      ) : (
        <div className="space-y-6">
          {dateGroups.map((group) => {
            const blockTotal = group.items.reduce((sum, s) => sum + s.totalAmount, 0);
            const blockGlobalDiscounts = group.items.reduce((sum, s) => sum + s.discount, 0);

            const waveTotal = group.items
              .filter((s) => s.paymentType === 'Wave')
              .reduce((sum, s) => sum + s.totalAmount, 0);
            const waveBusinessTotal = group.items
              .filter((s) => s.paymentType === 'Wave Business')
              .reduce((sum, s) => sum + s.totalAmount, 0);
            const omTotal = group.items
              .filter((s) => s.paymentType === 'OM')
              .reduce((sum, s) => sum + s.totalAmount, 0);
            const cashTotal = group.items
              .filter((s) => s.paymentType === 'Cash')
              .reduce((sum, s) => sum + s.totalAmount, 0);

            return (
              <div
                key={group.dateFormatted}
                className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden space-y-0"
              >
                {/* DATE BLOCK HEADER */}
                <div className="bg-slate-50 border-b border-slate-200/80 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span>Journée du {group.dateFormatted}</span>
                      </span>
                    </div>

                    {/* Breakdown by Payment Mode with Clear Logos & Labels (W, WB, OM, Cash) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-slate-700">
                      <span className="font-black text-slate-400 uppercase tracking-wider text-[10px]">
                        Répartition :
                      </span>
                      {waveTotal > 0 && (
                        <div className="flex items-center gap-1.5 bg-sky-50/90 hover:bg-sky-100 px-2.5 py-1 rounded-xl border border-sky-200 shadow-2xs transition-colors">
                          <PaymentBadge type="Wave" size="sm" useShortLabel={true} />
                          <AmountDisplay amount={waveTotal} size="sm" className="text-sky-950 font-black" />
                        </div>
                      )}
                      {waveBusinessTotal > 0 && (
                        <div className="flex items-center gap-1.5 bg-blue-50/90 hover:bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-200 shadow-2xs transition-colors">
                          <PaymentBadge type="Wave Business" size="sm" useShortLabel={true} />
                          <AmountDisplay amount={waveBusinessTotal} size="sm" className="text-blue-950 font-black" />
                        </div>
                      )}
                      {omTotal > 0 && (
                        <div className="flex items-center gap-1.5 bg-orange-50/90 hover:bg-orange-100 px-2.5 py-1 rounded-xl border border-orange-200 shadow-2xs transition-colors">
                          <PaymentBadge type="OM" size="sm" useShortLabel={true} />
                          <AmountDisplay amount={omTotal} size="sm" className="text-orange-950 font-black" />
                        </div>
                      )}
                      {cashTotal > 0 && (
                        <div className="flex items-center gap-1.5 bg-emerald-50/90 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs transition-colors">
                          <PaymentBadge type="Cash" size="sm" useShortLabel={true} />
                          <AmountDisplay amount={cashTotal} size="sm" className="text-emerald-950 font-black" />
                        </div>
                      )}
                      {blockGlobalDiscounts > 0 && (
                        <span className="bg-amber-50 text-amber-950 px-2.5 py-1 rounded-xl border border-amber-200 font-extrabold text-xs shadow-2xs flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-amber-700" />
                          Réductions: -{formatFCFA(blockGlobalDiscounts)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Block Total Badge */}
                  <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl text-right shrink-0 shadow-2xs">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Total du jour ({group.items.length} vente{group.items.length > 1 ? 's' : ''})
                    </span>
                    <AmountDisplay
                      amount={blockTotal}
                      size="2xl"
                      className="text-indigo-900 font-extrabold"
                      currencyClassName="text-indigo-600"
                    />
                  </div>
                </div>

                {/* DATE BLOCK SALES TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className="bg-slate-100/90 text-slate-700 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-4 whitespace-nowrap">Réf / ID</th>
                        <th className="p-4 whitespace-nowrap">Période & Heure</th>
                        <th className="p-4 whitespace-nowrap">Caissier</th>
                        <th className="p-4 whitespace-nowrap">Mode de Paiement</th>
                        <th className="p-4 whitespace-nowrap">Client</th>
                        <th className="p-4 whitespace-nowrap">Produit</th>
                        <th className="p-4 text-center whitespace-nowrap">Qté</th>
                        <th className="p-4 text-right whitespace-nowrap">Prix Unit.</th>
                        <th className="p-4 text-right whitespace-nowrap">Réduction</th>
                        <th className="p-4 text-right whitespace-nowrap">Montant Total</th>
                        <th className="p-4 text-right whitespace-nowrap">Montant Reçu</th>
                        <th className="p-4 text-right whitespace-nowrap">Monnaie Rendue</th>
                        {!isPatron && <th className="p-4 text-center whitespace-nowrap">Reçu</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-900 font-extrabold">
                      {group.items.map((sale) => {
                        const period = getTimePeriod(sale.timeFormatted);

                        return (
                          <tr key={sale.id} className="hover:bg-indigo-50/40 transition-colors">
                            {/* ID */}
                            <td className="p-4 font-mono text-xs sm:text-sm font-black text-indigo-900 whitespace-nowrap">
                              #{sale.id.slice(-6)}
                            </td>

                            {/* Heure + Time slot badge */}
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-black px-1.5 py-0.5 rounded ${period.bg} ${period.text}`}
                                >
                                  {period.label}
                                </span>
                                <span className="font-mono text-xs font-bold text-slate-700">
                                  {sale.timeFormatted}
                                </span>
                              </div>
                            </td>

                            {/* Caissier */}
                            <td className="p-4 whitespace-nowrap font-black text-slate-900">
                              {sale.cashierName}
                            </td>

                            {/* Mode de Paiement with Minimalist Logo */}
                            <td className="p-4 whitespace-nowrap">
                              <PaymentBadge type={sale.paymentType} size="md" />
                            </td>

                            {/* Client */}
                            <td className="p-4 whitespace-nowrap">
                              {sale.clientName ? (
                                <span className="font-black text-indigo-950">
                                  {sale.clientTitle} {sale.clientName}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold italic text-xs">
                                  Anonyme
                                </span>
                              )}
                            </td>

                            {/* Produit */}
                            <td className="p-4 font-black text-slate-900 whitespace-nowrap">
                              {sale.productName}
                            </td>

                            {/* Qté */}
                            <td className="p-4 text-center font-mono font-black text-slate-900 whitespace-nowrap">
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                                {sale.quantity}
                              </span>
                            </td>

                            {/* Prix Unitaire */}
                            <td className="p-4 text-right whitespace-nowrap">
                              <AmountDisplay amount={sale.unitPrice} size="sm" className="text-slate-700" />
                            </td>

                            {/* Réduction */}
                            <td className="p-4 text-right whitespace-nowrap">
                              {sale.discount > 0 ? (
                                <span className="text-amber-700 font-mono font-bold">
                                  -<AmountDisplay amount={sale.discount} size="sm" className="text-amber-700" />
                                </span>
                              ) : (
                                <span className="text-slate-300 font-mono text-xs">0</span>
                              )}
                            </td>

                            {/* Total Amount */}
                            <td className="p-4 text-right whitespace-nowrap">
                              <AmountDisplay
                                amount={sale.totalAmount}
                                size="base"
                                className="text-indigo-950 font-black"
                              />
                            </td>

                            {/* Amount Received */}
                            <td className="p-4 text-right whitespace-nowrap">
                              <AmountDisplay
                                amount={sale.amountReceived}
                                size="sm"
                                className="text-slate-700"
                              />
                            </td>

                            {/* Change Given */}
                            <td className="p-4 text-right whitespace-nowrap">
                              {sale.changeGiven > 0 ? (
                                <AmountDisplay
                                  amount={sale.changeGiven}
                                  size="sm"
                                  className="text-emerald-700 font-black"
                                />
                              ) : (
                                <span className="text-slate-300 font-mono text-xs">0</span>
                              )}
                            </td>

                            {/* Actions: ONLY Receipt button if NOT patron */}
                            {!isPatron && (
                              <td className="p-4 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => onSelectSaleForReceipt(sale)}
                                  title="Imprimer Reçu"
                                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                >
                                  <Receipt className="w-4 h-4" />
                                  <span>Reçu</span>
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
