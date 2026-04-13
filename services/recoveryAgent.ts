import { Cart } from '../types';

const apiKey = process.env.API_KEY || '';

/**
 * Generates a unique discount code based on customer name and date.
 */
const generateDiscountCode = (name: string): string => {
    const cleanName = name.split(' ')[0].toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `SAVE15-${cleanName}${randomSuffix}`;
};

/**
 * Generates an AI-powered abandoned cart recovery message.
 */
export const generateRecoveryEmail = async (cart: Cart): Promise<string> => {
    const isHighValue = cart.totalValue > 100;
    const discountCode = isHighValue ? generateDiscountCode(cart.customerName) : null;

    if (!apiKey) {
        let fallbackMsg = `Hi ${cart.customerName}, we noticed you left some items in your cart! Come back and finish your purchase of: ${cart.items.map(i => i.productName).join(', ')}.`;
        if (discountCode) fallbackMsg += `\n\nUse code ${discountCode} for 15% off!`;
        return fallbackMsg;
    }

    const cartItemsList = cart.items.map(item => `${item.quantity}x ${item.productName} ($${item.price})`).join('\n');

    const strategyContext = isHighValue
        ? `STRATEGY: This is a HIGH-VALUE CART ($${cart.totalValue}). You must offer a 15% discount using the code: ${discountCode}. Make the email feel exclusive and urgent.`
        : `STRATEGY: This is a standard cart. Do not offer a discount. Focus on the quality of items and "low stock" fear of missing out (FOMO).`;

    const prompt = `
    You are an expert E-commerce Conversion Specialist. 
    Write a highly persuasive, friendly, and non-intrusive abandoned cart recovery email.
    
    Customer Name: ${cart.customerName}
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
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: "You are a specialized e-commerce copywriter." },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Could not generate recovery message.";

    } catch (error) {
        console.error("Recovery Agent Error:", error);
        return `Hi ${cart.customerName}, we noticed you left some beautiful items in your cart. Come back and complete your order! [Recovery Link]`;
    }
};

/**
 * Simulates sending the recovery email.
 */
export const sendRecoveryEmail = async (cartId: string, emailContent: string): Promise<boolean> => {
    // Simulate API call to email service (e.g. Resend or SendGrid)
    console.log(`Sending email for Cart ${cartId}... Content:`, emailContent);
    return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
};
