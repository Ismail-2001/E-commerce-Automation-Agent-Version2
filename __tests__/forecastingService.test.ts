import { forecastProduct } from '../services/forecastingService';
import type { Product, SalesData } from '../types';

describe('forecastingService', () => {
  const product: Product = {
    id: 'P1', name: 'Test Product', category: 'Test', price: 50,
    stock: 100, status: 'In Stock', image: '',
  };

  it('calculates days until stockout correctly', () => {
    const salesData: SalesData[] = [
      { name: 'Mon', sales: 10, revenue: 500 },
      { name: 'Tue', sales: 10, revenue: 500 },
      { name: 'Wed', sales: 10, revenue: 500 },
    ];
    const forecast = forecastProduct(product, salesData);
    expect(forecast.daysUntilStockout).toBeGreaterThan(5);
    expect(forecast.daysUntilStockout).toBeLessThan(20);
  });

  it('returns 999 for zero sales', () => {
    const salesData: SalesData[] = [
      { name: 'Mon', sales: 0, revenue: 0 },
      { name: 'Tue', sales: 0, revenue: 0 },
    ];
    const forecast = forecastProduct(product, salesData);
    expect(forecast.daysUntilStockout).toBe(999);
  });

  it('detects rising trend', () => {
    const salesData: SalesData[] = [
      { name: 'Mon', sales: 5, revenue: 250 },
      { name: 'Tue', sales: 10, revenue: 500 },
      { name: 'Wed', sales: 15, revenue: 750 },
      { name: 'Thu', sales: 20, revenue: 1000 },
      { name: 'Fri', sales: 25, revenue: 1250 },
    ];
    const forecast = forecastProduct(product, salesData);
    expect(forecast.trend).toBe('rising');
  });

  it('detects declining trend', () => {
    const salesData: SalesData[] = [
      { name: 'Mon', sales: 25, revenue: 1250 },
      { name: 'Tue', sales: 20, revenue: 1000 },
      { name: 'Wed', sales: 15, revenue: 750 },
      { name: 'Thu', sales: 10, revenue: 500 },
      { name: 'Fri', sales: 5, revenue: 250 },
    ];
    const forecast = forecastProduct(product, salesData);
    expect(forecast.trend).toBe('declining');
  });

  it('produces 7-day forecast', () => {
    const salesData: SalesData[] = [
      { name: 'Mon', sales: 10, revenue: 500 },
      { name: 'Tue', sales: 12, revenue: 600 },
      { name: 'Wed', sales: 8, revenue: 400 },
    ];
    const forecast = forecastProduct(product, salesData);
    expect(forecast.weeklyForecast).toHaveLength(7);
  });

  it('recommends reorder quantity proportional to demand', () => {
    const salesData: SalesData[] = [
      { name: 'Mon', sales: 20, revenue: 1000 },
      { name: 'Tue', sales: 20, revenue: 1000 },
      { name: 'Wed', sales: 20, revenue: 1000 },
    ];
    const forecast = forecastProduct(product, salesData);
    expect(forecast.recommendedOrderQty).toBeGreaterThan(500);
  });

  it('confidence is between 0 and 100', () => {
    const salesData: SalesData[] = [
      { name: 'Mon', sales: 10, revenue: 500 },
      { name: 'Tue', sales: 15, revenue: 750 },
    ];
    const forecast = forecastProduct(product, salesData);
    expect(forecast.confidence).toBeGreaterThanOrEqual(0);
    expect(forecast.confidence).toBeLessThanOrEqual(100);
  });
});
