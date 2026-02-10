'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  User,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import GlassCard from './GlassCard';

const ICON_MAP = {
  ShoppingBag,
  TrendingUp,
  User,
  DollarSign,
  ShoppingCart,
} as const;

type IconName = keyof typeof ICON_MAP;

interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: IconName;
  color: string;
}

export default function KPICard({
  title,
  value,
  trend,
  trendUp = true,
  icon,
  color,
}: KPICardProps) {
  const Icon = ICON_MAP[icon];

  return (
    <GlassCard hover className="flex-1 min-w-[240px]">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} bg-opacity-20`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trendUp ? 'text-green-400' : 'text-rose-400'
            }`}
          >
            {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-gray-400 text-sm font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </GlassCard>
  );
}
