import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Product, Order } from '../types';

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a text response from the Gemini Agent, with context about the store.
 */
export const getAgentResponse = async (
  userMessage: string,
  inventory: Product[],
  recentOrders: Order[]
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure process.env.API_KEY.";
  }

  // Construct system context
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
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error connecting to the AI service. Please check your network or API key.";
  }
};

/**
 * Analyzes a product image for quality and description.
 */
export const analyzeProductImage = async (base64Image: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
            { text: "Analyze this product image. Describe the item, assess its visible condition (new/used/damaged), and suggest 3 keywords for SEO." },
            {
                inlineData: {
                    mimeType: 'image/jpeg', // Assuming JPEG for simplicity in this demo
                    data: base64Image
                }
            }
        ]
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Failed to analyze image.";
  }
};

/**
 * Generate a specialized report or insight (Reasoning Model)
 */
export const generateStrategicInsight = async (topic: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Using flash for speed in this demo, usually Pro for reasoning
            contents: `Generate a brief strategic insight for an e-commerce store regarding: ${topic}. Focus on actionable steps.`,
        });
        return response.text || "No insight generated.";
    } catch (e) {
        return "Error generating insight.";
    }
}
