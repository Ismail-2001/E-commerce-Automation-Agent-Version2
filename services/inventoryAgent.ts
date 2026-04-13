import { Product } from '../types';
import { sanitizeForPrompt } from '../lib/promptSafety';
import { callAiProxy } from '../lib/aiProxy';

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

    return {
        type: 'ok',
        message: `${product.name} inventory levels are healthy. Sales velocity is stable.`,
        action: 'View Sales Analytics',
        priority: 'low'
    };
};

/**
 * Uses DeepSeek (via proxy) to generate a vendor reorder email or marketing copy.
 */
export const generateInventoryActionContent = async (product: Product, insightType: string): Promise<string> => {
    const safeProductName = sanitizeForPrompt(product.name);

    let userMessage = "";

    if (insightType === 'restock') {
        userMessage = `
        Write a professional vendor reorder email for:
        Product: ${safeProductName}
        Current Stock: ${product.stock}

        Request a restock quote for 50 units. Ask for expedited shipping options.
        Keep it brief and business-professional.
        `;
    } else if (insightType === 'dead_stock') {
        userMessage = `
        Write a catchy social media post (Instagram/Twitter) for a FLASH SALE on:
        Product: ${safeProductName}

        The goal is to clear excess inventory. Offer a 20% discount for 24 hours only.
        Use emojis and create urgency.
        `;
    } else {
        userMessage = `Write a short 2-sentence creative product description for ${safeProductName} that highlights its key features.`;
    }

    try {
        return await callAiProxy({
            provider: 'deepseek',
            systemPrompt: 'You are an efficient e-commerce operations assistant.',
            userMessage,
            temperature: 0.7,
        });
    } catch {
        return "AI Service Unavailable. Please try again later.";
    }
};
