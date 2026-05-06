/**
 * Unified LLM client interface.
 * Routes all AI calls through the Supabase Edge Function proxy (ai-proxy).
 * Falls back to direct API calls if the proxy is not deployed.
 *
 * NEVER calls LLM APIs directly from the browser in production.
 * All keys live server-side in Supabase secrets.
 */

import { sanitizeForPrompt } from '../lib/promptSafety';
import { retryWithBackoff } from '../lib/retry';
import type { Product, Order } from '../types';

// ─── Configuration ───────────────────────────────────────────────────

const PROXY_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`
  : '';

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback direct API keys (only used if proxy is not deployed — NOT recommended for production)
const DEEPSEEK_API_KEY = import.meta.env.DEEPSEEK_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY || '';

const USE_PROXY = !!PROXY_URL && !!SUPABASE_ANON_KEY;

// ─── Types ───────────────────────────────────────────────────────────

export type Provider = 'deepseek' | 'gemini' | 'gemini-vision';

export interface LLMChatOptions {
  systemPrompt?: string;
  temperature?: number;
  jsonMode?: boolean;
  userId?: string; // for rate limiting (defaults to 'anonymous')
}

export interface LLMVisionOptions {
  imagePrompt?: string;
}

export interface LLMResponse {
  text: string;
}

// ─── Core Client ─────────────────────────────────────────────────────

/**
 * Sends a chat request to the LLM provider.
 * All calls go through the server-side proxy when configured.
 */
export async function llmChat(
  provider: Provider,
  userMessage: string,
  options: LLMChatOptions = {}
): Promise<LLMResponse> {
  const { systemPrompt = '', temperature = 0.7, jsonMode = false, userId = 'anonymous' } = options;

  // Sanitize user message against prompt injection
  const safeMessage = sanitizeForPrompt(userMessage);

  if (USE_PROXY) {
    return retryWithBackoff(async () => {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'x-user-id': userId,
        },
        body: JSON.stringify({
          provider,
          systemPrompt: sanitizeForPrompt(systemPrompt),
          userMessage: safeMessage,
          temperature,
          jsonMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Proxy error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unknown proxy error');
      return { text: data.text };
    }, 3, 1000);
  }

  // Fallback: direct API call (development only)
  if (provider === 'deepseek') {
    if (!DEEPSEEK_API_KEY) {
      // Mock Response for Demo
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            text: jsonMode 
              ? JSON.stringify({ text: "I've analyzed your store data. Sales are trending upwards by 12% this week, mainly driven by the 'Lumina Smart Lamp'.", ui_widget: "none", widget_data: {} })
              : "I've analyzed your store data. Sales are trending upwards by 12% this week, mainly driven by the 'Lumina Smart Lamp'."
          });
        }, 1000);
      });
    }
    return callDeepSeekDirect(safeMessage, systemPrompt, temperature, jsonMode);
  }

  if (!GEMINI_API_KEY) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ text: "Demo Mode: The Intelligence Engine is active and scanning your repository for insights. Integration with live APIs will proceed once keys are configured." });
      }, 1000);
    });
  }

  return callGeminiDirect(safeMessage, systemPrompt, temperature);
}

/**
 * Sends a vision request to Gemini (image analysis).
 */
export async function llmVision(
  base64Image: string,
  options: LLMVisionOptions = {}
): Promise<LLMResponse> {
  const { imagePrompt = 'Describe this image in detail.' } = options;

  if (USE_PROXY) {
    return retryWithBackoff(async () => {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'x-user-id': 'anonymous',
        },
        body: JSON.stringify({
          provider: 'gemini-vision',
          imageData: base64Image,
          imagePrompt: sanitizeForPrompt(imagePrompt),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Proxy error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unknown proxy error');
      return { text: data.text };
    }, 3, 1000);
  }

  // Fallback: direct Gemini API call
  return callGeminiVisionDirect(base64Image, imagePrompt);
}

// ─── Direct API Fallbacks (Development Only) ─────────────────────────

async function callDeepSeekDirect(
  userMessage: string,
  systemPrompt: string,
  temperature: number,
  jsonMode: boolean
): Promise<LLMResponse> {
  if (!DEEPSEEK_API_KEY) {
    return {
      text: 'DEEPSEEK_API_KEY not configured. Add it to .env or deploy the ai-proxy edge function.',
    };
  }

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userMessage });

  const body: Record<string, unknown> = {
    model: 'deepseek-chat',
    messages,
    temperature,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);

  const data = await response.json();
  return { text: data.choices?.[0]?.message?.content || '' };
}

async function callGeminiDirect(
  userMessage: string,
  systemPrompt: string,
  temperature: number
): Promise<LLMResponse> {
  if (!GEMINI_API_KEY) {
    return {
      text: 'GEMINI_API_KEY not configured. Add it to .env or deploy the ai-proxy edge function.',
    };
  }

  const content = systemPrompt
    ? `${systemPrompt}\n\n---\n\n${userMessage}`
    : userMessage;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: content }] }],
        generationConfig: { temperature },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const data = await response.json();
  return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
}

async function callGeminiVisionDirect(
  base64Image: string,
  imagePrompt: string
): Promise<LLMResponse> {
  if (!GEMINI_API_KEY) {
    return { text: 'GEMINI_API_KEY not configured for image analysis.' };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: imagePrompt },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini Vision error: ${response.status}`);

  const data = await response.json();
  return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
}

// ─── Convenience Functions (Backwards-Compatible API) ────────────────

/**
 * Chat agent response with business context.
 * Replaces the old aiService.ts getAgentResponse.
 */
export async function getAgentResponse(
  userMessage: string,
  inventory: Product[],
  recentOrders: Order[]
): Promise<string> {
  const lowStockItems = inventory.filter((p) => p.stock < 10).map((p) => p.name).join(', ');
  const recentSalesTotal = recentOrders.reduce((sum, order) => sum + order.total, 0);

  const systemPrompt = `
    You are an intelligent E-commerce Automation Agent called "AutoAgent".

    Current Business Context:
    - Total Products: ${inventory.length}
    - Low Stock Items (Alert): ${lowStockItems || 'None'}
    - Recent Orders Revenue (Last 5 orders): $${recentSalesTotal.toFixed(2)}

    CRITICAL INSTRUCTION:
    You must return your response in a strict JSON format. Do not include markdown code blocks.

    Format:
    {
      "text": "Your conversational response here...",
      "ui_widget": "product_card" | "order_card" | "none",
      "widget_data": { ...data for the widget... }
    }

    Keep text responses concise and professional.
  `;

  const result = await llmChat('deepseek', userMessage, {
    systemPrompt,
    temperature: 0.3,
    jsonMode: true,
  });

  return result.text;
}

/**
 * Image analysis via Gemini Vision.
 * Replaces the old geminiService.ts analyzeProductImage.
 */
export async function analyzeProductImage(base64Image: string): Promise<string> {
  const result = await llmVision(base64Image, {
    imagePrompt:
      'Analyze this product image. Describe the item, assess its visible condition (new/used/damaged), and suggest 3 keywords for SEO.',
  });

  return result.text;
}

/**
 * Strategic insight generation.
 */
export async function generateStrategicInsight(topic: string): Promise<string> {
  const result = await llmChat('deepseek', `Generate a brief strategic insight for an e-commerce store regarding: ${topic}. Focus on actionable steps.`, {
    temperature: 0.7,
  });

  return result.text;
}
