import crypto from 'crypto';
import type { WayForPayCallback } from '@/types/wayforpay';

const MERCHANT_SECRET = process.env.WAYFORPAY_MERCHANT_SECRET!;
const MERCHANT_LOGIN = process.env.WAYFORPAY_MERCHANT_LOGIN!;
const MERCHANT_DOMAIN = process.env.WAYFORPAY_MERCHANT_DOMAIN!;

export function generateSignature(data: string[]): string {
  const signString = data.join(';');
  return crypto
    .createHmac('md5', MERCHANT_SECRET)
    .update(signString, 'utf8')
    .digest('hex');
}

export function generatePurchaseSignature(params: {
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: string;
  productNames: string[];
  productCounts: number[];
  productPrices: number[];
}): string {
  const signatureData = [
    MERCHANT_LOGIN,
    MERCHANT_DOMAIN,
    params.orderReference,
    params.orderDate.toString(),
    params.amount.toString(),
    params.currency,
    ...params.productNames,
    ...params.productCounts.map(String),
    ...params.productPrices.map(String),
  ];

  return generateSignature(signatureData);
}

export function generateCallbackSignature(callback: {
  merchantAccount: string;
  orderReference: string;
  amount: number;
  currency: string;
  authCode: string;
  cardPan: string;
  transactionStatus: string;
  reasonCode: number;
}): string {
  const signatureData = [
    callback.merchantAccount,
    callback.orderReference,
    callback.amount.toString(),
    callback.currency,
    callback.authCode,
    callback.cardPan,
    callback.transactionStatus,
    callback.reasonCode.toString(),
  ];

  return generateSignature(signatureData);
}

export function generateResponseSignature(
  orderReference: string,
  status: 'accept' | 'refuse',
  time: number
): string {
  return generateSignature([orderReference, status, time.toString()]);
}

export function verifyCallbackSignature(callback: WayForPayCallback): boolean {
  const expectedSignature = generateCallbackSignature({
    merchantAccount: callback.merchantAccount,
    orderReference: callback.orderReference,
    amount: callback.amount,
    currency: callback.currency,
    authCode: callback.authCode,
    cardPan: callback.cardPan,
    transactionStatus: callback.transactionStatus,
    reasonCode: callback.reasonCode,
  });

  return expectedSignature === callback.merchantSignature;
}

export function getMerchantConfig() {
  return {
    login: MERCHANT_LOGIN,
    domain: MERCHANT_DOMAIN,
  };
}
