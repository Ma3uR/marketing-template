import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCallbackSignature,
  generateResponseSignature,
} from '@/lib/wayforpay';
import { sendPaymentNotification } from '@/lib/telegram';
import { createServiceClient } from '@/lib/supabase/server';
import { sendPurchaseConfirmationEmail } from '@/lib/send-email';
import type { WayForPayCallback } from '@/types/wayforpay';
import type { OrderInsert } from '@/types/database';

function extractProductName(orderReference: string): string {
  const tierMap: Record<string, string> = {
    basic: 'Курс Базовий',
    premium: 'Курс Преміум',
    vip: 'Курс VIP',
  };

  const tier = orderReference.split('_')[0];
  return tierMap[tier] || 'Курс';
}

async function saveOrder(callback: WayForPayCallback) {
  const supabase = await createServiceClient();

  const order: OrderInsert = {
    order_reference: callback.orderReference,
    amount: callback.amount,
    currency: callback.currency || 'UAH',
    status: callback.transactionStatus,
    customer_email: callback.email || null,
    customer_phone: callback.phone || null,
    product_name: extractProductName(callback.orderReference),
    card_pan: callback.cardPan || null,
    card_type: callback.cardType || null,
    payment_system: callback.paymentSystem || null,
    processed_at: callback.processingDate
      ? new Date(callback.processingDate * 1000).toISOString()
      : null,
  };

  const { error } = await supabase.from('orders').upsert(order as never, {
    onConflict: 'order_reference',
  });

  if (error) {
    console.error('Failed to save order:', error);
    throw error;
  }

  return order;
}

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

    // Save order to database
    try {
      await saveOrder(callback);
      console.log('Order saved to database:', callback.orderReference);
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      // Continue processing even if database save fails
    }

    switch (callback.transactionStatus) {
      case 'Approved':
        console.log('Payment approved:', callback.orderReference);
        await sendPaymentNotification(callback);

        // Send confirmation email
        if (callback.email) {
          try {
            await sendPurchaseConfirmationEmail({
              to: callback.email,
              customerName: callback.email.split('@')[0],
              productName: extractProductName(callback.orderReference),
              amount: callback.amount,
              currency: callback.currency || 'UAH',
              orderReference: callback.orderReference,
            });
            console.log('Confirmation email sent to:', callback.email);
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }
        }
        break;
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
