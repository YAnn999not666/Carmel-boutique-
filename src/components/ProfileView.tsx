import React, { useState, useRef } from 'react';
import { Edit2, Save, CheckCircle2, Camera, LogOut, X } from 'lucide-react';
import { Cashier, Sale } from '../types';
import { formatFCFA } from '../utils/formatters';

interface ProfileViewProps {
  cashier: Cashier;
  sales: Sale[];
  onUpdateCashierName: (newName: string) => void;
  onUpdateCashierAvatar?: (avatarUrl: string) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  cashier,
  sales,
  onUpdateCashierName,
  onUpdateCashierAvatar,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(cashier.name);
  const [savedMessage, setSavedMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const cashRevenue = sales.filter((s) => s.paymentType === 'Cash').reduce((acc, s) => acc + s.totalAmount, 0);
  const mobileRevenue = totalRevenue - cashRevenue;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateCashierName(nameInput.trim());
      setIsEditing(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && onUpdateCashierAvatar) {
          onUpdateCashierAvatar(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dedicated Name Edit Screen
  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-slate-300 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
              <Edit2 className="w-6 h-6 text-indigo-600" />
              <span>Modifier le nom</span>
            </h2>
          </div>

          <form onSubmit={handleSaveName} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
                Nom d'utilisateur / Caissier
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex: Cécile V."
                autoFocus
                required
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-5 py-4 font-black text-slate-900 text-lg sm:text-xl outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-2xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNameInput(cashier.name);
                  setIsEditing(false);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-6">
          {/* Avatar Container with Camera Upload Button */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-indigo-600 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-md border-2 border-indigo-200 overflow-hidden">
              {cashier.avatarUrl ? (
                <img
                  src={cashier.avatarUrl}
                  alt={cashier.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{cashier.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Camera Button strictly at the bottom right of the frame */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-md border-2 border-white transition-all cursor-pointer flex items-center justify-center"
              title="Changer la photo de profil"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Cashier Info - Name & Edit Action Perfectly Centered & Aligned */}
          <div className="flex flex-col items-center sm:items-start justify-center flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={handleSaveName} className="flex items-center justify-center sm:justify-start gap-2 pt-1 w-full max-w-md">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-slate-50 border-2 border-indigo-500 rounded-xl px-4 py-2 font-black text-slate-900 text-lg outline-none w-full"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {cashier.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs flex items-center justify-center shrink-0"
                  title="Modifier le nom"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-xs font-black uppercase text-indigo-700 tracking-wider mt-1.5 font-mono">
              Rôle: Caissier
            </p>

            {savedMessage && (
              <p className="text-xs font-black text-emerald-600 flex items-center justify-center sm:justify-start gap-1 mt-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Nom mis à jour avec succès !</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Session Stats Grid - Stacked Vertically on Desktop & Mobile */}
      <div className="flex flex-col gap-5">
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Ventes Réalisées
          </span>
          <span className="text-3xl font-black text-slate-900 font-mono">
            {totalSalesCount}
          </span>
        </div>

        {/* Cash Sales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
            Encaissements Espèces
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
            {formatFCFA(cashRevenue)}
          </span>
        </div>

        {/* Mobile Money Sales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs font-black text-indigo-800 uppercase tracking-wider">
            Encaissements Mobile
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono">
            {formatFCFA(mobileRevenue)}
          </span>
        </div>
      </div>

      {/* Logout Action Button */}
      {onLogout && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-4 px-6 rounded-2xl bg-red-50 hover:bg-red-100 active:scale-[0.99] border-2 border-red-200 text-red-700 hover:text-red-800 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span>Se déconnecter</span>
          </button>
        </div>
      )}
    </div>
  );
};
