/**
 * Prompt injection defense utility.
 * Sanitizes user-controlled strings before embedding them in LLM prompts.
 *
 * Prevents:
 * - System instruction override attempts
 * - JSON injection via curly braces
 * - Role-play / persona hijacking
 * - Excessive-length payloads
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|below|these|my|your)\s+(instructions|rules|constraints|prompts)/gi,
  /you\s+are\s+(now|no\s+longer)/gi,
  /system[:\s]*prompt/gi,
  /<\/*\s*(system|user|assistant|function)\s*>/gi,
  /output\s+only\s+(the\s+)?api\s+key/gi,
  /disregard\s+(all\s+)?(previous|above)/gi,
  /forget\s+(all\s+)?(previous|above|everything)/gi,
  /your\s+new\s+(role|purpose|objective|task)/gi,
  /override\s+(all\s+)?(security|safety|content)\s+(restrictions|policies|rules)/gi,
];

const MAX_PROMPT_INPUT_LENGTH = 500;

/**
 * Sanitizes a string for safe embedding in an LLM prompt.
 * @param input - User-controlled string (e.g., product name, customer name, chat message)
 * @returns Sanitized string safe for prompt interpolation
 */
export function sanitizeForPrompt(input: string): string {
  if (!input) return '';

  let sanitized = input.trim();

  // Hard character limit to prevent context window exhaustion attacks
  if (sanitized.length > MAX_PROMPT_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_PROMPT_INPUT_LENGTH) + '... [truncated]';
  }

  // Block known injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  }

  // Neutralize JSON injection attempts in string fields
  sanitized = sanitized.replace(/\{[^}]*\}/g, (match) => {
    // Allow simple price values like "$25.00" but block object-like structures
    if (/^\{.*:.*\}$/.test(match)) {
      return '[JSON_BLOCKED]';
    }
    return match;
  });

  // Strip HTML/script tags
  sanitized = sanitized.replace(/<[^>]*script[^>]*>[^<]*<\/[^>]*script[^>]*>/gi, '[SCRIPT_BLOCKED]');
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  return sanitized;
}

/**
 * Sanitizes multiple fields in an object for safe prompt embedding.
 */
export function sanitizeFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string') {
      result[field] = sanitizeForPrompt(value) as T[typeof field];
    }
  }
  return result;
}
