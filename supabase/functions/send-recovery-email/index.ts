// Supabase Edge Function — Send Recovery Email via Resend
// Deploy with: supabase functions deploy send-recovery-email
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecoveryEmailRequest {
  to: string;
  customerName: string;
  subject: string;
  htmlBody: string;
  fromName?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured. Set it via: supabase secrets set RESEND_API_KEY=re_xxxxx');
    }

    const { to, customerName, subject, htmlBody, fromName }: RecoveryEmailRequest = await req.json();

    if (!to || !subject || !htmlBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, htmlBody' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert plain text to HTML if needed
    const html = htmlBody.includes('<') ? htmlBody : `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 12px; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px;">We saved your cart!</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Hi ${customerName}, your items are waiting for you.</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
          ${htmlBody.split('\n').map(line => `<p style="margin: 8px 0; color: #334155; line-height: 1.6;">${line}</p>`).join('')}
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="#" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Complete Your Order
          </a>
        </div>
        <p style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
          Sent by AutoAgent Recovery System
        </p>
      </div>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${fromName || 'AutoAgent Store'} <onboarding@resend.dev>`,
        to: [to],
        subject,
        html,
      }),
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(result.message || 'Resend API error');
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
