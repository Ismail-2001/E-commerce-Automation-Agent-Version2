import { Product } from '../types';
import { sanitizeForPrompt } from '../lib/promptSafety';

export interface SupplierRecommendation {
  productId: string;
  productName: string;
  action: 'reorder' | 'negotiate' | 'switch' | 'none';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestedQuantity: number;
  estimatedCost: number;
  negotiationTip: string;
}

/**
 * Supplier management agent — automated vendor analysis and reorder recommendations.
 */
export function analyzeSupplierNeeds(products: Product[]): SupplierRecommendation[] {
  return products.map(product => {
    // Estimate wholesale cost at ~40% of retail
    const wholesaleCost = product.price * 0.4;

    if (product.stock === 0) {
      return {
        productId: product.id,
        productName: product.name,
        action: 'reorder' as const,
        urgency: 'critical' as const,
        message: `URGENT: ${product.name} is completely out of stock. Immediate reorder required to prevent revenue loss.`,
        suggestedQuantity: 100,
        estimatedCost: Math.round(wholesaleCost * 100),
        negotiationTip: 'Request expedited shipping. Mention competitor pricing to negotiate a 5-10% bulk discount. Emphasize urgency for priority fulfillment.',
      };
    }

    if (product.stock < 10) {
      return {
        productId: product.id,
        productName: product.name,
        action: 'reorder' as const,
        urgency: 'high' as const,
        message: `Low stock alert: ${product.stock} units remaining. Reorder within 48 hours to maintain supply chain continuity.`,
        suggestedQuantity: 50,
        estimatedCost: Math.round(wholesaleCost * 50),
        negotiationTip: 'Request net-30 payment terms. If ordering with other products, bundle for volume discount. Ask about new season availability.',
      };
    }

    if (product.stock > 100) {
      return {
        productId: product.id,
        productName: product.name,
        action: 'negotiate' as const,
        urgency: 'low' as const,
        message: `Overstock situation (${product.stock} units). Consider negotiating return/exchange terms or delaying next order.`,
        suggestedQuantity: 0,
        estimatedCost: 0,
        negotiationTip: 'Negotiate consignment terms for overstock. Propose markdown cooperation where vendor shares the discount cost. Explore co-op advertising credits.',
      };
    }

    return {
      productId: product.id,
      productName: product.name,
      action: 'none' as const,
      urgency: 'low' as const,
      message: `Stock levels are healthy (${product.stock} units). No immediate supplier action needed.`,
      suggestedQuantity: 0,
      estimatedCost: 0,
      negotiationTip: 'Use this stable period to review contract terms for the next quarter. Request early-bird pricing for upcoming seasonal inventory.',
    };
  }).sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

/**
 * Generates a vendor negotiation email draft using DeepSeek.
 */
export async function generateNegotiationEmail(recommendation: SupplierRecommendation): Promise<string> {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    return `Subject: Reorder Request — ${recommendation.productName}\n\nDear Supplier,\n\nWe would like to place an order for ${recommendation.suggestedQuantity} units of ${recommendation.productName}.\n\nPlease provide your best pricing and estimated delivery timeline.\n\nBest regards,\nAutoAgent Procurement`;
  }

  const safeProductName = sanitizeForPrompt(recommendation.productName);

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a professional procurement specialist. Write concise, strategic vendor emails.' },
          {
            role: 'user',
            content: `Write a professional vendor email for:
Product: ${safeProductName}
Action: ${recommendation.action}
Quantity: ${recommendation.suggestedQuantity} units
Negotiation Strategy: ${recommendation.negotiationTip}

Keep it brief, professional, and strategically phrased. Include Subject Line and Body.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Could not generate email.';
  } catch {
    return `Subject: Order Inquiry — ${recommendation.productName}\n\nDear Supplier,\n\nWe need ${recommendation.suggestedQuantity} units of ${recommendation.productName}.\n\n${recommendation.negotiationTip}\n\nPlease advise.\n\nBest,\nAutoAgent`;
  }
}
