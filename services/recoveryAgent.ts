import { Cart } from '../types';
import { sanitizeForPrompt } from '../lib/promptSafety';
import { callAiProxy } from '../lib/aiProxy';

/**
 * Generates a unique discount code based on customer name and date.
 */
const generateDiscountCode = (name: string): string => {
  const cleanName = name.split(' ')[0].toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SAVE15-${cleanName}${randomSuffix}`;
};

/**
 * Generates an AI-powered abandoned cart recovery message via proxy.
 */
export const generateRecoveryEmail = async (cart: Cart): Promise<string> => {
  const isHighValue = cart.totalValue > 100;
  const discountCode = isHighValue ? generateDiscountCode(cart.customerName) : null;

  const cartItemsList = cart.items
    .map((item) => `${item.quantity}x ${item.productName} ($${item.price})`)
    .join('\n');

  const safeCustomerName = sanitizeForPrompt(cart.customerName);

  const strategyContext = isHighValue
    ? `STRATEGY: This is a HIGH-VALUE CART ($${cart.totalValue}). You must offer a 15% discount using the code: ${discountCode}. Make the email feel exclusive and urgent.`
    : `STRATEGY: This is a standard cart. Do not offer a discount. Focus on the quality of items and "low stock" fear of missing out (FOMO).`;

  const userMessage = `
    You are an expert E-commerce Conversion Specialist.
    Write a highly persuasive, friendly, and non-intrusive abandoned cart recovery email.

    Customer Name: ${safeCustomerName}
    Cart Value: $${cart.totalValue}
    Items in Cart:
    ${cartItemsList}

    ${strategyContext}

    The email should:
    1. Acknowledge that life gets busy.
    2. Highlight the specific items they left.
    3. If a discount is provided, make it the "Hero" of the email.
    4. End with a strong Call to Action.

    Output ONLY binary content of the email (Subject Line and Body).
    `;

  try {
    return await callAiProxy({
      provider: 'deepseek',
      systemPrompt: 'You are a specialized e-commerce copywriter.',
      userMessage,
      temperature: 0.8,
    });
  } catch (error) {
    console.error('Recovery Agent Error:', error);
    let fallbackMsg = `Hi ${cart.customerName}, we noticed you left some items in your cart! Come back and finish your purchase of: ${cart.items.map((i) => i.productName).join(', ')}.`;
    if (discountCode) fallbackMsg += `\n\nUse code ${discountCode} for 15% off!`;
    return fallbackMsg;
  }
};

/**
 * Simulates sending the recovery email.
 */
export const sendRecoveryEmail = async (cartId: string, emailContent: string): Promise<boolean> => {
  console.warn(`Sending email for Cart ${cartId}... Content:`, emailContent);
  return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
};
