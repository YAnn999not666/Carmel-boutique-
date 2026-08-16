import React, { useState } from 'react';
import { KeyRound, User, AlertCircle, ArrowRight } from 'lucide-react';
import { AppMode } from '../types';

interface AuthModalProps {
  onLogin: (mode: AppMode, userName: string) => void;
  currentCashierName?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin, currentCashierName = 'Caissier' }) => {
  const [activeTab, setActiveTab] = useState<AppMode>('caissier');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (mode: AppMode) => {
    setActiveTab(mode);
    setUsername('');
    setPassword('');
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
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Branding */}
        <div className="bg-slate-900 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            Boutique du Carmel
          </h2>
        </div>

        {/* Role Selector Tabs (Swipe style) */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleTabChange('caissier')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'caissier'
                  ? 'bg-white text-indigo-700 shadow-md scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Caissier</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('patron')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'patron'
                  ? 'bg-white text-emerald-700 shadow-md scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Patron</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs font-bold text-red-700 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-indigo-600 text-slate-900 font-bold text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:bg-white focus:border-indigo-600 text-slate-900 font-bold text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                activeTab === 'caissier'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
            >
              <span>Se Connecter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
