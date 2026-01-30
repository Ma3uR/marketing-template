import type { WayForPayCallback, PricingTier } from '@/types/wayforpay';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const TIER_NAMES: Record<PricingTier, string> = {
  basic: 'Базовий',
  premium: 'Преміум',
  vip: 'VIP',
};

function getTierFromOrderReference(orderReference: string): string {
  const tierMatch = orderReference.match(/^(basic|premium|vip)_/i);
  if (tierMatch) {
    const tier = tierMatch[1].toLowerCase() as PricingTier;
    return TIER_NAMES[tier] || tier;
  }
  return 'Невідомий';
}

export async function sendPaymentNotification(
  callback: WayForPayCallback
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured, skipping notification');
    return false;
  }

  const statusEmoji = callback.transactionStatus === 'Approved' ? '✅' : '❌';
  const tierName = getTierFromOrderReference(callback.orderReference);

  const message = `
💰 Нова оплата!

📦 Тариф: ${tierName}
💵 Сума: ${callback.amount} ${callback.currency}
📋 Замовлення: ${callback.orderReference}
📧 Email: ${callback.email || 'Не вказано'}
📱 Телефон: ${callback.phone || 'Не вказано'}

${statusEmoji} Статус: ${callback.transactionStatus}
${callback.transactionStatus !== 'Approved' ? `❗ Причина: ${callback.reason}` : ''}
🏦 Банк: ${callback.issuerBankName || 'Невідомо'}
💳 Картка: ${callback.cardPan}
`.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram notification failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Telegram notification error:', error);
    return false;
  }
}
