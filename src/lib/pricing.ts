import type { PricingTier, PricingConfig } from '@/types/wayforpay';

export const PRICING: Record<PricingTier, PricingConfig> = {
  basic: {
    title: 'Базовий',
    price: 799,
    originalPrice: 1200,
    features: [
      'Доступ до 12 модулів',
      'Шаблони стратегій',
      'Доступ до чату учнів',
      'Сертифікат про завершення',
    ],
    isPopular: false,
  },
  premium: {
    title: 'Преміум',
    price: 7999,
    originalPrice: 12800,
    features: [
      'Все з Базового',
      '2 групові сесії зі мною',
      'Перевірка ДЗ кураторами',
      'Закритий чат з фахівцями',
      'Бонус: гайд по креативах',
      'Доступ на 12 місяців',
    ],
    isPopular: true,
  },
  vip: {
    title: 'VIP',
    price: 12999,
    originalPrice: 19999,
    features: [
      'Все з Преміум',
      'Особистий менторинг (3 зустрічі)',
      'Аудит твоєї поточної реклами',
      'Розробка стратегії під ключ',
      'Пріоритетна підтримка 24/7',
    ],
    isPopular: false,
    urgency: 'Залишилось 3 місця',
  },
};
