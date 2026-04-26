// Supabase Edge Function — AI Proxy
// Proxies all LLM calls (DeepSeek + Gemini) through the server.
// Deploy with: supabase functions deploy ai-proxy
// Set secrets: supabase secrets set DEEPSEEK_API_KEY=sk_xxx GEMINI_API_KEY=gemini_xxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Rate Limiting (per-user, sliding window) ────────────────────────

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_CALLS = 10; // max 10 calls per minute per user
const callLog = new Map<string, number[]>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const calls = callLog.get(userId) || [];
  const recent = calls.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_CALLS) {
    callLog.set(userId, recent);
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  callLog.set(userId, recent);
  return { allowed: true, remaining: RATE_LIMIT_MAX_CALLS - recent.length };
}

// ─── Request Types ───────────────────────────────────────────────────

type Provider = 'deepseek' | 'gemini' | 'gemini-vision';

interface ChatRequest {
  provider: Provider;
  model?: string;
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  jsonMode?: boolean;
  imageData?: string; // base64 for gemini-vision
  imagePrompt?: string; // text prompt for vision
}

// ─── Handlers ────────────────────────────────────────────────────────

async function callDeepSeek(req: ChatRequest): Promise<{ text: string }> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY not configured on server');
  }

  const model = req.model || 'deepseek-chat';

  const messages = [];
  if (req.systemPrompt) {
    messages.push({ role: 'system', content: req.systemPrompt });
  }
  messages.push({ role: 'user', content: req.userMessage });

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: req.temperature ?? 0.7,
  };

  if (req.jsonMode) {
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

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error');
    throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return { text };
}

async function callGemini(req: ChatRequest): Promise<{ text: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured on server');
  }

  const model = req.model || 'gemini-2.5-flash';

  const contents = [];
  if (req.imageData && req.imagePrompt) {
    // Vision request
    contents.push({
      parts: [
        { text: req.imagePrompt },
        { inlineData: { mimeType: 'image/jpeg', data: req.imageData } },
      ],
    });
  } else {
    contents.push({
      parts: [{ text: req.systemPrompt ? `${req.systemPrompt}\n\n---\n\n${req.userMessage}` : req.userMessage }],
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { text };
}

// ─── Main Handler ────────────────────────────────────────────────────

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const rateCheck = checkRateLimit(userId);

    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before making another request.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ChatRequest = await req.json();

    if (!body.provider || !body.userMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: provider, userMessage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: { text: string };

    switch (body.provider) {
      case 'deepseek':
        result = await callDeepSeek(body);
        break;
      case 'gemini':
      case 'gemini-vision':
        result = await callGemini(body);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown provider: ${body.provider}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, text: result.text, rateLimit: { remaining: rateCheck.remaining } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
