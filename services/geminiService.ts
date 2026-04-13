import { Product, Order } from '../types';
import { callAiProxy } from '../lib/aiProxy';

/**
 * Generates a text response from the Gemini Agent via proxy.
 */
export const getAgentResponse = async (
  userMessage: string,
  inventory: Product[],
  recentOrders: Order[]
): Promise<string> => {
  const lowStockItems = inventory.filter(p => p.stock < 10).map(p => p.name).join(', ');
  const recentSalesTotal = recentOrders.reduce((sum, order) => sum + order.total, 0);

  const systemPrompt = `
    You are an intelligent E-commerce Automation Agent called "AutoAgent".
    Your goal is to help the business owner manage inventory, analyze sales, and draft customer support responses.

    Current Business Context:
    - Total Products: ${inventory.length}
    - Low Stock Items (Alert): ${lowStockItems || "None"}
    - Recent Orders Revenue (Last 5 orders): $${recentSalesTotal.toFixed(2)}

    Capabilities:
    1. Answer questions about inventory levels.
    2. Suggest marketing copy for products.
    3. Draft polite replies to customer inquiries (simulated).
    4. Analyze trends based on the provided context.

    Keep responses concise, professional, and actionable. Use markdown for formatting.
  `;

  try {
    return await callAiProxy({
      provider: 'gemini',
      systemPrompt,
      userMessage,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error connecting to the AI service. Please check your network or API key.";
  }
};

/**
 * Analyzes a product image for quality and description via proxy.
 */
export const analyzeProductImage = async (base64Image: string): Promise<string> => {
  try {
    return await callAiProxy({
      provider: 'gemini-vision',
      systemPrompt: '',
      userMessage: '',
      imageData: base64Image,
      imagePrompt: 'Analyze this product image. Describe the item, assess its visible condition (new/used/damaged), and suggest 3 keywords for SEO.',
    });
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Failed to analyze image.";
  }
};

/**
 * Generate a specialized report or insight via proxy.
 */
export const generateStrategicInsight = async (topic: string): Promise<string> => {
  try {
    return await callAiProxy({
      provider: 'gemini',
      systemPrompt: '',
      userMessage: `Generate a brief strategic insight for an e-commerce store regarding: ${topic}. Focus on actionable steps.`,
    });
  } catch {
    return "Error generating insight.";
  }
};
