import { Product, Order } from '../types';
import { callAiProxy } from '../lib/aiProxy';

/**
 * Generates a text response from the DeepSeek Agent via the AI proxy.
 */
export const getAgentResponse = async (
    userMessage: string,
    inventory: Product[],
    recentOrders: Order[]
): Promise<string> => {
    const systemPrompt = `
    You are an intelligent E-commerce Automation Agent called "AutoAgent".

    Current Business Context:
    - Products: ${JSON.stringify(inventory.map(p => ({ id: p.id, name: p.name, stock: p.stock })))}
    - Recent Orders: ${JSON.stringify(recentOrders.slice(0, 3))}

    CRITICAL INSTRUCTION:
    You must return your response in a strict JSON format. Do not include markdown code blocks.

    Format:
    {
      "text": "Your conversational response here...",
      "ui_widget": "product_card" | "order_card" | "none",
      "widget_data": { ...data for the widget... }
    }

    Examples:
    1. If user asks about a product:
    {
      "text": "The NeoComfort Chair is currently in stock with 45 units.",
      "ui_widget": "product_card",
      "widget_data": { "id": "P-101", "name": "NeoComfort Ergonomic Chair", "price": 349.99, "stock": 45, "image": "..." }
    }

    2. If normal conversation:
    {
      "text": "I can help you analyze sales or track inventory. What do you need?",
      "ui_widget": "none",
      "widget_data": null
    }

    Keep text responses concise and professional.
  `;

    try {
        const text = await callAiProxy({
            provider: 'deepseek',
            systemPrompt,
            userMessage,
            temperature: 0.3,
            jsonMode: true,
        });

        return text || JSON.stringify({ text: "I couldn't generate a response.", ui_widget: "none" });
    } catch (error) {
        console.error("DeepSeek Service Error:", error);
        return JSON.stringify({ text: "I encountered an error connecting to the AI service. Please check your network or API key.", ui_widget: "none" });
    }
};

/**
 * Stub for image analysis (DeepSeek Chat is text-only usually)
 */
export const analyzeProductImage = async (_base64Image: string): Promise<string> => {
    return "Image analysis is not currently supported with DeepSeek Chat.";
};

/**
 * Strategic Insight using DeepSeek via proxy.
 */
export const generateStrategicInsight = async (topic: string): Promise<string> => {
    try {
        return await callAiProxy({
            provider: 'deepseek',
            systemPrompt: '',
            userMessage: `Generate a brief strategic insight for an e-commerce store regarding: ${topic}. Focus on actionable steps.`,
            model: 'deepseek-reasoner',
        });
    } catch {
        return "Error generating insight.";
    }
};
