import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AppMode } from '../types';

interface AuthModalProps {
  onLogin: (mode: AppMode, userName: string) => void;
  currentCashierName?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin, currentCashierName = 'Caissier' }) => {
  const [activeTab, setActiveTab] = useState<AppMode>('caissier');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (mode: AppMode) => {
    setActiveTab(mode);
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (activeTab === 'caissier') {
      if (trimmedUser === '1' && trimmedPass === '2') {
        onLogin('caissier', currentCashierName || 'Caissier');
      } else {
        setError('Identifiant ou mot de passe incorrect.');
      }
    } else if (activeTab === 'patron') {
      if (trimmedUser === '3' && trimmedPass === '4') {
        onLogin('patron', 'M. le Directeur');
      } else {
        setError('Identifiant ou mot de passe incorrect.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/75 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-slate-200/90 overflow-hidden my-auto transition-all">
        {/* Top Header Branding */}
        <div className="pt-8 pb-6 px-6 text-center relative bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          {/* Elegant Monogram / Emblem */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-950 text-amber-300 flex items-center justify-center shadow-lg shadow-indigo-950/15 border border-indigo-800/40 mb-3.5">
            <span className="font-serif italic font-black text-2xl tracking-wider select-none">
              BC
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Boutique du Carmel
          </h2>
        </div>

        {/* Role Selector Tabs (Segmented Control) */}
        <div className="p-6 sm:p-7 space-y-6">
          <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleTabChange('caissier')}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'caissier'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Caissier</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('patron')}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'patron'
                  ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Patron</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50/90 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-red-700 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre identifiant"
                  required
                  autoFocus
                  className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-slate-900 font-bold text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-slate-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-slate-900 font-bold text-sm rounded-xl pl-10 pr-11 py-3 outline-none transition-all placeholder:text-slate-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer rounded-lg focus:outline-none"
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] ${
                  activeTab === 'caissier'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 hover:shadow-indigo-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30'
                }`}
              >
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
