import { Sale, Product } from '../types';

export type PeriodType = 'today' | 'week' | 'month';

export interface PeriodComparison {
  period: PeriodType;
  periodLabel: string;
  previousPeriodLabel: string;
  currentRevenue: number;
  previousRevenue: number;
  currentSalesCount: number;
  previousSalesCount: number;
  percentChange: number | null;
  isIncrease: boolean;
  isDecrease: boolean;
  waveTotal: number;
  waveBusinessTotal: number;
  orangeMoneyTotal: number;
  cashTotal: number;
}

export interface DormantProduct {
  product: Product;
  stock: number;
  daysSinceLastSale: number | null; // null if never sold
  lastSaleDateFormatted?: string;
  totalTiedUpCapital: number;
}

/**
 * Safely parses a sale timestamp or dateFormatted into a Date object
 */
export function parseSaleDate(sale: Sale): Date {
  if (sale.timestamp) {
    const d = new Date(sale.timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  if (sale.dateFormatted) {
    const parts = sale.dateFormatted.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);
      if (!isNaN(dateObj.getTime())) return dateObj;
    }
  }
  return new Date();
}

/**
 * Computes revenue and comparisons for a given period ('today' | 'week' | 'month')
 */
export function computePeriodStats(
  sales: Sale[],
  period: PeriodType,
  refDate: Date = new Date()
): PeriodComparison {
  const now = new Date(refDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  let currentStart: Date;
  let currentEnd: Date;
  let previousStart: Date;
  let previousEnd: Date;
  let periodLabel = "Aujourd'hui";
  let previousPeriodLabel = 'hier';

  if (period === 'today') {
    periodLabel = "Aujourd'hui";
    previousPeriodLabel = 'hier';

    currentStart = todayStart;
    currentEnd = todayEnd;

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    previousStart = yesterdayStart;
    previousEnd = yesterdayEnd;
  } else if (period === 'week') {
    periodLabel = 'Cette semaine';
    previousPeriodLabel = 'la semaine dernière';

    // 7 rolling days up to end of today
    currentStart = new Date(todayStart);
    currentStart.setDate(currentStart.getDate() - 6);
    currentEnd = todayEnd;

    previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 7);
    previousEnd = new Date(currentStart);
    previousEnd.setMilliseconds(-1);
  } else {
    // month
    periodLabel = 'Ce mois';
    previousPeriodLabel = 'le mois dernier';

    // Current month from 1st of month to today
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    currentEnd = todayEnd;

    // Previous month full calendar month
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  }

  // Filter current sales
  const currentSales = sales.filter((s) => {
    const d = parseSaleDate(s);
    return d >= currentStart && d <= currentEnd;
  });

  // Filter previous sales
  const previousSales = sales.filter((s) => {
    const d = parseSaleDate(s);
    return d >= previousStart && d <= previousEnd;
  });

  const currentRevenue = currentSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const previousRevenue = previousSales.reduce((sum, s) => sum + s.totalAmount, 0);

  const waveTotal = currentSales.filter((s) => s.paymentType === 'Wave').reduce((sum, s) => sum + s.totalAmount, 0);
  const waveBusinessTotal = currentSales.filter((s) => s.paymentType === 'Wave Business').reduce((sum, s) => sum + s.totalAmount, 0);
  const orangeMoneyTotal = currentSales.filter((s) => s.paymentType === 'OM').reduce((sum, s) => sum + s.totalAmount, 0);
  const cashTotal = currentSales.filter((s) => s.paymentType === 'Cash').reduce((sum, s) => sum + s.totalAmount, 0);

  let percentChange: number | null = null;
  if (previousRevenue > 0) {
    percentChange = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);
  } else if (currentRevenue > 0) {
    percentChange = 100;
  } else {
    percentChange = 0;
  }

  return {
    period,
    periodLabel,
    previousPeriodLabel,
    currentRevenue,
    previousRevenue,
    currentSalesCount: currentSales.length,
    previousSalesCount: previousSales.length,
    percentChange,
    isIncrease: (percentChange ?? 0) > 0,
    isDecrease: (percentChange ?? 0) < 0,
    waveTotal,
    waveBusinessTotal,
    orangeMoneyTotal,
    cashTotal,
  };
}

/**
 * Identifies dormant products (in stock > 0, but no sales in the last 30 days)
 */
export function getDormantProducts(
  products: Product[],
  sales: Sale[],
  refDate: Date = new Date()
): DormantProduct[] {
  const now = new Date(refDate);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dormantList: DormantProduct[] = [];

  products.forEach((product) => {
    // Must have available stock
    if (product.stock <= 0) return;

    // Get all sales for this product
    const productSales = sales.filter(
      (s) => s.productName.toLowerCase().trim() === product.name.toLowerCase().trim()
    );

    // Sales in the last 30 days
    const recentSales = productSales.filter((s) => parseSaleDate(s) >= thirtyDaysAgo);

    if (recentSales.length === 0) {
      // Find the most recent sale overall in history
      let daysSinceLastSale: number | null = null;
      let lastSaleDateFormatted: string | undefined = undefined;

      if (productSales.length > 0) {
        // Sort descending by date
        const sortedSales = [...productSales].sort(
          (a, b) => parseSaleDate(b).getTime() - parseSaleDate(a).getTime()
        );
        const lastSale = sortedSales[0];
        const lastSaleDate = parseSaleDate(lastSale);
        const diffMs = now.getTime() - lastSaleDate.getTime();
        daysSinceLastSale = Math.max(1, Math.floor(diffMs / (1000 * 3600 * 24)));
        lastSaleDateFormatted = lastSale.dateFormatted;
      }

      dormantList.push({
        product,
        stock: product.stock,
        daysSinceLastSale,
        lastSaleDateFormatted,
        totalTiedUpCapital: product.stock * product.unitPrice,
      });
    }
  });

  // Sort by days since last sale (descending) or stock value
  return dormantList.sort((a, b) => {
    if (a.daysSinceLastSale === null && b.daysSinceLastSale !== null) return -1;
    if (a.daysSinceLastSale !== null && b.daysSinceLastSale === null) return 1;
    if (a.daysSinceLastSale !== null && b.daysSinceLastSale !== null) {
      return b.daysSinceLastSale - a.daysSinceLastSale;
    }
    return b.totalTiedUpCapital - a.totalTiedUpCapital;
  });
}
