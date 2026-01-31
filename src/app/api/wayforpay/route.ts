import { NextRequest, NextResponse } from 'next/server';
import { generatePurchaseSignature, getMerchantConfig } from '@/lib/wayforpay';
import { PRICING } from '@/lib/pricing';
import type { PricingTier } from '@/types/wayforpay';

export async function POST(request: NextRequest) {
  try {
    // Get origin from request headers (more reliable than env var)
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '').split('/').slice(0, 3).join('/');
    const APP_URL = origin || process.env.NEXT_PUBLIC_APP_URL!;
    console.log('APP_URL:', APP_URL, '| Origin:', origin, '| Env:', process.env.NEXT_PUBLIC_APP_URL);

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

    // Debug logging
    console.log('WayForPay Request:', formData);

    return NextResponse.json(formData);
  } catch (error) {
    console.error('WayForPay error:', error);
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
}

