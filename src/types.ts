export type PaymentType = 'OM' | 'Wave' | 'Wave Business' | 'Cash';

export type TitleHonorific = 'M.' | 'Mme';

export type AppMode = 'caissier' | 'patron';

export type CashierNavTab = 'home' | 'sales' | 'products' | 'profile';

export type PatronNavTab =
  | 'patron_home'
  | 'patron_products'
  | 'patron_stock'
  | 'patron_cashiers'
  | 'patron_history'
  | 'patron_profile';

export type NavTab = CashierNavTab | PatronNavTab;

export interface Category {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  unitPrice: number;
  stock: number;
  imageUrl?: string;
  categoryId?: string;
  subCategoryId?: string;
}

export interface Sale {
  id: string;
  timestamp: string; // ISO or formatted date-time
  dateFormatted: string; // e.g., "09/08/2026"
  timeFormatted: string; // e.g., "14:15:30"
  cashierName: string;
  paymentType: PaymentType;
  clientTitle?: TitleHonorific;
  clientName?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalAmount: number;
  amountReceived: number;
  changeGiven: number;
  isClosed?: boolean;
}

export interface Cashier {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface DayClosure {
  id: string;
  dateFormatted: string; // e.g., "10/08/2026"
  timestamp: string;
  cashierName: string;
  totalAmount: number;
  salesCount: number;
  waveTotal: number;
  waveBusinessTotal: number;
  orangeMoneyTotal: number;
  cashTotal: number;
}

