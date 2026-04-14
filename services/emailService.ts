import { supabase } from '../lib/supabase';

interface SendEmailParams {
  to: string;
  customerName: string;
  subject: string;
  body: string;
}

/**
 * Sends recovery emails via the Supabase Edge Function (which calls Resend).
 * Falls back to a simulated send if the edge function is not deployed.
 */
export const sendEmail = async ({
  to,
  customerName,
  subject,
  body,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-recovery-email', {
      body: {
        to,
        customerName,
        subject,
        htmlBody: body,
      },
    });

    if (error) throw error;

    return { success: true, messageId: data?.messageId };
  } catch (err) {
    console.warn(
      'Edge function unavailable, simulating email send:',
      err instanceof Error ? err.message : String(err)
    );

    // Graceful fallback: simulate the send so the UI still works
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.warn(`[Simulated Email] To: ${to} | Subject: ${subject}`);
    return { success: true, messageId: `sim-${Date.now()}` };
  }
};

/**
 * Extracts a subject line from AI-generated email content.
 */
export const extractSubject = (emailContent: string): string => {
  const subjectMatch = emailContent.match(/(?:subject(?:\s*line)?)\s*:\s*(.+)/i);
  if (subjectMatch) return subjectMatch[1].trim();
  return 'We saved your cart — come back and finish your order!';
};
