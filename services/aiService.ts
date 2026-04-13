import { Product, Order } from '../types';

const apiKey = process.env.API_KEY || '';

/**
 * Generates a text response from the DeepSeek Agent.
 */
export const getAgentResponse = async (
    userMessage: string,
    inventory: Product[],
    recentOrders: Order[]
): Promise<string> => {
    if (!apiKey) {
        return "API Key is missing. Please configure process.env.API_KEY via DEEPSEEK_API_KEY in .env";
    }

    // Construct system context (reusing existing logic)
    const lowStockItems = inventory.filter(p => p.stock < 10).map(p => p.name).join(', ');
    const recentSalesTotal = recentOrders.reduce((sum, order) => sum + order.total, 0);

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
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.3, // Lower temperature for consistent JSON output
                response_format: { type: 'json_object' } // Force JSON mode
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || JSON.stringify({ text: "I couldn't generate a response.", ui_widget: "none" });

    } catch (error) {
        console.error("DeepSeek Service Error:", error);
        return JSON.stringify({ text: "I encountered an error connecting to the AI service. Please check your network or API key.", ui_widget: "none" });
    }
};

/**
 * Stub for image analysis (DeepSeek Chat is text-only usually)
 */
export const analyzeProductImage = async (base64Image: string): Promise<string> => {
    return "Image analysis is not currently supported with DeepSeek Chat.";
};

/**
 * Strategic Insight using DeepSeek
 */
export const generateStrategicInsight = async (topic: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-reasoner', // Using reasoner for strategy if available, falling back handled by API or user
                messages: [
                    { role: 'user', content: `Generate a brief strategic insight for an e-commerce store regarding: ${topic}. Focus on actionable steps.` }
                ]
            })
        });

        if (!response.ok) return "Error generating insight.";
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No insight generated.";
    } catch (e) {
        return "Error generating insight.";
    }
}
