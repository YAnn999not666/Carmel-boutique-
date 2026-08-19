import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TotalsBanner } from './components/TotalsBanner';
import { RegistrationForm } from './components/RegistrationForm';
import { CloseDaySection } from './components/CloseDaySection';
import { SalesList } from './components/SalesList';
import { ProductsView } from './components/ProductsView';
import { ProfileView } from './components/ProfileView';
import { ReceiptModal } from './components/ReceiptModal';
import { SplashScreen } from './components/SplashScreen';
import { AuthModal } from './components/AuthModal';
import { PatronHomeView } from './components/PatronHomeView';
import { PatronProductsView } from './components/PatronProductsView';
import { PatronStockView } from './components/PatronStockView';
import { PatronCashiersView } from './components/PatronCashiersView';
import { PatronProfileView } from './components/PatronProfileView';
import { Sale, Cashier, Product, NavTab, Category, SubCategory, AppMode } from './types';
import { formatDateTime, formatToFrenchDate } from './utils/formatters';

const SALES_STORAGE_KEY = 'boutique_du_carmel_sales_v2';
const PRODUCTS_STORAGE_KEY = 'boutique_du_carmel_products_v2';
const CASHIER_STORAGE_KEY = 'boutique_du_carmel_cashier_v2';
const PATRON_PROFILE_STORAGE_KEY = 'boutique_du_carmel_patron_profile_v1';
const CLOSED_DATES_STORAGE_KEY = 'boutique_du_carmel_closed_dates_v2';
const CATEGORIES_STORAGE_KEY = 'boutique_du_carmel_categories_v1';
const SUBCATEGORIES_STORAGE_KEY = 'boutique_du_carmel_subcategories_v1';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Authentication & Mode State ('caissier' | 'patron' | null)
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<string>('');

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [formResetKey, setFormResetKey] = useState<number>(0);

  // Categories & SubCategories State
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'cat-1', name: 'Alimentation' },
      { id: 'cat-2', name: 'Hygiène & Soins' },
      { id: 'cat-3', name: 'Chaussures & Habillement' },
    ];
  });

  const [subCategories, setSubCategories] = useState<SubCategory[]>(() => {
    try {
      const saved = localStorage.getItem(SUBCATEGORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'subcat-1', categoryId: 'cat-1', name: 'Riz & Céréales' },
      { id: 'subcat-2', categoryId: 'cat-1', name: 'Huiles & Condiments' },
      { id: 'subcat-3', categoryId: 'cat-2', name: 'Savons' },
      { id: 'subcat-4', categoryId: 'cat-3', name: 'Basket' },
    ];
  });

  // Closed Dates State for "Clôturer la journée"
  const [closedDates, setClosedDates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CLOSED_DATES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Connected Cashier
  const [cashier, setCashier] = useState<Cashier>(() => {
    try {
      const saved = localStorage.getItem(CASHIER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      name: 'Caissier',
      role: 'Caissier Principal',
    };
  });

  // Patron Profile State
  const [patronProfile, setPatronProfile] = useState<{ name: string; avatarUrl?: string }>(() => {
    try {
      const saved = localStorage.getItem(PATRON_PROFILE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      name: 'M. le Directeur',
    };
  });

  const handleUpdatePatronName = (newName: string) => {
    const updated = { ...patronProfile, name: newName };
    setPatronProfile(updated);
    setAuthenticatedUser(newName);
    localStorage.setItem(PATRON_PROFILE_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleUpdatePatronAvatar = (avatarUrl: string) => {
    const updated = { ...patronProfile, avatarUrl };
    setPatronProfile(updated);
    localStorage.setItem(PATRON_PROFILE_STORAGE_KEY, JSON.stringify(updated));
  };

  // Products Catalog State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'prod-1',
        name: 'Sac de Riz Parfumé 25kg',
        unitPrice: 18500,
        stock: 15,
        categoryId: 'cat-1',
      },
      {
        id: 'prod-2',
        name: 'Huile Dinor 5L',
        unitPrice: 8500,
        stock: 20,
        categoryId: 'cat-1',
      },
      {
        id: 'prod-3',
        name: 'Carton Savon Cacao',
        unitPrice: 12500,
        stock: 8,
        categoryId: 'cat-2',
      },
      {
        id: 'prod-4',
        name: 'Sandales en Cuir Artisanales',
        unitPrice: 15000,
        stock: 12,
        categoryId: 'cat-3',
      },
      {
        id: 'prod-5',
        name: "Confiture d'Hibiscus 500g",
        unitPrice: 3500,
        stock: 18,
        categoryId: 'cat-1',
      },
      {
        id: 'prod-6',
        name: "Chapelet en Bois d'Ébène",
        unitPrice: 5000,
        stock: 25,
        categoryId: 'cat-3',
      },
    ];
  });

  // Sales State
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(SALES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const now = new Date();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const fortyDaysAgo = new Date(now);
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

    return [
      // Sales Today
      {
        id: 'sale-101',
        timestamp: now.toISOString(),
        dateFormatted: formatToFrenchDate(now),
        timeFormatted: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cashierName: 'Caissier',
        paymentType: 'OM',
        clientTitle: 'M.',
        clientName: 'Kouassi Jean',
        productName: 'Sac de Riz Parfumé 25kg',
        quantity: 1,
        unitPrice: 18500,
        discount: 500,
        totalAmount: 18000,
        amountReceived: 20000,
        changeGiven: 2000,
      },
      {
        id: 'sale-102',
        timestamp: now.toISOString(),
        dateFormatted: formatToFrenchDate(now),
        timeFormatted: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cashierName: 'Caissier',
        paymentType: 'Wave',
        clientTitle: 'Mme',
        clientName: 'Diallo Aïcha',
        productName: 'Huile Dinor 5L',
        quantity: 2,
        unitPrice: 8500,
        discount: 0,
        totalAmount: 17000,
        amountReceived: 17000,
        changeGiven: 0,
      },
      {
        id: 'sale-103',
        timestamp: now.toISOString(),
        dateFormatted: formatToFrenchDate(now),
        timeFormatted: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cashierName: 'Caissier',
        paymentType: 'Cash',
        productName: 'Carton Savon Cacao',
        quantity: 1,
        unitPrice: 12500,
        discount: 0,
        totalAmount: 12500,
        amountReceived: 15000,
        changeGiven: 2500,
      },
      // Sales Yesterday (for comparison: 38 000 FCFA vs Today 47 500 FCFA -> +25%)
      {
        id: 'sale-099',
        timestamp: yesterday.toISOString(),
        dateFormatted: formatToFrenchDate(yesterday),
        timeFormatted: '16:20:00',
        cashierName: 'Caissier',
        paymentType: 'Wave Business',
        clientName: 'Koné Bakary',
        productName: 'Sac de Riz Parfumé 25kg',
        quantity: 1,
        unitPrice: 18500,
        discount: 0,
        totalAmount: 18500,
        amountReceived: 18500,
        changeGiven: 0,
      },
      {
        id: 'sale-098',
        timestamp: yesterday.toISOString(),
        dateFormatted: formatToFrenchDate(yesterday),
        timeFormatted: '11:15:00',
        cashierName: 'Caissier',
        paymentType: 'Cash',
        clientName: 'Koffi Paul',
        productName: 'Huile Dinor 5L',
        quantity: 1,
        unitPrice: 8500,
        discount: 0,
        totalAmount: 8500,
        amountReceived: 10000,
        changeGiven: 1500,
      },
      {
        id: 'sale-097',
        timestamp: yesterday.toISOString(),
        dateFormatted: formatToFrenchDate(yesterday),
        timeFormatted: '09:40:00',
        cashierName: 'Caissier',
        paymentType: 'OM',
        clientName: 'N\'Guessan Marie',
        productName: 'Carton Savon Cacao',
        quantity: 1,
        unitPrice: 11000,
        discount: 0,
        totalAmount: 11000,
        amountReceived: 11000,
        changeGiven: 0,
      },
      // Sale 40 days ago (so Sandales en Cuir were sold 40 days ago and now dormant)
      {
        id: 'sale-050',
        timestamp: fortyDaysAgo.toISOString(),
        dateFormatted: formatToFrenchDate(fortyDaysAgo),
        timeFormatted: '15:10:00',
        cashierName: 'Caissier',
        paymentType: 'Cash',
        clientName: 'Yao Bernard',
        productName: 'Sandales en Cuir Artisanales',
        quantity: 1,
        unitPrice: 15000,
        discount: 0,
        totalAmount: 15000,
        amountReceived: 15000,
        changeGiven: 0,
      },
    ];
  });

  // Receipt Modal State
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  // LocalStorage persistence
  useEffect(() => {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(CASHIER_STORAGE_KEY, JSON.stringify(cashier));
  }, [cashier]);

  useEffect(() => {
    localStorage.setItem(CLOSED_DATES_STORAGE_KEY, JSON.stringify(closedDates));
  }, [closedDates]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(SUBCATEGORIES_STORAGE_KEY, JSON.stringify(subCategories));
  }, [subCategories]);

  // Handlers for Category & SubCategory creation on the fly
  const handleAddCategory = (name: string): Category => {
    const trimmed = name.trim();
    const existing = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const created: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
    };
    setCategories((prev) => [...prev, created]);
    return created;
  };

  const handleAddSubCategory = (categoryId: string, name: string): SubCategory => {
    const trimmed = name.trim();
    const existing = subCategories.find(
      (sc) => sc.categoryId === categoryId && sc.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;
    const created: SubCategory = {
      id: `subcat-${Date.now()}`,
      categoryId,
      name: trimmed,
    };
    setSubCategories((prev) => [...prev, created]);
    return created;
  };

  // Aggregate totals (filtered for active unclosed sales on home view until "Clôturer la journée" is clicked)
  const todayFormatted = formatToFrenchDate(new Date());
  const activeHomeSales = sales.filter((s) => !s.isClosed);
  const isTodayClosed = closedDates.includes(todayFormatted);

  const totalAmount = activeHomeSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const waveTotal = activeHomeSales.filter((s) => s.paymentType === 'Wave').reduce((sum, s) => sum + s.totalAmount, 0);
  const waveBusinessTotal = activeHomeSales.filter((s) => s.paymentType === 'Wave Business').reduce((sum, s) => sum + s.totalAmount, 0);
  const orangeMoneyTotal = activeHomeSales.filter((s) => s.paymentType === 'OM').reduce((sum, s) => sum + s.totalAmount, 0);
  const cashTotal = activeHomeSales.filter((s) => s.paymentType === 'Cash').reduce((sum, s) => sum + s.totalAmount, 0);

  // Handler: Close Day
  const handleCloseDay = () => {
    // Flag all unclosed sales as closed
    setSales((prev) =>
      prev.map((s) => ({
        ...s,
        isClosed: true,
      }))
    );
    if (!closedDates.includes(todayFormatted)) {
      setClosedDates((prev) => [...prev, todayFormatted]);
    }
    setFormResetKey((prev) => prev + 1);
  };

  // Handler: Add new sale(s)
  const handleAddSale = (
    newSaleData:
      | Omit<Sale, 'id' | 'timestamp' | 'dateFormatted' | 'timeFormatted' | 'cashierName'>
      | Omit<Sale, 'id' | 'timestamp' | 'dateFormatted' | 'timeFormatted' | 'cashierName'>[]
  ) => {
    const itemsArray = Array.isArray(newSaleData) ? newSaleData : [newSaleData];
    const now = new Date();
    const dateFormatted = formatToFrenchDate(now);
    const timeFormatted = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timestamp = formatDateTime(now);

    const createdSales: Sale[] = itemsArray.map((item, idx) => ({
      ...item,
      id: `sale-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      dateFormatted,
      timeFormatted,
      cashierName: cashier.name,
    }));

    setSales((prev) => [...createdSales, ...prev]);

    // Deduct stock for each item sold
    setProducts((prev) =>
      prev.map((prod) => {
        const matchingItems = itemsArray.filter(
          (item) => item.productName.toLowerCase() === prod.name.toLowerCase()
        );
        if (matchingItems.length > 0) {
          const totalQtySold = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
          return {
            ...prod,
            stock: Math.max(0, prod.stock - totalQtySold),
          };
        }
        return prod;
      })
    );
  };

  // Handler: Delete sale
  const handleDeleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  // Handler: Clear all sales
  const handleClearAllSales = () => {
    setSales([]);
  };

  // Handler: Add new product
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [created, ...prev]);
  };

  // Handler: Delete product
  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Handler: Update product
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  // Handler: Select product for quick sale
  const handleSelectProductForSale = (product: Product) => {
    setActiveTab('home');
  };

  // Handler: Update Cashier Name
  const handleUpdateCashierName = (newName: string) => {
    setCashier((prev) => {
      const updated = { ...prev, name: newName };
      localStorage.setItem(CASHIER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setAuthenticatedUser(newName);
  };

  // Handler: Update Cashier Avatar
  const handleUpdateCashierAvatar = (avatarUrl: string) => {
    setCashier((prev) => {
      const updated = { ...prev, avatarUrl };
      localStorage.setItem(CASHIER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Auth Handlers
  const handleLogin = (mode: AppMode, userName: string) => {
    setAppMode(mode);
    if (mode === 'patron') {
      const resolvedName = patronProfile.name || userName || 'M. le Directeur';
      setAuthenticatedUser(resolvedName);
      setActiveTab('patron_home');
    } else {
      setAuthenticatedUser(userName || cashier.name);
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    setAppMode(null);
    setAuthenticatedUser('');
  };

  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!appMode) {
    return <AuthModal onLogin={handleLogin} currentCashierName={cashier.name} />;
  }

  return (
    <div className="min-h-screen min-[900px]:h-screen min-[900px]:overflow-hidden bg-slate-100/90 text-slate-900 font-sans flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Top Header (Fixed at top on desktop) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 shrink-0 z-30">
        <Header
          cashier={cashier}
          mode={appMode}
          userName={appMode === 'patron' ? patronProfile.name : authenticatedUser}
          patronAvatarUrl={patronProfile.avatarUrl}
          onNavigateToProfile={() => setActiveTab(appMode === 'patron' ? 'patron_profile' : 'profile')}
          onLogout={handleLogout}
        />
      </div>

      {/* 2. Main Content Area + Sidebar for desktop: Sidebar stays immobile, right panel scrolls */}
      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 min-[900px]:pb-5 flex flex-col min-[900px]:flex-row gap-6 min-[900px]:overflow-hidden">
        {/* Sidebar for >=900px (Immobile, stays fixed on screen) */}
        <Sidebar
          mode={appMode}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          salesCount={sales.length}
          productsCount={products.length}
          lowStockCount={lowStockCount}
        />

        {/* Main View Area (Independently scrolling on desktop) */}
        <main className="flex-1 min-w-0 w-full min-[900px]:h-full min-[900px]:overflow-y-auto min-[900px]:pr-1 pb-6">
          {/* ========================================= */}
          {/* PATRON MODE VIEWS                         */}
          {/* ========================================= */}
          {appMode === 'patron' && (
            <>
              {/* PATRON HOME: ACCUEIL / VUE D'ENSEMBLE */}
              {activeTab === 'patron_home' && (
                <PatronHomeView
                  products={products}
                  sales={sales}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {/* PATRON PRODUCTS: SUIVI PRODUITS */}
              {activeTab === 'patron_products' && (
                <PatronProductsView
                  products={products}
                  sales={sales}
                  categories={categories}
                  subCategories={subCategories}
                  onNavigate={setActiveTab}
                />
              )}

              {/* PATRON STOCK */}
              {activeTab === 'patron_stock' && (
                <PatronStockView
                  products={products}
                  categories={categories}
                  subCategories={subCategories}
                />
              )}

              {/* PATRON CAISSIERS */}
              {activeTab === 'patron_cashiers' && (
                <PatronCashiersView
                  sales={sales}
                  currentCashier={cashier}
                />
              )}

              {/* PATRON HISTORIQUE */}
              {activeTab === 'patron_history' && (
                <SalesList
                  sales={sales}
                  closedDates={closedDates}
                  onSelectSaleForReceipt={setSelectedSaleForReceipt}
                  onDeleteSale={handleDeleteSale}
                  onClearAllSales={handleClearAllSales}
                  isPatron={true}
                />
              )}

              {/* PATRON PROFILE */}
              {activeTab === 'patron_profile' && (
                <PatronProfileView
                  patronName={patronProfile.name}
                  patronAvatarUrl={patronProfile.avatarUrl}
                  sales={sales}
                  products={products}
                  onUpdatePatronName={handleUpdatePatronName}
                  onUpdatePatronAvatar={handleUpdatePatronAvatar}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}

          {/* ========================================= */}
          {/* CAISSIER MODE VIEWS                       */}
          {/* ========================================= */}
          {appMode === 'caissier' && (
            <>
              {/* HOME VIEW */}
              {activeTab === 'home' && (
                <div className="space-y-6">
                  {/* 1. BANDEAU DES TOTAUX ET MODES DE PAIEMENT */}
                  <TotalsBanner
                    totalAmount={totalAmount}
                    waveTotal={waveTotal}
                    waveBusinessTotal={waveBusinessTotal}
                    orangeMoneyTotal={orangeMoneyTotal}
                    cashTotal={cashTotal}
                    totalSalesCount={activeHomeSales.length}
                    onCloseDay={handleCloseDay}
                    isTodayClosed={isTodayClosed}
                  />

                  {/* 2. FORMULAIRE NOUVELLE VENTE */}
                  <RegistrationForm
                    onAddSale={handleAddSale}
                    products={products}
                    formResetKey={formResetKey}
                  />

                  {/* 3. VENTES DU JOUR (LISTE) - Directement sous Nouvelle Vente */}
                  <SalesList
                    sales={sales}
                    closedDates={closedDates}
                    onSelectSaleForReceipt={setSelectedSaleForReceipt}
                    onDeleteSale={handleDeleteSale}
                    onClearAllSales={handleClearAllSales}
                    compact={true}
                  />

                  {/* 4. BOUTON CLÔTURER LA JOURNÉE */}
                  <div className="w-full flex justify-center pt-2">
                    <CloseDaySection
                      onCloseDay={handleCloseDay}
                      isTodayClosed={isTodayClosed}
                    />
                  </div>
                </div>
              )}

              {/* SALES / HISTORIQUE VIEW */}
              {activeTab === 'sales' && (
                <SalesList
                  sales={sales}
                  closedDates={closedDates}
                  onSelectSaleForReceipt={setSelectedSaleForReceipt}
                  onDeleteSale={handleDeleteSale}
                  onClearAllSales={handleClearAllSales}
                />
              )}

              {/* PRODUCTS VIEW */}
              {activeTab === 'products' && (
                <ProductsView
                  products={products}
                  categories={categories}
                  subCategories={subCategories}
                  onAddCategory={handleAddCategory}
                  onAddSubCategory={handleAddSubCategory}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onSelectProductForSale={handleSelectProductForSale}
                />
              )}

              {/* PROFILE VIEW */}
              {activeTab === 'profile' && (
                <ProfileView
                  cashier={cashier}
                  sales={sales}
                  onUpdateCashierName={handleUpdateCashierName}
                  onUpdateCashierAvatar={handleUpdateCashierAvatar}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. Bottom Navigation Bar (Fixed at bottom on mobile <900px) */}
      <Navbar
        mode={appMode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        salesCount={sales.length}
        productsCount={products.length}
        lowStockCount={lowStockCount}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        sale={selectedSaleForReceipt}
        cashier={cashier}
        onClose={() => setSelectedSaleForReceipt(null)}
      />
    </div>
  );
}

