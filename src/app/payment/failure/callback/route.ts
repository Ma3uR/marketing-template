import { NextRequest, NextResponse } from 'next/server';

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  return `${protocol}://${host}`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const orderReference = formData.get('orderReference') as string | null;
  const reasonCode = formData.get('reasonCode') as string | null;

  const params = new URLSearchParams();
  if (orderReference) params.set('orderReference', orderReference);
  if (reasonCode) params.set('reasonCode', reasonCode);

  const redirectUrl = `/payment/failure${params.toString() ? `?${params.toString()}` : ''}`;

  const baseUrl = getBaseUrl(request);
  return NextResponse.redirect(new URL(redirectUrl, baseUrl), 303);
}
