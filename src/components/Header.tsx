import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Cashier, AppMode } from '../types';

interface HeaderProps {
  cashier: Cashier;
  mode: AppMode;
  userName?: string;
  patronAvatarUrl?: string;
  isOnline?: boolean;
  isSyncing?: boolean;
  pendingCount?: number;
  onOpenSyncModal?: () => void;
  onNavigateToProfile?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cashier,
  mode,
  userName,
  patronAvatarUrl,
  isOnline = true,
  isSyncing = false,
  pendingCount = 0,
  onOpenSyncModal,
  onNavigateToProfile,
}) => {
  const displayName = mode === 'patron' ? (userName || 'M. le Directeur') : cashier.name;
  const currentAvatar = mode === 'patron' ? patronAvatarUrl : cashier.avatarUrl;

  return (
    <header className="flex items-center justify-between bg-white/90 backdrop-blur-md text-slate-900 py-2.5 px-4 sm:px-6 rounded-2xl shadow-sm border border-slate-200/80 ring-1 ring-slate-900/5 transition-all">
      {/* Left: Artistic BC Logo */}
      <div className="flex items-center gap-3">
        <span className="font-serif italic font-black text-3xl sm:text-4xl tracking-widest text-indigo-950 select-none drop-shadow-2xs">
          BC
        </span>
        <span className="hidden sm:inline-block h-6 w-px bg-slate-200" />
        <span className="hidden sm:inline-block text-xs font-black uppercase tracking-wider text-slate-400">
          Boutique du Carmel
        </span>
      </div>

      {/* Center/Right: Network & Sync Status + User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Offline / Sync Status Pill Button */}
        <button
          onClick={onOpenSyncModal}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
            isSyncing
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : !isOnline
              ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
              : pendingCount > 0
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100/80'
          }`}
          title="Consulter l'état du stockage local et de la synchronisation"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Synchronisation...</span>
            </>
          ) : !isOnline ? (
            <span>Hors-ligne {pendingCount > 0 && `(${pendingCount})`}</span>
          ) : pendingCount > 0 ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>À synchroniser ({pendingCount})</span>
            </>
          ) : (
            <span>En ligne</span>
          )}
        </button>

        {/* User Profile */}
        <div
          onClick={onNavigateToProfile}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          title="Accéder au profil"
        >
          <div
            className={`w-9 h-9 rounded-xl text-white font-black text-sm flex items-center justify-center shadow-2xs overflow-hidden border ${
              mode === 'patron'
                ? 'bg-emerald-700 border-emerald-800'
                : 'bg-indigo-600 border-indigo-700'
            }`}
          >
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="text-right">
            <p className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
              {displayName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};


