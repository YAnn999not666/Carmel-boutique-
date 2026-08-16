import React from 'react';
import { Home, Receipt, Package, User, LayoutDashboard, TrendingUp, Users, Boxes } from 'lucide-react';
import { NavTab, AppMode } from '../types';

interface NavbarProps {
  mode: AppMode;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  salesCount: number;
  productsCount: number;
  lowStockCount?: number;
}

interface TabItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: number | null;
  badgeColor?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  activeTab,
  onSelectTab,
  salesCount,
  productsCount,
  lowStockCount = 0,
}) => {
  const cashierTabs: TabItem[] = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      badge: null,
    },
    {
      id: 'sales',
      label: 'Ventes',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'products',
      label: 'Produits',
      icon: Package,
      badge: null,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      badge: null,
    },
  ];

  const patronTabs: TabItem[] = [
    {
      id: 'patron_home',
      label: 'Accueil',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'patron_products',
      label: 'Suiv du CL',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'patron_stock',
      label: 'Stock',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'patron_cashiers',
      label: 'Caissiers',
      icon: Users,
      badge: null,
    },
    {
      id: 'patron_history',
      label: 'Hist. & C.A',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'patron_profile',
      label: 'Profil',
      icon: User,
      badge: null,
    },
  ];

  const tabs = mode === 'patron' ? patronTabs : cashierTabs;

  return (
    <nav className="min-[900px]:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg py-2 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer min-h-[44px] active:scale-95 ${
                isActive
                  ? mode === 'patron'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {tab.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      tab.badgeColor || (isActive ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white')
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="truncate max-w-[65px] sm:max-w-none text-[9px] sm:text-[11px] leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
