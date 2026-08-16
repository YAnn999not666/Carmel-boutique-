import React, { useState, useRef } from 'react';
import { Edit2, Save, CheckCircle2, Camera, LogOut, TrendingUp, X } from 'lucide-react';
import { Sale, Product } from '../types';
import { formatFCFA } from '../utils/formatters';

interface PatronProfileViewProps {
  patronName: string;
  patronAvatarUrl?: string;
  sales: Sale[];
  products: Product[];
  onUpdatePatronName: (newName: string) => void;
  onUpdatePatronAvatar?: (avatarUrl: string) => void;
  onLogout?: () => void;
}

export const PatronProfileView: React.FC<PatronProfileViewProps> = ({
  patronName,
  patronAvatarUrl,
  sales,
  products,
  onUpdatePatronName,
  onUpdatePatronAvatar,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(patronName);
  const [savedMessage, setSavedMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalSalesCount = sales.length;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdatePatronName(nameInput.trim());
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
        if (reader.result && onUpdatePatronAvatar) {
          onUpdatePatronAvatar(reader.result as string);
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
              <Edit2 className="w-6 h-6 text-emerald-700" />
              <span>Modifier le nom</span>
            </h2>
          </div>

          <form onSubmit={handleSaveName} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
                Nom complet / Titre
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex: M. le Directeur"
                autoFocus
                required
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-5 py-4 font-black text-slate-900 text-lg sm:text-xl outline-none focus:bg-white focus:border-emerald-600 transition-all shadow-2xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNameInput(patronName);
                  setIsEditing(false);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          {/* Avatar Container with Camera Upload Button */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-700 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-md border-2 border-emerald-300 overflow-hidden">
              {patronAvatarUrl ? (
                <img
                  src={patronAvatarUrl}
                  alt={patronName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{patronName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Camera Button at the bottom right */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl shadow-md border-2 border-white transition-all cursor-pointer flex items-center justify-center"
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

          {/* Patron Info - Name & Edit Action Perfectly Centered & Aligned */}
          <div className="flex flex-col items-center sm:items-start justify-center flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {patronName}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setNameInput(patronName);
                  setIsEditing(true);
                }}
                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 bg-slate-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs flex items-center justify-center shrink-0"
                title="Modifier le nom"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-black uppercase text-emerald-700 tracking-wider mt-1.5 font-mono">
              Rôle: Propriétaire / Patron
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

      {/* Logout Action (Se déconnecter) */}
      {onLogout && (
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto px-8 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      )}
    </div>
  );
};

