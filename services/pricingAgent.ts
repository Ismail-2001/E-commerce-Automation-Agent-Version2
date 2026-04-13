import { Product } from '../types';

export interface PricingRecommendation {
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  changePercent: number;
  strategy: 'increase' | 'decrease' | 'hold';
  reason: string;
  estimatedRevenueImpact: number;
  confidence: number;
}

/**
 * Dynamic pricing agent — analyzes stock levels, demand velocity, and margins
 * to recommend optimal pricing adjustments.
 */
export function analyzePricing(products: Product[], salesData: { sales: number; revenue: number }[]): PricingRecommendation[] {
  const avgDailySales = salesData.length > 0
    ? salesData.reduce((sum, d) => sum + d.sales, 0) / salesData.length
    : 10;

  return products.map(product => {
    let suggestedPrice = product.price;
    let strategy: PricingRecommendation['strategy'] = 'hold';
    let reason = '';
    let confidence = 70;

    // High stock + slow movement → decrease price to accelerate sales
    if (product.stock > 100 && product.status === 'In Stock') {
      // Deterministic discount based on stock level (more stock = higher discount)
      const stockRatio = Math.min(product.stock / 200, 1); // 0-1 scale
      const discount = 0.10 + stockRatio * 0.05; // 10-15% based on stock level
      suggestedPrice = Math.round((product.price * (1 - discount)) * 100) / 100;
      strategy = 'decrease';
      reason = `Overstock detected (${product.stock} units). Recommending ${Math.round(discount * 100)}% markdown to accelerate turnover and free up cash flow.`;
      confidence = 75;
    }
    // Low stock + high demand → increase price for margin optimization
    else if (product.stock > 0 && product.stock < 10) {
      // Deterministic increase based on scarcity (lower stock = higher increase)
      const scarcityRatio = 1 - (product.stock / 10); // 0-1 scale
      const increase = 0.05 + scarcityRatio * 0.10; // 5-15% based on scarcity
      suggestedPrice = Math.round((product.price * (1 + increase)) * 100) / 100;
      strategy = 'increase';
      reason = `Low stock (${product.stock} units) with continued demand. Price elasticity allows ${Math.round(increase * 100)}% uplift before restock arrives.`;
      confidence = 80;
    }
    // Out of stock — no pricing change
    else if (product.stock === 0) {
      reason = 'Product is out of stock. Pricing change deferred until restock.';
      confidence = 95;
    }
    // Healthy stock — hold
    else {
      reason = 'Stock levels and demand are balanced. Current pricing is optimal.';
      confidence = 85;
    }

    const changePercent = product.price > 0
      ? Math.round(((suggestedPrice - product.price) / product.price) * 100 * 10) / 10
      : 0;

    const estimatedRevenueImpact = Math.round(
      (suggestedPrice - product.price) * avgDailySales * 30
    );

    return {
      productId: product.id,
      productName: product.name,
      currentPrice: product.price,
      suggestedPrice,
      changePercent,
      strategy,
      reason,
      estimatedRevenueImpact,
      confidence,
    };
  });
}
