import { supabase, supabaseConfigured } from './supabase';

// ─── Types ──────────────────────────────────────────────────────────

export interface AiProxyRequest {
  provider: 'deepseek' | 'gemini' | 'gemini-vision';
  systemPrompt: string;
  userMessage: string;
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
  imageData?: string;
  imagePrompt?: string;
}

interface AiProxyResponse {
  success: boolean;
  text: string;
  rateLimit?: { remaining: number };
  error?: string;
}

// ─── Local-dev fallback (direct call when Supabase is not configured) ───

async function callDeepSeekDirect(req: AiProxyRequest): Promise<string> {
  // In local dev without Supabase, fall back to the key from env (Vite injects it only in dev)
  const devKey = import.meta.env.DEEPSEEK_API_KEY || '';
  if (!devKey) {
    throw new Error('No AI API key available. Configure Supabase or set DEEPSEEK_API_KEY in .env for local dev.');
  }

  const messages: { role: string; content: string }[] = [];
  if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });
  messages.push({ role: 'user', content: req.userMessage });

  const body: Record<string, unknown> = {
    model: req.model || 'deepseek-chat',
    messages,
    temperature: req.temperature ?? 0.7,
  };
  if (req.jsonMode) body.response_format = { type: 'json_object' };

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${devKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`DeepSeek API error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Main proxy function ────────────────────────────────────────────

/**
 * Sends an AI request through the Supabase Edge Function `ai-proxy`.
 * Falls back to direct API call in local dev when Supabase is not configured.
 */
export async function callAiProxy(req: AiProxyRequest): Promise<string> {
  // Production path: call through Supabase Edge Function
  if (supabaseConfigured) {
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: req,
    });

    if (error) throw new Error(error.message || 'Edge Function invocation failed');

    const payload = data as AiProxyResponse;
    if (!payload.success) throw new Error(payload.error || 'AI proxy returned an error');

    return payload.text;
  }

  // Local dev fallback: direct API call (only works with DEEPSEEK_API_KEY in .env)
  if (req.provider === 'deepseek') {
    return callDeepSeekDirect(req);
  }

  throw new Error(`Provider "${req.provider}" requires Supabase to be configured.`);
}
