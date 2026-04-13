import { Order } from '../types';
import { sanitizeForPrompt } from '../lib/promptSafety';

const apiKey = process.env.API_KEY || '';

export interface OrderInsight {
    type: 'vip' | 'return_risk' | 'pending' | 'ok';
    message: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
}

/**
 * Generates AI-powered insights for specific orders.
 */
export const analyzeOrder = async (order: Order): Promise<OrderInsight> => {
    // Local logic for instant classification
    if (order.status === 'Returned') {
        return {
            type: 'return_risk',
            message: `Order ${order.id} was returned. Analyze the reason to prevent future returns.`,
            action: 'Draft Apology Email',
            priority: 'high'
        };
    }

    if (order.total > 1000) {
        return {
            type: 'vip',
            message: `VIP Order detected ($${order.total}). ${order.customerName} is a high-value customer.`,
            action: 'Send VIP Thank You',
            priority: 'medium'
        };
    }

    if (order.status === 'Pending') {
        return {
            type: 'pending',
            message: `Order ${order.id} is still pending. Ensure shipment is scheduled within 24 hours.`,
            action: 'Create Shipping Label',
            priority: 'medium'
        };
    }

    return {
        type: 'ok',
        message: `Order ${order.id} for ${order.customerName} is processed and healthy.`,
        action: 'View Receipt',
        priority: 'low'
    };
};

/**
 * Uses DeepSeek to generate customer support content.
 */
export const generateOrderActionContent = async (order: Order, insightType: string): Promise<string> => {
    if (!apiKey) return "AI API Key missing.";

    // Sanitize user-controlled inputs
    const safeCustomerName = sanitizeForPrompt(order.customerName);

    let prompt = "";

    if (insightType === 'vip') {
        prompt = `
        Write a personalized, premium "Thank You" email for a VIP customer named ${safeCustomerName}.
        They just spent $${order.total}.
        Offer them early access to our next collection as a token of appreciation.
        `;
    } else if (insightType === 'return_risk') {
        prompt = `
        Write a polite, empathetic email to ${safeCustomerName} regarding their returned order ${order.id}.
        Ask for feedback on why they returned the item so we can improve.
        Keep it professional and understanding.
        `;
    } else if (insightType === 'pending') {
        prompt = `
        Write a status update email to ${safeCustomerName} for Order ${order.id}.
        Inform them that their order is being packed and will ship within 24 hours.
        Provide a placeholder tracking link.
        `;
    } else {
        return "Receipt viewing is not yet implemented in AI Agent.";
    }

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
                    { role: 'system', content: "You are a customer success AI agent." },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error('AI Request Failed');

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Could not generate content.";
    } catch (e) {
        return "AI Service Unavailable.";
    }
};
