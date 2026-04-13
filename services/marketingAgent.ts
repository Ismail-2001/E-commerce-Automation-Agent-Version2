import { Product } from '../types';
import { sanitizeForPrompt } from '../lib/promptSafety';

export interface MarketingCampaign {
  productId: string;
  productName: string;
  campaignType: 'flash_sale' | 'new_arrival' | 'seasonal' | 'clearance' | 'vip';
  headline: string;
  adCopy: string;
  ctaText: string;
  targetAudience: string;
  suggestedChannels: string[];
  urgencyLevel: 'high' | 'medium' | 'low';
}

/**
 * Marketing agent — generates campaign briefs and ad copy for products.
 */
export function generateCampaignBriefs(products: Product[]): MarketingCampaign[] {
  return products.map(product => {
    // Determine campaign type based on inventory status
    if (product.stock > 100) {
      return {
        productId: product.id,
        productName: product.name,
        campaignType: 'clearance' as const,
        headline: `Flash Sale: ${product.name} — Up to 25% Off!`,
        adCopy: `Don't miss this limited-time clearance on ${product.name}. Premium quality at an unbeatable price — only while supplies last. Our ${product.category} best-seller is now more affordable than ever.`,
        ctaText: 'Shop the Sale',
        targetAudience: `${product.category} enthusiasts, deal seekers, previous category buyers`,
        suggestedChannels: ['Instagram Stories', 'Email Newsletter', 'Facebook Ads', 'Google Shopping'],
        urgencyLevel: 'high' as const,
      };
    }

    if (product.stock === 0) {
      return {
        productId: product.id,
        productName: product.name,
        campaignType: 'new_arrival' as const,
        headline: `Coming Back Soon: ${product.name}`,
        adCopy: `The wait is almost over! ${product.name} is restocking soon. Sign up for priority access and be the first to know when it's back. Don't miss out this time.`,
        ctaText: 'Get Notified',
        targetAudience: `Previous buyers, wishlist users, ${product.category} followers`,
        suggestedChannels: ['Email Waitlist', 'Push Notifications', 'SMS'],
        urgencyLevel: 'medium' as const,
      };
    }

    if (product.stock < 10) {
      return {
        productId: product.id,
        productName: product.name,
        campaignType: 'flash_sale' as const,
        headline: `Almost Gone: Only ${product.stock} Left!`,
        adCopy: `${product.name} is selling fast — only ${product.stock} units remain. At $${product.price}, this ${product.category} essential won't last the week. Grab yours before it's gone.`,
        ctaText: 'Buy Now',
        targetAudience: `Cart abandoners, ${product.category} browsers, urgency-responsive buyers`,
        suggestedChannels: ['Retargeting Ads', 'Email', 'Instagram Feed', 'TikTok'],
        urgencyLevel: 'high' as const,
      };
    }

    return {
      productId: product.id,
      productName: product.name,
      campaignType: 'seasonal' as const,
      headline: `Discover ${product.name} — Elevate Your ${product.category}`,
      adCopy: `Meet ${product.name}, the ${product.category} upgrade you've been looking for. Crafted for quality, priced at $${product.price}. Join thousands of happy customers who've already made the switch.`,
      ctaText: 'Explore Now',
      targetAudience: `${product.category} enthusiasts, lifestyle shoppers, ages 25-45`,
      suggestedChannels: ['Instagram Feed', 'Pinterest', 'Google Search', 'Blog Content'],
      urgencyLevel: 'low' as const,
    };
  });
}

/**
 * Generates AI-powered ad copy using DeepSeek.
 */
export async function generateAICopy(product: Product, platform: string): Promise<string> {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    return `Check out ${product.name} — the ${product.category} essential you've been waiting for! Now at $${product.price}. Shop now!`;
  }

  const safeProductName = sanitizeForPrompt(product.name);
  const safeCategory = sanitizeForPrompt(product.category);

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `You are a world-class e-commerce copywriter specializing in ${platform} ads.` },
          {
            role: 'user',
            content: `Write a compelling ${platform} ad for:
Product: ${safeProductName}
Category: ${safeCategory}
Price: $${product.price}
Stock: ${product.stock} units

Requirements:
- Platform: ${platform}
- Tone: Engaging, urgent, conversion-focused
- Include a strong CTA
- Keep it under 150 words`,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Could not generate copy.';
  } catch {
    return `${product.name} — Premium ${product.category} at $${product.price}. Limited stock available. Order now!`;
  }
}
