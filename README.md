# Marketing Landing with WayForPay Integration

A Next.js 15 marketing landing page for a Ukrainian targeting course with WayForPay payment integration and Telegram notifications.

## Features

- Modern, animated landing page with Framer Motion
- WayForPay payment gateway integration
- Telegram bot notifications for new payments
- Three pricing tiers (Basic, Premium, VIP)
- Fully Ukrainian localization
- Responsive design with Tailwind CSS

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd marketing-template
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

4. Configure environment variables (see below)

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WAYFORPAY_MERCHANT_LOGIN` | Your WayForPay merchant account login | Yes |
| `WAYFORPAY_MERCHANT_SECRET` | Your WayForPay secret key | Yes |
| `WAYFORPAY_MERCHANT_DOMAIN` | Your domain registered in WayForPay | Yes |
| `NEXT_PUBLIC_APP_URL` | Your application URL (e.g., `https://yourdomain.com`) | Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather | No |
| `TELEGRAM_CHAT_ID` | Telegram chat/group ID for notifications | No |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── wayforpay/
│   │       ├── route.ts         # Payment initialization
│   │       └── callback/
│   │           └── route.ts     # Payment callback handler
│   ├── payment/
│   │   ├── success/page.tsx     # Success page
│   │   └── failure/page.tsx     # Failure page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── MarketingCourseLanding.tsx
│   ├── PricingCard.tsx
│   └── CheckoutButton.tsx
├── lib/
│   ├── wayforpay.ts             # Signature generation
│   ├── telegram.ts              # Telegram notifications
│   └── pricing.ts               # Pricing configuration
└── types/
    └── wayforpay.ts             # TypeScript interfaces
```

## Pricing Tiers

| Tier | Price | Original |
|------|-------|----------|
| Базовий (Basic) | 799 ₴ | 1200 ₴ |
| Преміум (Premium) | 7999 ₴ | 12800 ₴ |
| VIP | 12999 ₴ | 19999 ₴ |

## Telegram Notifications

When a payment is processed, you'll receive a Telegram message with:

- Tier name
- Amount
- Order reference
- Customer email/phone
- Transaction status
- Bank info

### Setting up Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the token to `TELEGRAM_BOT_TOKEN`
4. Get your chat ID (message [@userinfobot](https://t.me/userinfobot))
5. Add to `TELEGRAM_CHAT_ID`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

## WayForPay Setup

1. Register at [WayForPay](https://wayforpay.com)
2. Create a merchant account
3. Get credentials from Store Settings
4. Add your domain to allowed domains
5. Configure callback URL: `https://yourdomain.com/api/wayforpay/callback`

## Testing

See [TESTING.md](./TESTING.md) for test credentials and instructions.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private - All rights reserved
