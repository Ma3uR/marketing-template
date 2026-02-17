import { createClient } from '@/lib/supabase/server';
import { CreditCard, Eye, DollarSign } from 'lucide-react';
import type { PricingTier } from '@/types/database';
import GlassCard from '@/components/admin/GlassCard';
import PricingTiersList from './PricingTiersList';

async function getPricingTiers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pricing_tiers')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pricing tiers:', error);
    return [];
  }

  return data as PricingTier[];
}

export default async function PricingPage() {
  const tiers = await getPricingTiers();

  const activeCount = tiers.filter((t) => t.is_active).length;
  const activeTiers = tiers.filter((t) => t.is_active);
  const priceRange =
    activeTiers.length > 0
      ? `${Math.min(...activeTiers.map((t) => t.price))} – ${Math.max(...activeTiers.map((t) => t.price))} ₴`
      : '—';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Тарифи</h2>
        <p className="text-gray-500">
          Керуйте тарифними планами, що відображаються на лендінгу
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3 mb-1">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Всього тарифів</span>
          </div>
          <div className="text-2xl font-bold text-white">{tiers.length}</div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3 mb-1">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Активних на сайті</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3 mb-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Діапазон цін</span>
          </div>
          <div className="text-2xl font-bold text-white">{priceRange}</div>
        </GlassCard>
      </div>

      <PricingTiersList tiers={tiers} />
    </div>
  );
}
