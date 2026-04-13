/**
 * Zod schemas for validating AI agent responses.
 * Every LLM response must be validated against these schemas before use.
 */

import { z } from 'zod';

// ─── Chat Agent Response ──────────────────────────────────────────────

export const ProductWidgetSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  price: z.number().min(0),
  stock: z.number().min(0).int(),
  image: z.string().url().optional().or(z.literal('')),
});

export const OrderWidgetSchema = z.object({
  id: z.string(),
  customerName: z.string().max(200),
  total: z.number().min(0),
  status: z.string().max(50),
});

export const ChatResponseSchema = z.object({
  text: z.string().max(4000),
  ui_widget: z.enum(['product_card', 'order_card', 'none']),
  widget_data: z.union([ProductWidgetSchema, OrderWidgetSchema, z.null()]).optional().nullable(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// ─── Recovery Email ───────────────────────────────────────────────────

export const RecoveryEmailSchema = z.object({
  subject: z.string().max(200),
  body: z.string().max(5000),
});

export type RecoveryEmail = z.infer<typeof RecoveryEmailSchema>;

// ─── Order Action Content ─────────────────────────────────────────────

export const OrderActionSchema = z.object({
  subject: z.string().max(200),
  body: z.string().max(5000),
});

export type OrderAction = z.infer<typeof OrderActionSchema>;

// ─── Inventory Action Content ─────────────────────────────────────────

export const InventoryActionSchema = z.object({
  content: z.string().max(3000),
});

export type InventoryAction = z.infer<typeof InventoryActionSchema>;

// ─── Supplier Negotiation Email ───────────────────────────────────────

export const SupplierEmailSchema = z.object({
  subject: z.string().max(200),
  body: z.string().max(5000),
});

export type SupplierEmail = z.infer<typeof SupplierEmailSchema>;

// ─── Marketing Ad Copy ────────────────────────────────────────────────

export const MarketingCopySchema = z.object({
  headline: z.string().max(200),
  body: z.string().max(2000),
  cta: z.string().max(100),
});

export type MarketingCopy = z.infer<typeof MarketingCopySchema>;

// ─── Product Image Analysis ───────────────────────────────────────────

export const ImageAnalysisSchema = z.object({
  description: z.string().max(1000),
  condition: z.string().max(100),
  keywords: z.array(z.string().max(50)).max(10),
  suggestedTitle: z.string().max(200),
  suggestedPrice: z.string().max(50),
  category: z.string().max(100),
});

export type ImageAnalysis = z.infer<typeof ImageAnalysisSchema>;

// ─── Validation Helpers ───────────────────────────────────────────────

/**
 * Validates and normalizes an AI response against a Zod schema.
 * Returns { success: true, data } or { success: false, error }.
 */
export function validateAIResponse<T>(
  schema: z.ZodSchema<T>,
  raw: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(raw);
    return { success: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Parses a raw string response and attempts to extract JSON, then validates.
 */
export function parseAndValidateAIResponse<T>(
  schema: z.ZodSchema<T>,
  raw: string
): { success: true; data: T } | { success: false; error: string } {
  let parsed: unknown;

  try {
    // Try direct JSON parse
    parsed = JSON.parse(raw);
  } catch {
    // Try to extract JSON from markdown code blocks or embedded JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        return { success: false, error: 'Could not extract valid JSON from response' };
      }
    } else {
      return { success: false, error: 'No JSON object found in response' };
    }
  }

  return validateAIResponse(schema, parsed);
}
