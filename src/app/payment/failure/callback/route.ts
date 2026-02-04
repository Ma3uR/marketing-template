import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const orderReference = formData.get('orderReference') as string | null;
    const reasonCode = formData.get('reasonCode') as string | null;

    const params = new URLSearchParams();
    if (orderReference) params.set('orderReference', orderReference);
    if (reasonCode) params.set('reasonCode', reasonCode);

    const redirectUrl = `/payment/failure${params.toString() ? `?${params.toString()}` : ''}`;

    return NextResponse.redirect(new URL(redirectUrl, request.url), 303);
  } catch {
    return NextResponse.redirect(new URL('/payment/failure', request.url), 303);
  }
}
