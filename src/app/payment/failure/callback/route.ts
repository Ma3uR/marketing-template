import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const orderReference = formData.get('orderReference') as string | null;
    const reasonCode = formData.get('reasonCode') as string | null;

    const params = new URLSearchParams();
    if (orderReference) params.set('orderReference', orderReference);
    if (reasonCode) params.set('reasonCode', reasonCode);

    const redirectUrl = `/payment/failure${params.toString() ? `?${params.toString()}` : ''}`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
    return NextResponse.redirect(new URL(redirectUrl, baseUrl), 303);
  } catch {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
    return NextResponse.redirect(new URL('/payment/failure', baseUrl), 303);
  }
}
