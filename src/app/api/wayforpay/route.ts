import { NextRequest, NextResponse } from 'next/server';
import { generatePurchaseSignature, getMerchantConfig } from '@/lib/wayforpay';
import { PRICING } from '@/lib/pricing';
import type { PricingTier } from '@/types/wayforpay';

export async function POST(request: NextRequest) {
  try {
    // Use only the trusted environment variable for redirect URLs
    // Never trust client-provided Origin/Referer headers for security-sensitive redirects
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

    if (!APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL environment variable is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { tier } = body as { tier: PricingTier };

    if (!tier || !PRICING[tier]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const config = PRICING[tier];
    const merchant = getMerchantConfig();

    const orderReference = `${tier}_${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000);
    const currency = 'UAH';

    const productNames = [`Курс "${config.title}"`];
    const productPrices = [config.price];
    const productCounts = [1];

    const merchantSignature = generatePurchaseSignature({
      orderReference,
      orderDate,
      amount: config.price,
      currency,
      productNames,
      productCounts,
      productPrices,
    });

    const formData = {
      merchantAccount: merchant.login,
      merchantDomainName: merchant.domain,
      merchantSignature,
      orderReference,
      orderDate,
      amount: config.price,
      currency,
      productName: productNames,
      productPrice: productPrices,
      productCount: productCounts,
      returnUrl: `${APP_URL}/payment/success/callback`,
      approvedUrl: `${APP_URL}/payment/success/callback`,
      declinedUrl: `${APP_URL}/payment/failure/callback`,
      serviceUrl: `${APP_URL}/api/wayforpay/callback`,
      language: 'UA',
    };

    return NextResponse.json(formData);
  } catch (error) {
    console.error('WayForPay error:', error);
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
