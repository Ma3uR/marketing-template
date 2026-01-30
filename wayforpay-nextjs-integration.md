# WayForPay Integration Guide for Next.js

A comprehensive guide for integrating WayForPay payment gateway into your Next.js application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Endpoints](#api-endpoints)
6. [Signature Generation](#signature-generation)
7. [Implementation](#implementation)
8. [Callback Handling](#callback-handling)
9. [Testing](#testing)
10. [Additional Operations](#additional-operations)

---

## Overview

WayForPay is a payment gateway that supports card payments, Apple Pay, Google Pay, and various local payment methods. The integration supports two payment patterns:

- **Single-stage (SALE)**: Authorization and withdrawal happen in one step
- **Two-stage (AUTH + Settle)**: Authorization first, then confirmation within 21 days

### Key API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `https://secure.wayforpay.com/pay` | Payment form submission (Purchase) |
| `https://api.wayforpay.com/api` | API operations (Refund, Check Status, etc.) |
| `https://secure.wayforpay.com/verify` | Card verification |

---

## Prerequisites

1. WayForPay merchant account
2. Merchant credentials from Store Settings:
   - **Merchant Login** (merchantAccount)
   - **Merchant Secret Key** (SecretKey)
3. Next.js 13+ with App Router or Pages Router

---

## Installation

### Option 1: Using the TypeScript Package (Recommended)

```bash
npm install wayforpay-ts-integration
```

### Option 2: Manual Implementation

No additional packages required - use the native `crypto` module for signature generation.

---

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
WAYFORPAY_MERCHANT_LOGIN=your_merchant_login
WAYFORPAY_MERCHANT_SECRET=your_secret_key
WAYFORPAY_MERCHANT_DOMAIN=yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### TypeScript Types

Create `types/wayforpay.ts`:

```typescript
export interface WayForPayProduct {
  name: string;
  price: number;
  count: number;
}

export interface WayForPayRequest {
  merchantAccount: string;
  merchantDomainName: string;
  merchantSignature: string;
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: 'UAH' | 'USD' | 'EUR';
  productName: string[];
  productPrice: number[];
  productCount: number[];
  clientFirstName?: string;
  clientLastName?: string;
  clientEmail?: string;
  clientPhone?: string;
  language?: 'UA' | 'EN' | 'RU';
  returnUrl?: string;
  serviceUrl?: string;
}

export interface WayForPayCallback {
  merchantAccount: string;
  orderReference: string;
  merchantSignature: string;
  amount: number;
  currency: string;
  authCode: string;
  email: string;
  phone: string;
  createdDate: number;
  processingDate: number;
  cardPan: string;
  cardType: string;
  issuerBankCountry: string;
  issuerBankName: string;
  recToken?: string;
  transactionStatus: 'Approved' | 'Declined' | 'Refunded' | 'Expired' | 'InProcessing';
  reason: string;
  reasonCode: number;
  fee: number;
  paymentSystem: string;
}

export interface WayForPayCallbackResponse {
  orderReference: string;
  status: 'accept' | 'refuse';
  time: number;
  signature: string;
}

export type TransactionType =
  | 'PURCHASE'
  | 'SETTLE'
  | 'CHARGE'
  | 'REFUND'
  | 'CHECK_STATUS'
  | 'P2P_CREDIT'
  | 'CREATE_INVOICE'
  | 'TRANSACTION_LIST';
```

---

## Signature Generation

WayForPay uses HMAC-MD5 signatures for request validation.

### Create `lib/wayforpay.ts`:

```typescript
import crypto from 'crypto';

const MERCHANT_SECRET = process.env.WAYFORPAY_MERCHANT_SECRET!;
const MERCHANT_LOGIN = process.env.WAYFORPAY_MERCHANT_LOGIN!;
const MERCHANT_DOMAIN = process.env.WAYFORPAY_MERCHANT_DOMAIN!;

/**
 * Generate HMAC-MD5 signature
 */
export function generateSignature(data: string[]): string {
  const signString = data.join(';');
  return crypto
    .createHmac('md5', MERCHANT_SECRET)
    .update(signString, 'utf8')
    .digest('hex');
}

/**
 * Generate signature for Purchase request
 * Parameters: merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;productName[0];...;productCount[0];...;productPrice[0];...
 */
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

/**
 * Generate signature for callback verification
 * Parameters: merchantAccount;orderReference;amount;currency;authCode;cardPan;transactionStatus;reasonCode
 */
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

/**
 * Generate signature for callback response
 * Parameters: orderReference;status;time
 */
export function generateResponseSignature(
  orderReference: string,
  status: 'accept' | 'refuse',
  time: number
): string {
  return generateSignature([orderReference, status, time.toString()]);
}

/**
 * Generate signature for API requests (Check Status, Refund, etc.)
 */
export function generateApiSignature(params: {
  orderReference: string;
  amount?: number;
  currency?: string;
}): string {
  const signatureData = params.amount && params.currency
    ? [MERCHANT_LOGIN, params.orderReference, params.amount.toString(), params.currency]
    : [MERCHANT_LOGIN, params.orderReference];

  return generateSignature(signatureData);
}

/**
 * Verify callback signature from WayForPay
 */
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
```

---

## Implementation

### App Router Implementation

#### Payment API Route: `app/api/wayforpay/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generatePurchaseSignature } from '@/lib/wayforpay';

const MERCHANT_LOGIN = process.env.WAYFORPAY_MERCHANT_LOGIN!;
const MERCHANT_DOMAIN = process.env.WAYFORPAY_MERCHANT_DOMAIN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, orderId, clientInfo } = body;

    // Calculate totals
    const productNames = products.map((p: any) => p.name);
    const productPrices = products.map((p: any) => p.price);
    const productCounts = products.map((p: any) => p.count);
    const amount = products.reduce(
      (sum: number, p: any) => sum + p.price * p.count,
      0
    );

    const orderReference = orderId || `ORDER_${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000);
    const currency = 'UAH';

    // Generate signature
    const merchantSignature = generatePurchaseSignature({
      orderReference,
      orderDate,
      amount,
      currency,
      productNames,
      productCounts,
      productPrices,
    });

    // Build form HTML
    const formFields = {
      merchantAccount: MERCHANT_LOGIN,
      merchantDomainName: MERCHANT_DOMAIN,
      merchantSignature,
      orderReference,
      orderDate,
      amount,
      currency,
      productName: productNames,
      productPrice: productPrices,
      productCount: productCounts,
      returnUrl: `${APP_URL}/payment/success`,
      serviceUrl: `${APP_URL}/api/wayforpay/callback`,
      ...(clientInfo?.firstName && { clientFirstName: clientInfo.firstName }),
      ...(clientInfo?.lastName && { clientLastName: clientInfo.lastName }),
      ...(clientInfo?.email && { clientEmail: clientInfo.email }),
      ...(clientInfo?.phone && { clientPhone: clientInfo.phone }),
    };

    const formHtml = generatePaymentForm(formFields);

    return new NextResponse(formHtml, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('WayForPay error:', error);
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
}

function generatePaymentForm(fields: Record<string, any>): string {
  const inputs = Object.entries(fields)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((v) => `<input type="hidden" name="${key}[]" value="${v}">`)
          .join('\n');
      }
      return `<input type="hidden" name="${key}" value="${value}">`;
    })
    .join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to payment...</title>
    </head>
    <body>
      <form id="wayforpay-form" action="https://secure.wayforpay.com/pay" method="POST">
        ${inputs}
      </form>
      <script>
        document.getElementById('wayforpay-form').submit();
      </script>
    </body>
    </html>
  `;
}
```

#### Callback Handler: `app/api/wayforpay/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyCallbackSignature, generateResponseSignature } from '@/lib/wayforpay';
import type { WayForPayCallback } from '@/types/wayforpay';

export async function POST(request: NextRequest) {
  try {
    const callback: WayForPayCallback = await request.json();

    // Verify signature
    if (!verifyCallbackSignature(callback)) {
      console.error('Invalid callback signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process based on transaction status
    switch (callback.transactionStatus) {
      case 'Approved':
        await handleApprovedPayment(callback);
        break;
      case 'Declined':
        await handleDeclinedPayment(callback);
        break;
      case 'Refunded':
        await handleRefundedPayment(callback);
        break;
      default:
        console.log('Unknown status:', callback.transactionStatus);
    }

    // Send response to WayForPay
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
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}

async function handleApprovedPayment(callback: WayForPayCallback) {
  // Update order status in database
  console.log('Payment approved:', callback.orderReference);
  // TODO: Update your database
  // await db.orders.update({
  //   where: { id: callback.orderReference },
  //   data: { status: 'paid', transactionId: callback.authCode }
  // });
}

async function handleDeclinedPayment(callback: WayForPayCallback) {
  console.log('Payment declined:', callback.orderReference, callback.reason);
  // TODO: Update your database
}

async function handleRefundedPayment(callback: WayForPayCallback) {
  console.log('Payment refunded:', callback.orderReference);
  // TODO: Update your database
}
```

### Frontend Component: `components/CheckoutButton.tsx`

```typescript
'use client';

import { useState } from 'react';

interface Product {
  name: string;
  price: number;
  count: number;
}

interface CheckoutButtonProps {
  products: Product[];
  orderId?: string;
  clientInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

export function CheckoutButton({ products, orderId, clientInfo }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/wayforpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, orderId, clientInfo }),
      });

      if (!response.ok) {
        throw new Error('Payment initialization failed');
      }

      // Get HTML form and redirect
      const html = await response.text();
      document.body.innerHTML = html;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
```

### Alternative: Widget Integration

For a popup-based checkout experience, add the WayForPay widget:

```typescript
// components/WayForPayWidget.tsx
'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Wayforpay: any;
  }
}

interface WidgetProps {
  paymentData: {
    merchantAccount: string;
    merchantDomainName: string;
    merchantSignature: string;
    orderReference: string;
    orderDate: number;
    amount: number;
    currency: string;
    productName: string[];
    productPrice: number[];
    productCount: number[];
  };
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function WayForPayWidget({ paymentData, onSuccess, onError }: WidgetProps) {
  useEffect(() => {
    // Load WayForPay widget script
    const script = document.createElement('script');
    script.src = 'https://secure.wayforpay.com/server/pay-widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openWidget = () => {
    if (!window.Wayforpay) {
      console.error('WayForPay widget not loaded');
      return;
    }

    const wayforpay = new window.Wayforpay();
    wayforpay.run(
      paymentData,
      function (response: any) {
        console.log('Payment successful:', response);
        onSuccess?.();
      },
      function (error: any) {
        console.error('Payment failed:', error);
        onError?.(error);
      }
    );
  };

  return (
    <button
      onClick={openWidget}
      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      Pay with Widget
    </button>
  );
}
```

---

## Callback Handling

WayForPay sends callbacks to your `serviceUrl` for payment status updates. If your server doesn't respond correctly within 4 days, callbacks will continue.

### Expected Response Format

```json
{
  "orderReference": "ORDER_123456",
  "status": "accept",
  "time": 1700000000,
  "signature": "generated_hmac_md5_signature"
}
```

### Response Signature

Generate using: `orderReference;status;time` joined with `;`

---

## Testing

### Test Credentials

| Field | Value |
|-------|-------|
| Merchant Account | `test_merch_n1` |
| Merchant Domain | `merchant.com.ua` |

### Test Card Numbers

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | `4111 1111 1111 1111` | Any 3 digits | Any future date |
| Mastercard | `5454 5454 5454 5454` | Any 3 digits | Any future date |

### Test Environment Setup

```env
# .env.local for testing
WAYFORPAY_MERCHANT_LOGIN=test_merch_n1
WAYFORPAY_MERCHANT_SECRET=flk3409refn54t54t*FNJRET
WAYFORPAY_MERCHANT_DOMAIN=merchant.com.ua
```

---

## Additional Operations

### Check Payment Status

```typescript
// lib/wayforpay-api.ts
export async function checkPaymentStatus(orderReference: string) {
  const signature = generateApiSignature({ orderReference });

  const response = await fetch('https://api.wayforpay.com/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transactionType: 'CHECK_STATUS',
      merchantAccount: process.env.WAYFORPAY_MERCHANT_LOGIN,
      orderReference,
      merchantSignature: signature,
      apiVersion: 1,
    }),
  });

  return response.json();
}
```

### Refund Payment

```typescript
export async function refundPayment(
  orderReference: string,
  amount: number,
  currency: string,
  comment?: string
) {
  const signature = generateSignature([
    process.env.WAYFORPAY_MERCHANT_LOGIN!,
    orderReference,
    amount.toString(),
    currency,
  ]);

  const response = await fetch('https://api.wayforpay.com/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transactionType: 'REFUND',
      merchantAccount: process.env.WAYFORPAY_MERCHANT_LOGIN,
      orderReference,
      amount,
      currency,
      comment: comment || 'Refund',
      merchantSignature: signature,
      apiVersion: 1,
    }),
  });

  return response.json();
}
```

### Get Transaction List

```typescript
export async function getTransactionList(
  dateBegin: number,
  dateEnd: number
) {
  const signature = generateSignature([
    process.env.WAYFORPAY_MERCHANT_LOGIN!,
    dateBegin.toString(),
    dateEnd.toString(),
  ]);

  const response = await fetch('https://api.wayforpay.com/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transactionType: 'TRANSACTION_LIST',
      merchantAccount: process.env.WAYFORPAY_MERCHANT_LOGIN,
      dateBegin,
      dateEnd,
      merchantSignature: signature,
      apiVersion: 1,
    }),
  });

  return response.json();
}
```

---

## Transaction Status Codes

| Status | Description |
|--------|-------------|
| `Approved` | Payment successful |
| `Declined` | Payment declined |
| `Refunded` | Payment refunded |
| `Expired` | Payment expired |
| `InProcessing` | Payment in progress |
| `WaitingAuthComplete` | Waiting for 3DS |

## Reason Codes

| Code | Description |
|------|-------------|
| 1100 | Ok |
| 1101 | Declined, transaction not found |
| 1102 | Declined, incorrect parameters |
| 1103 | Declined, invalid signature |
| 1104 | Declined, invalid currency |
| 1105 | Declined, invalid amount |
| 1106 | Declined, invalid card |
| 1108 | Declined, insufficient funds |
| 1109 | Declined, card expired |

---

## Security Best Practices

1. **Never expose your Secret Key** - Keep it server-side only
2. **Always verify callback signatures** - Prevent fraudulent callbacks
3. **Use HTTPS** - All endpoints must be secure
4. **Validate amounts** - Recalculate on server before payment
5. **Log transactions** - Keep records for disputes
6. **Handle timeouts** - WayForPay retries for 4 days

---

## Troubleshooting

### Common Issues

1. **Invalid Signature Error**
   - Check parameter order in signature string
   - Ensure UTF-8 encoding
   - Verify secret key is correct

2. **Callback Not Received**
   - Ensure `serviceUrl` is publicly accessible
   - Check firewall/CORS settings
   - Verify HTTPS certificate

3. **3DS Issues**
   - Implement `COMPLETE_3DS` for host-to-host integration
   - Use redirect-based flow for simpler integration

---

## Resources

- [WayForPay Documentation](https://wiki.wayforpay.com/en/)
- [Purchase API](https://wiki.wayforpay.com/en/view/852102)
- [Test Details](https://wiki.wayforpay.com/en/view/852472)
- [Check Status API](https://wiki.wayforpay.com/en/view/852117)
- [Refund API](https://wiki.wayforpay.com/en/view/852115)
- [TypeScript Package](https://github.com/Wlad1slav/wayforpay-ts-integration)
