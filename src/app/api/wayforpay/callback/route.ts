import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCallbackSignature,
  generateResponseSignature,
} from '@/lib/wayforpay';
import { sendPaymentNotification } from '@/lib/telegram';
import type { WayForPayCallback } from '@/types/wayforpay';

export async function POST(request: NextRequest) {
  try {
    const callback: WayForPayCallback = await request.json();

    console.log('WayForPay callback received:', {
      orderReference: callback.orderReference,
      status: callback.transactionStatus,
      amount: callback.amount,
    });

    if (!verifyCallbackSignature(callback)) {
      console.error('Invalid callback signature for:', callback.orderReference);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (callback.transactionStatus) {
      case 'Approved':
        console.log('Payment approved:', callback.orderReference);
        await sendPaymentNotification(callback);
        break;
      case 'Declined':
        console.log(
          'Payment declined:',
          callback.orderReference,
          callback.reason
        );
        await sendPaymentNotification(callback);
        break;
      case 'Refunded':
        console.log('Payment refunded:', callback.orderReference);
        await sendPaymentNotification(callback);
        break;
      default:
        console.log('Unknown status:', callback.transactionStatus);
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
    console.error('Callback processing error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
