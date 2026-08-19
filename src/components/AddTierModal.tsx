import React, { useState } from 'react';
import { X, Plus, Coins } from 'lucide-react';
import { formatPrice } from '../utils/pdfGenerator';

interface AddTierModalProps {
  isOpen: boolean;
  categoryName: string;
  onClose: () => void;
  onAddTier: (price: number) => void;
}

const COMMON_PRICES = [
  500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7500, 8000, 10000, 12000, 15000, 20000,
];

export const AddTierModal: React.FC<AddTierModalProps> = ({
  isOpen,
  categoryName,
  onClose,
  onAddTier,
}) => {
  const [priceInput, setPriceInput] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(priceInput);
    if (!isNaN(priceNum) && priceNum > 0) {
      onAddTier(priceNum);
      setPriceInput('');
      onClose();
    }
  };

  const handleSelectPreset = (price: number) => {
    onAddTier(price);
    setPriceInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Coins className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold break-words leading-tight">
              Nouvelle tranche de prix pour <span className="text-emerald-400">{categoryName}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Prix de la tranche (en FCFA) :
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="50"
                min="0"
                placeholder="Ex: 4500"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 text-xl font-bold border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
              />
              <span className="absolute right-4 text-sm font-bold text-slate-400">FCFA</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Choix rapide :
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {COMMON_PRICES.map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => handleSelectPreset(price)}
                  className="py-2.5 px-2 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 font-bold rounded-xl text-sm border border-slate-200 transition-all font-mono active:scale-95"
                >
                  {formatPrice(price)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!priceInput || isNaN(Number(priceInput)) || Number(priceInput) <= 0}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter le prix</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
