import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const orderReference = formData.get('orderReference') as string | null;
  const transactionStatus = formData.get('transactionStatus') as string | null;
  const reasonCode = formData.get('reasonCode') as string | null;

  const params = new URLSearchParams();
  if (orderReference) params.set('orderReference', orderReference);
  if (transactionStatus) params.set('status', transactionStatus);
  if (reasonCode) params.set('reasonCode', reasonCode);

  const redirectUrl = `/payment/success${params.toString() ? `?${params.toString()}` : ''}`;

  return NextResponse.redirect(new URL(redirectUrl, request.url), 303);
}
