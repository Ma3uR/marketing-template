# Testing Guide

This guide covers how to test WayForPay integration in development.

## Test Credentials

Use these credentials for testing:

```env
WAYFORPAY_MERCHANT_LOGIN=test_merch_n1
WAYFORPAY_MERCHANT_SECRET=flk3409refn54t54t*FNJRET
WAYFORPAY_MERCHANT_DOMAIN=merchant.com.ua
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Test Cards

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | `4111 1111 1111 1111` | Any 3 digits | Any future date |
| Mastercard | `5454 5454 5454 5454` | Any 3 digits | Any future date |

## Testing Flow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Navigate to Landing Page

Open [http://localhost:3000](http://localhost:3000)

### 3. Select a Pricing Tier

Click "Обрати Базовий", "Обрати Преміум", or "Обрати VIP"

### 4. Complete Test Payment

1. You'll be redirected to WayForPay test form
2. Enter test card number: `4111 1111 1111 1111`
3. Enter any CVV (e.g., `123`)
4. Enter any future expiry date (e.g., `12/26`)
5. Complete payment

### 5. Verify Callback

Check your terminal for callback logs:

```
WayForPay callback received: {
  orderReference: 'premium_1706234567890',
  status: 'Approved',
  amount: 7999
}
Payment approved: premium_1706234567890
```

### 6. Check Success Page

You should be redirected to `/payment/success`

## Testing Telegram Notifications

### Setup

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather)
2. Get your chat ID from [@userinfobot](https://t.me/userinfobot)
3. Add to `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Verify

After a successful test payment, you should receive a Telegram message:

```
💰 Нова оплата!

📦 Тариф: Преміум
💵 Сума: 7999 UAH
📋 Замовлення: premium_1706234567890
📧 Email: test@example.com
📱 Телефон: +380...

✅ Статус: Approved
🏦 Банк: Test Bank
💳 Картка: 411111****1111
```

## Callback Testing with ngrok

For testing callbacks in local development:

1. Install ngrok:
```bash
npm install -g ngrok
```

2. Start your dev server:
```bash
npm run dev
```

3. In another terminal, expose localhost:
```bash
ngrok http 3000
```

4. Update `NEXT_PUBLIC_APP_URL` with ngrok URL:
```env
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

5. Test payment - callback will now reach your local server

## Transaction Status Codes

| Status | Description |
|--------|-------------|
| `Approved` | Payment successful |
| `Declined` | Payment declined |
| `Refunded` | Payment refunded |
| `Expired` | Payment session expired |
| `InProcessing` | Payment in progress |

## Reason Codes

| Code | Description |
|------|-------------|
| 1100 | OK |
| 1101 | Transaction not found |
| 1102 | Incorrect parameters |
| 1103 | Invalid signature |
| 1104 | Invalid currency |
| 1105 | Invalid amount |
| 1106 | Invalid card |
| 1108 | Insufficient funds |
| 1109 | Card expired |

## Common Issues

### "Invalid signature" Error

- Check that `WAYFORPAY_MERCHANT_SECRET` is correct
- Verify signature generation order matches WayForPay documentation
- Ensure UTF-8 encoding

### Callback Not Received

- Verify `NEXT_PUBLIC_APP_URL` is accessible from internet
- Check firewall settings
- Use ngrok for local testing

### Payment Form Not Loading

- Check browser console for errors
- Verify all required fields are sent
- Check `merchantAccount` and `merchantDomainName` are correct

## Production Checklist

Before going live:

- [ ] Replace test credentials with production credentials
- [ ] Update `WAYFORPAY_MERCHANT_DOMAIN` to your actual domain
- [ ] Configure HTTPS
- [ ] Set up Telegram notifications
- [ ] Test full payment flow with real card
- [ ] Configure WayForPay callback URL in merchant dashboard
