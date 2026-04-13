import { analyzeSupplierNeeds } from '../services/supplierAgent';
import type { Product } from '../types';

describe('supplierAgent', () => {
  it('flags out-of-stock as critical reorder', () => {
    const products: Product[] = [
      { id: 'P1', name: 'Empty', category: 'Test', price: 100, stock: 0, status: 'Out of Stock', image: '' },
    ];
    const result = analyzeSupplierNeeds(products);
    expect(result[0].action).toBe('reorder');
    expect(result[0].urgency).toBe('critical');
    expect(result[0].suggestedQuantity).toBe(100);
  });

  it('flags low stock as high priority reorder', () => {
    const products: Product[] = [
      { id: 'P2', name: 'Low', category: 'Test', price: 50, stock: 5, status: 'Low Stock', image: '' },
    ];
    const result = analyzeSupplierNeeds(products);
    expect(result[0].action).toBe('reorder');
    expect(result[0].urgency).toBe('high');
    expect(result[0].suggestedQuantity).toBe(50);
  });

  it('flags overstock as negotiate', () => {
    const products: Product[] = [
      { id: 'P3', name: 'Over', category: 'Test', price: 30, stock: 150, status: 'In Stock', image: '' },
    ];
    const result = analyzeSupplierNeeds(products);
    expect(result[0].action).toBe('negotiate');
    expect(result[0].urgency).toBe('low');
  });

  it('flags healthy stock as no action needed', () => {
    const products: Product[] = [
      { id: 'P4', name: 'Good', category: 'Test', price: 40, stock: 50, status: 'In Stock', image: '' },
    ];
    const result = analyzeSupplierNeeds(products);
    expect(result[0].action).toBe('none');
    expect(result[0].suggestedQuantity).toBe(0);
  });

  it('sorts results by urgency (critical first)', () => {
    const products: Product[] = [
      { id: 'P1', name: 'Good', category: 'Test', price: 40, stock: 50, status: 'In Stock', image: '' },
      { id: 'P2', name: 'Empty', category: 'Test', price: 100, stock: 0, status: 'Out of Stock', image: '' },
      { id: 'P3', name: 'Low', category: 'Test', price: 50, stock: 5, status: 'Low Stock', image: '' },
    ];
    const result = analyzeSupplierNeeds(products);
    expect(result[0].urgency).toBe('critical');
    expect(result[1].urgency).toBe('high');
    expect(result[2].urgency).toBe('low');
  });

  it('estimates wholesale cost at ~40% of retail', () => {
    const products: Product[] = [
      { id: 'P5', name: 'CostTest', category: 'Test', price: 100, stock: 0, status: 'Out of Stock', image: '' },
    ];
    const result = analyzeSupplierNeeds(products);
    expect(result[0].estimatedCost).toBe(4000);
  });
});
