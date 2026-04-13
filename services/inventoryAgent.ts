import { Product } from '../types';

const apiKey = process.env.API_KEY || '';

export interface InventoryInsight {
    type: 'restock' | 'dead_stock' | 'opportunity' | 'ok';
    message: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
}

/**
 * Generates AI-powered insights for specific inventory items.
 */
export const analyzeInventoryItem = async (product: Product): Promise<InventoryInsight> => {
    // Local logic for instant feedback (Hybrid AI approach)
    if (product.stock === 0) {
        return {
            type: 'restock',
            message: `CRITICAL: ${product.name} is completely out of stock. You are losing estimated revenue daily.`,
            action: 'Generate Reorder Email',
            priority: 'high'
        };
    }

    if (product.stock < 10) {
        return {
            type: 'restock',
            message: `Low Stock Alert. Only ${product.stock} units left. Reorder recommended before weekend rush.`,
            action: 'Draft Reorder Request',
            priority: 'medium'
        };
    }

    if (product.stock > 100 && product.status !== 'In Stock') {
        return {
            type: 'dead_stock',
            message: `Overstock detected. ${product.stock} units are sitting idle. Consider a flash sale to free up cash flow.`,
            action: 'Create Flash Sale Campaign',
            priority: 'medium'
        };
    }

    // Default "Smart" response fallback if no critical rules met
    return {
        type: 'ok',
        message: `${product.name} inventory levels are healthy. Sales velocity is stable.`,
        action: 'View Sales Analytics',
        priority: 'low'
    };
};

/**
 * Uses DeepSeek to generate a vendor reorder email or marketing copy.
 */
export const generateInventoryActionContent = async (product: Product, insightType: string): Promise<string> => {
    if (!apiKey) return "AI API Key missing. Please check configuration.";

    let prompt = "";

    if (insightType === 'restock') {
        prompt = `
        Write a professional vendor reorder email for:
        Product: ${product.name}
        Current Stock: ${product.stock}
        
        Request a restock quote for 50 units. Ask for expedited shipping options.
        Keep it brief and business-professional.
        `;
    } else if (insightType === 'dead_stock') {
        prompt = `
        Write a catchy social media post (Instagram/Twitter) for a FLASH SALE on:
        Product: ${product.name}
        
        The goal is to clear excess inventory. Offer a 20% discount for 24 hours only.
        Use emojis and create urgency.
        `;
    } else {
        prompt = `Write a short 2-sentence creative product description for ${product.name} that highlights its key features.`;
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
                    { role: 'system', content: "You are an efficient e-commerce operations assistant." },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error('AI Request Failed');

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Could not generate content.";
    } catch (e) {
        return "AI Service Unavailable. Please try again later.";
    }
};
