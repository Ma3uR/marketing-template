import crypto from 'crypto';
import type { WayForPayCallback } from '@/types/wayforpay';

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Please check your .env file.`
    );
  }
  return value;
}

export function generateSignature(data: string[]): string {
  const merchantSecret = getRequiredEnvVar('WAYFORPAY_MERCHANT_SECRET');
  const signString = data.join(';');
  return crypto
    .createHmac('md5', merchantSecret)
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
  const merchantLogin = getRequiredEnvVar('WAYFORPAY_MERCHANT_LOGIN');
  const merchantDomain = getRequiredEnvVar('WAYFORPAY_MERCHANT_DOMAIN');

  const signatureData = [
    merchantLogin,
    merchantDomain,
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
    login: getRequiredEnvVar('WAYFORPAY_MERCHANT_LOGIN'),
    domain: getRequiredEnvVar('WAYFORPAY_MERCHANT_DOMAIN'),
  };
}
