import { analyzePricing } from '../services/pricingAgent';
import type { Product, SalesData } from '../types';

describe('pricingAgent', () => {
  const mockSalesData: SalesData[] = [
    { name: 'Mon', sales: 24, revenue: 2400 },
    { name: 'Tue', sales: 18, revenue: 1398 },
  ];

  it('recommends price decrease for overstocked products', () => {
    const products: Product[] = [
      { id: 'P1', name: 'Bulk Item', category: 'Test', price: 100, stock: 200, status: 'In Stock', image: '' },
    ];
    const result = analyzePricing(products, mockSalesData);
    expect(result[0].strategy).toBe('decrease');
    expect(result[0].suggestedPrice).toBeLessThan(100);
  });

  it('recommends price increase for low-stock products', () => {
    const products: Product[] = [
      { id: 'P2', name: 'Rare Item', category: 'Test', price: 50, stock: 3, status: 'Low Stock', image: '' },
    ];
    const result = analyzePricing(products, mockSalesData);
    expect(result[0].strategy).toBe('increase');
    expect(result[0].suggestedPrice).toBeGreaterThan(50);
  });

  it('holds price for healthy stock levels', () => {
    const products: Product[] = [
      { id: 'P3', name: 'Normal Item', category: 'Test', price: 75, stock: 50, status: 'In Stock', image: '' },
    ];
    const result = analyzePricing(products, mockSalesData);
    expect(result[0].strategy).toBe('hold');
    expect(result[0].suggestedPrice).toBe(75);
  });

  it('defers pricing change for out-of-stock products', () => {
    const products: Product[] = [
      { id: 'P4', name: 'Gone Item', category: 'Test', price: 30, stock: 0, status: 'Out of Stock', image: '' },
    ];
    const result = analyzePricing(products, mockSalesData);
    expect(result[0].strategy).toBe('hold');
    expect(result[0].reason).toContain('out of stock');
  });

  it('discount scales deterministically with stock level', () => {
    const lowStock: Product[] = [
      { id: 'P5', name: 'Low', category: 'Test', price: 100, stock: 101, status: 'In Stock', image: '' },
    ];
    const highStock: Product[] = [
      { id: 'P6', name: 'High', category: 'Test', price: 100, stock: 200, status: 'In Stock', image: '' },
    ];
    const lowResult = analyzePricing(lowStock, mockSalesData);
    const highResult = analyzePricing(highStock, mockSalesData);
    expect(highResult[0].suggestedPrice).toBeLessThan(lowResult[0].suggestedPrice);
  });

  it('returns same result on repeated calls (deterministic)', () => {
    const products: Product[] = [
      { id: 'P7', name: 'Test', category: 'Test', price: 80, stock: 150, status: 'In Stock', image: '' },
    ];
    const result1 = analyzePricing(products, mockSalesData);
    const result2 = analyzePricing(products, mockSalesData);
    expect(result1[0].suggestedPrice).toBe(result2[0].suggestedPrice);
  });
});
