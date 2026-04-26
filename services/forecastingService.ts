import { SalesData, Product } from '../types';

export interface ForecastResult {
  productName: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilStockout: number;
  recommendedReorderDate: string;
  recommendedOrderQty: number;
  trend: 'rising' | 'stable' | 'declining';
  confidence: number; // 0-100
  weeklyForecast: { day: string; predicted: number }[];
}

/**
 * Simple linear regression for trend detection.
 */
function linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0, r2: 0 };

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const yMean = sumY / n;
  const ssRes = data.reduce((acc, y, i) => acc + Math.pow(y - (intercept + slope * i), 2), 0);
  const ssTot = data.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return { slope, intercept, r2 };
}

/**
 * Exponential Moving Average for smoothing.
 */
function ema(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) return [];
  const result = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

/**
 * Computes a per-product velocity weight based on price share and stock level.
 * Products with higher prices capture more revenue share; low-stock products
 * get a boost (they likely sell faster, hence low stock).
 */
function productVelocityWeight(product: Product, allProducts: Product[]): number {
  const totalPrice = allProducts.reduce((sum, p) => sum + p.price, 0);
  const priceShare = totalPrice > 0 ? product.price / totalPrice : 1 / allProducts.length;

  // Stock turnover signal: lower stock relative to median = higher velocity
  const stocks = allProducts.map((p) => p.stock).sort((a, b) => a - b);
  const medianStock = stocks[Math.floor(stocks.length / 2)] || 1;
  const stockFactor =
    medianStock > 0 ? Math.min(2, Math.max(0.5, medianStock / Math.max(product.stock, 1))) : 1;

  // Combine: price share * stock turnover factor, normalized so weights sum ≈ 1
  return priceShare * stockFactor;
}

/**
 * Generates demand forecast for a single product based on per-product sales velocity.
 */
export function forecastProduct(
  product: Product,
  salesData: SalesData[],
  leadTimeDays: number = 5,
  allProducts?: Product[]
): ForecastResult {
  // Per-product velocity weighting (falls back to uniform if no product list)
  const weight =
    allProducts && allProducts.length > 1 ? productVelocityWeight(product, allProducts) : 1;

  const salesValues = salesData.map((s) => Math.max(0, s.sales * weight));

  const { slope, intercept, r2 } = linearRegression(salesValues);
  const smoothed = ema(salesValues);

  // Average daily sales from EMA (most recent value weighted highest)
  const avgDailySales = smoothed.length > 0 ? smoothed[smoothed.length - 1] : 0;

  // Days until stockout
  const daysUntilStockout =
    avgDailySales > 0 ? Math.max(0, Math.floor(product.stock / avgDailySales)) : Infinity;

  // Recommended reorder date (stockout - lead time, but at least today)
  const reorderDays =
    daysUntilStockout === Infinity
      ? 365 // No reorder needed — set far future date
      : Math.max(0, daysUntilStockout - leadTimeDays);
  const reorderDate = new Date();
  reorderDate.setDate(reorderDate.getDate() + reorderDays);

  // Recommended order quantity (cover 30 days of demand + safety stock of 20%)
  const recommendedOrderQty = Math.ceil(avgDailySales * 30 * 1.2);

  // Trend classification
  let trend: 'rising' | 'stable' | 'declining';
  if (slope > 2) trend = 'rising';
  else if (slope < -2) trend = 'declining';
  else trend = 'stable';

  // Confidence based on R-squared and data points
  const confidence = Math.round(Math.min(95, Math.max(30, r2 * 100 * (salesData.length / 7))));

  // 7-day forecast
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0=Sun
  const weeklyForecast = Array.from({ length: 7 }, (_, i) => {
    const predicted = Math.max(0, Math.round(intercept + slope * (salesData.length + i)));
    const dayIdx = (today + i) % 7;
    return {
      day: dayNames[dayIdx === 0 ? 6 : dayIdx - 1],
      predicted,
    };
  });

  return {
    productName: product.name,
    currentStock: product.stock,
    avgDailySales: Math.round(avgDailySales * 10) / 10,
    daysUntilStockout: daysUntilStockout === Infinity ? 999 : daysUntilStockout,
    recommendedReorderDate: reorderDate.toISOString().split('T')[0],
    recommendedOrderQty,
    trend,
    confidence,
    weeklyForecast,
  };
}

/**
 * Generates forecasts for all products.
 */
export function forecastAll(products: Product[], salesData: SalesData[]): ForecastResult[] {
  return products
    .map((p) => forecastProduct(p, salesData, 5, products))
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
}
