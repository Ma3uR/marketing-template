'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { CheckoutButton } from './CheckoutButton';
import type { PricingTier } from '@/types/wayforpay';

interface PricingCardProps {
  tier: PricingTier;
  title: string;
  price: number;
  originalPrice: number;
  features: string[];
  isPopular: boolean;
  urgency?: string;
  delay: number;
}

export function PricingCard({
  tier,
  title,
  price,
  originalPrice,
  features,
  isPopular,
  urgency,
  delay,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`relative flex flex-col p-8 rounded-3xl border transition-all ${
        isPopular
          ? 'bg-gradient-to-b from-[#1a0d2e] to-[#2d1b4e] border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-105 z-10'
          : 'bg-[#1a0d2e]/40 border-purple-500/20'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#d946ef] to-[#fb7185] text-white text-xs font-bold rounded-full uppercase tracking-wider">
          Найпопулярніший
        </div>
      )}
      {urgency && (
        <div className="absolute -top-4 right-4 px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md uppercase">
          {urgency}
        </div>
      )}
      <h4 className="text-lg font-medium text-gray-300 mb-2">{title}</h4>
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-4xl font-bold text-white">{price} ₴</span>
        <span className="text-gray-500 line-through text-lg">
          {originalPrice} ₴
        </span>
      </div>
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
            <CheckCircle2 className="w-5 h-5 text-[#a855f7] shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <CheckoutButton
        tier={tier}
        label={`Обрати ${title}`}
        isPopular={isPopular}
      />
    </motion.div>
  );
}
