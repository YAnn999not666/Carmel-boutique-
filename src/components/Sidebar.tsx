import React from 'react';
import { Home, Receipt, Package, User, LayoutDashboard, TrendingUp, Users, Boxes } from 'lucide-react';
import { NavTab, AppMode } from '../types';

interface SidebarProps {
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

export const Sidebar: React.FC<SidebarProps> = ({
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
      label: 'Suivi du classement',
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
      label: 'Historique et C.A',
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
    <aside className="hidden min-[900px]:flex flex-col w-60 shrink-0 select-none">
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                isActive
                  ? mode === 'patron'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{tab.label}</span>
              </div>

              {tab.badge !== null && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    tab.badgeColor ||
                    (isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100')
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
