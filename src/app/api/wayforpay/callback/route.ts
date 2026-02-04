import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCallbackSignature,
  generateResponseSignature,
} from '@/lib/wayforpay';
import { sendPaymentNotification } from '@/lib/telegram';
import type { WayForPayCallback } from '@/types/wayforpay';

function isValidCallback(data: unknown): data is WayForPayCallback {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.merchantAccount === 'string' &&
    typeof obj.orderReference === 'string' &&
    typeof obj.merchantSignature === 'string' &&
    typeof obj.amount === 'number' &&
    typeof obj.currency === 'string' &&
    typeof obj.authCode === 'string' &&
    typeof obj.cardPan === 'string' &&
    typeof obj.transactionStatus === 'string' &&
    typeof obj.reasonCode === 'number'
  );
}

export async function POST(request: NextRequest) {
  try {
    const data: unknown = await request.json();

    if (!isValidCallback(data)) {
      return NextResponse.json(
        { error: 'Invalid callback data structure' },
        { status: 400 }
      );
    }

    const callback = data;

    if (!verifyCallbackSignature(callback)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (callback.transactionStatus) {
      case 'Approved':
      case 'Declined':
      case 'Refunded':
        await sendPaymentNotification(callback);
        break;
    }

    const time = Math.floor(Date.now() / 1000);
    const signature = generateResponseSignature(
      callback.orderReference,
      'accept',
      time
    );

    return NextResponse.json({
      orderReference: callback.orderReference,
      status: 'accept',
      time,
      signature,
    });
  } catch (error) {
    console.error('Callback processing failed:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
