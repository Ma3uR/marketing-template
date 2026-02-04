import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();

  const orderReference = formData.get('orderReference') as string | null;
  const transactionStatus = formData.get('transactionStatus') as string | null;
  const reasonCode = formData.get('reasonCode') as string | null;

  const params = new URLSearchParams();
  if (orderReference) params.set('orderReference', orderReference);
  if (reasonCode) params.set('reasonCode', reasonCode);

  // Redirect to failure page for declined/failed payments
  const isSuccess = transactionStatus === 'Approved';
  const basePath = isSuccess ? '/payment/success' : '/payment/failure';
  const redirectUrl = `${basePath}${params.toString() ? `?${params.toString()}` : ''}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  return NextResponse.redirect(new URL(redirectUrl, baseUrl), 303);
}
