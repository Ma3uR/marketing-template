'use client';

import { useState } from 'react';
import { Plus, Pencil, Eye, EyeOff, Sparkles, CreditCard } from 'lucide-react';
import type { PricingTier } from '@/types/database';
import GlassCard from '@/components/admin/GlassCard';
import PricingTierEditor from '@/components/admin/PricingTierEditor';

const emptyTier: PricingTier = {
  id: '',
  slug: '',
  title: '',
  price: 0,
  original_price: 0,
  features: [''],
  is_popular: false,
  urgency: null,
  is_active: true,
  sort_order: 0,
  created_at: '',
  updated_at: '',
};

interface PricingTiersListProps {
  tiers: PricingTier[];
}

export default function PricingTiersList({ tiers }: PricingTiersListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleClose = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {isAdding ? (
        <PricingTierEditor tier={emptyTier} isNew onClose={handleClose} />
      ) : (
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Додати тариф
        </button>
      )}

      {tiers.length === 0 && !isAdding && (
        <GlassCard>
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Тарифів поки немає</h3>
            <p className="text-gray-500">
              Додайте перший тариф, щоб він з&apos;явився на лендінгу
            </p>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) =>
          editingId === tier.id ? (
            <div key={tier.id} className="md:col-span-2 lg:col-span-3">
              <PricingTierEditor tier={tier} onClose={handleClose} />
            </div>
          ) : (
            <GlassCard key={tier.id} hover className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white text-lg">{tier.title}</h4>
                  <span className="text-xs text-gray-600 font-mono">{tier.slug}</span>
                </div>
                <div className="flex items-center gap-2">
                  {tier.is_popular && (
                    <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                      <Sparkles className="w-3 h-3" />
                      ПОПУЛЯРНИЙ
                    </div>
                  )}
                  <div
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${
                      tier.is_active
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                    }`}
                  >
                    {tier.is_active ? (
                      <><Eye className="w-3 h-3" /> АКТИВНИЙ</>
                    ) : (
                      <><EyeOff className="w-3 h-3" /> ПРИХОВАНИЙ</>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-white">{tier.price} ₴</span>
                <span className="text-gray-500 line-through text-sm">
                  {tier.original_price} ₴
                </span>
              </div>

              <div className="text-sm text-gray-400 mb-2">
                {tier.features.length} {tier.features.length === 1 ? 'функція' : 'функцій'}
              </div>

              {tier.urgency && (
                <div className="text-red-400 text-xs font-bold uppercase mb-4">
                  {tier.urgency}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-600">
                  #{tier.sort_order}
                </span>
                <button
                  onClick={() => { setEditingId(tier.id); setIsAdding(false); }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          )
        )}
      </div>
    </div>
  );
}
