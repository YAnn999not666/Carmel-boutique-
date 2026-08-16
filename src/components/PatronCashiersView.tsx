import React, { useState, useEffect } from 'react';
import { Plus, Lock, User, Check, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';
import { Sale, Cashier } from '../types';
import { formatFCFA } from '../utils/formatters';

interface PatronCashiersViewProps {
  sales: Sale[];
  currentCashier: Cashier;
}

interface ExtendedCashier {
  id: string;
  name: string;
  role: string;
  username?: string;
  password?: string;
  avatarUrl?: string;
}

const CASHIERS_STORAGE_KEY = 'frip_cashiers_team';

export const PatronCashiersView: React.FC<PatronCashiersViewProps> = ({
  sales,
  currentCashier,
}) => {
  const [cashiersList, setCashiersList] = useState<ExtendedCashier[]>(() => {
    const saved = localStorage.getItem(CASHIERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'c-1',
        name: currentCashier?.name || 'Caissier Principal',
        role: currentCashier?.role || 'Caissier Principal',
        username: 'caissier1',
        avatarUrl: currentCashier?.avatarUrl,
      },
      {
        id: 'c-2',
        name: 'Caissier Adjoint',
        role: 'Caissier Adjoint',
        username: 'adjoint',
      },
      {
        id: 'c-3',
        name: 'Caissier Réception',
        role: 'Caissier Réception',
        username: 'reception',
      },
    ];
  });

  // Keep first cashier in sync with currentCashier updates (e.g. avatar or name)
  useEffect(() => {
    setCashiersList((prev) => {
      const updated = prev.map((c) => {
        if (c.id === 'c-1' || c.name.toLowerCase() === currentCashier.name.toLowerCase()) {
          return {
            ...c,
            name: currentCashier.name,
            role: currentCashier.role,
            avatarUrl: currentCashier.avatarUrl,
          };
        }
        return c;
      });
      localStorage.setItem(CASHIERS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [currentCashier]);

  // Page Mode: 'LIST' or 'NEW_CASHIER_PAGE'
  const [viewMode, setViewMode] = useState<'LIST' | 'NEW_CASHIER_PAGE'>('LIST');

  const [newCashierName, setNewCashierName] = useState('');
  const [newCashierUsername, setNewCashierUsername] = useState('');
  const [newCashierRole, setNewCashierRole] = useState('Caissier');
  const [newCashierPassword, setNewCashierPassword] = useState('');
  const [newCashierConfirmPassword, setNewCashierConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Compute performance per cashier name
  const getCashierMetrics = (name: string) => {
    const cashierSales = sales.filter(
      (s) => s.cashierName.toLowerCase().trim() === name.toLowerCase().trim()
    );
    const totalRevenue = cashierSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const count = cashierSales.length;

    const wave = cashierSales.filter((s) => s.paymentType === 'Wave').reduce((sum, s) => sum + s.totalAmount, 0);
    const waveBusiness = cashierSales.filter((s) => s.paymentType === 'Wave Business').reduce((sum, s) => sum + s.totalAmount, 0);
    const om = cashierSales.filter((s) => s.paymentType === 'OM').reduce((sum, s) => sum + s.totalAmount, 0);
    const cash = cashierSales.filter((s) => s.paymentType === 'Cash').reduce((sum, s) => sum + s.totalAmount, 0);

    return { totalRevenue, count, wave, waveBusiness, om, cash };
  };

  const handleAddCashier = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedUsername = newCashierUsername.trim() || newCashierName.trim();

    if (!trimmedUsername) {
      setErrorMessage("Veuillez renseigner le nom d'utilisateur.");
      return;
    }
    if (!newCashierPassword) {
      setErrorMessage('Veuillez saisir un mot de passe.');
      return;
    }
    if (newCashierPassword.length < 3) {
      setErrorMessage('Le mot de passe doit contenir au moins 3 caractères.');
      return;
    }
    if (newCashierPassword !== newCashierConfirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    const newCashier: ExtendedCashier = {
      id: `c-${Date.now()}`,
      name: trimmedUsername,
      username: trimmedUsername,
      role: 'Caissier',
      password: newCashierPassword,
    };

    const updated = [...cashiersList, newCashier];
    setCashiersList(updated);
    localStorage.setItem(CASHIERS_STORAGE_KEY, JSON.stringify(updated));

    setSuccessMessage('Nouveau caissier enregistré avec succès !');
    setTimeout(() => {
      setNewCashierName('');
      setNewCashierUsername('');
      setNewCashierRole('Caissier');
      setNewCashierPassword('');
      setNewCashierConfirmPassword('');
      setSuccessMessage('');
      setViewMode('LIST');
    }, 1200);
  };

  const totalBusinessRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  // ==========================================
  // VIEW: NOUVELLE PAGE CRÉATION CAISSIER
  // ==========================================
  if (viewMode === 'NEW_CASHIER_PAGE') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              setSuccessMessage('');
              setViewMode('LIST');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la liste des caissiers</span>
          </button>
        </div>

        {/* Dedicated Page Form Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b-2 border-slate-100">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Nouveau Caissier
            </h2>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border-2 border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5">
              <Check className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleAddCashier} className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ex: Marie ou caissier1"
                  value={newCashierUsername}
                  onChange={(e) => {
                    setNewCashierUsername(e.target.value);
                    setNewCashierName(e.target.value);
                  }}
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-indigo-600 font-bold text-sm sm:text-base rounded-xl pl-12 pr-4 py-3.5 outline-none transition-all shadow-2xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newCashierPassword}
                    onChange={(e) => setNewCashierPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-indigo-600 font-bold text-sm sm:text-base rounded-xl pl-11 pr-11 py-3.5 outline-none transition-all shadow-2xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newCashierConfirmPassword}
                    onChange={(e) => setNewCashierConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-indigo-600 font-bold text-sm sm:text-base rounded-xl pl-11 pr-4 py-3.5 outline-none transition-all shadow-2xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl cursor-pointer transition-all text-center justify-center flex items-center"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer le caissier</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: LISTE DES CAISSIERS
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Gestion & Performance des Caissiers
          </h2>
        </div>

        <button
          onClick={() => {
            setErrorMessage('');
            setSuccessMessage('');
            setViewMode('NEW_CASHIER_PAGE');
          }}
          className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Caissier</span>
        </button>
      </div>

      {/* Cashiers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cashiersList.map((c) => {
          const metrics = getCashierMetrics(c.name);
          const share = totalBusinessRevenue > 0 ? ((metrics.totalRevenue / totalBusinessRevenue) * 100).toFixed(1) : '0';
          const displayAvatar =
            c.id === 'c-1' || c.name.toLowerCase() === currentCashier.name.toLowerCase()
              ? currentCashier.avatarUrl || c.avatarUrl
              : c.avatarUrl;

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm p-6 space-y-4 hover:border-indigo-600 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={c.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-200 shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg truncate">
                    {c.name}
                  </h3>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                    {c.role}
                  </p>
                  {c.username && (
                    <p className="text-[11px] font-bold text-slate-400 font-mono">
                      @{c.username}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Transactions
                  </p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                    {metrics.count} ventes
                  </p>
                </div>

                <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100">
                  <p className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                    Total Encaissé
                  </p>
                  <p className="text-lg sm:text-xl font-black text-indigo-950 font-mono">
                    {formatFCFA(metrics.totalRevenue)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Répartition des règlements
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  <div className="bg-sky-50 p-2.5 rounded-xl text-sky-950 border border-sky-100">
                    Wave: <span className="font-mono">{formatFCFA(metrics.wave)}</span>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-950 border border-blue-100">
                    W. Bus: <span className="font-mono">{formatFCFA(metrics.waveBusiness)}</span>
                  </div>
                  <div className="bg-orange-50 p-2.5 rounded-xl text-orange-950 border border-orange-100">
                    O. Money: <span className="font-mono">{formatFCFA(metrics.om)}</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-950 border border-emerald-100">
                    Cash: <span className="font-mono">{formatFCFA(metrics.cash)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  Part globale : {share}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Statut : Actif
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

