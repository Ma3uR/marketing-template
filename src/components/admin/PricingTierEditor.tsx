'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, Trash2, Eye, EyeOff, Sparkles, Plus, X } from 'lucide-react';
import type { PricingTier, PricingTierInsert, PricingTierUpdate } from '@/types/database';
import GlassCard from './GlassCard';

interface PricingTierEditorProps {
  tier: PricingTier;
  isNew?: boolean;
  onClose: () => void;
}

export default function PricingTierEditor({ tier, isNew, onClose }: PricingTierEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    slug: tier.slug,
    title: tier.title,
    price: tier.price,
    original_price: tier.original_price,
    features: tier.features.length > 0 ? tier.features : [''],
    is_popular: tier.is_popular,
    urgency: tier.urgency || '',
    is_active: tier.is_active,
    sort_order: tier.sort_order,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const slugValid = /^[a-z0-9-]+$/.test(formData.slug);
  const canSave =
    formData.slug &&
    slugValid &&
    formData.title &&
    formData.price > 0 &&
    formData.original_price > 0 &&
    formData.features.filter((f) => f.trim()).length > 0;

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData({ ...formData, features: updated });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    if (formData.features.length <= 1) return;
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const cleanFeatures = formData.features.filter((f) => f.trim());

      const payload: PricingTierInsert = {
        slug: formData.slug,
        title: formData.title,
        price: formData.price,
        original_price: formData.original_price,
        features: cleanFeatures,
        is_popular: formData.is_popular,
        urgency: formData.urgency.trim() || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      };

      // Enforce single popular: if this tier is popular, unset others
      if (formData.is_popular) {
        const popularUpdate: PricingTierUpdate = { is_popular: false, updated_at: new Date().toISOString() };
        const { error: popularError } = await supabase
          .from('pricing_tiers')
          .update(popularUpdate as never)
          .neq('id', tier.id);

        if (popularError) throw popularError;
      }

      if (isNew) {
        const { error: insertError } = await supabase
          .from('pricing_tiers')
          .insert(payload as never);

        if (insertError) throw insertError;
      } else {
        const updatePayload: PricingTierUpdate = { ...payload, updated_at: new Date().toISOString() };
        const { error: updateError } = await supabase
          .from('pricing_tiers')
          .update(updatePayload as never)
          .eq('id', tier.id);

        if (updateError) throw updateError;
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цей тариф?')) return;

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('pricing_tiers')
        .delete()
        .eq('id', tier.id);

      if (deleteError) throw deleteError;
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка видалення');
      setDeleting(false);
    }
  };

  return (
    <GlassCard className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">
          {isNew ? 'Новий тариф' : 'Редагувати тариф'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-sm"
        >
          Скасувати
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Slug (ідентифікатор) *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
            placeholder="basic"
            disabled={!isNew}
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-mono ${
              !isNew ? 'opacity-50 cursor-not-allowed border-white/5' : ''
            } ${
              formData.slug && !slugValid
                ? 'border-red-500/50'
                : 'border-white/10'
            }`}
          />
          {formData.slug && !slugValid && (
            <p className="text-red-400 text-xs">Тільки малі літери, цифри та дефіс</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Назва *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Преміум"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Ціна (₴) *
          </label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
            placeholder="7999"
            min={1}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Стара ціна (₴) *
          </label>
          <input
            type="number"
            value={formData.original_price || ''}
            onChange={(e) => setFormData({ ...formData, original_price: parseInt(e.target.value) || 0 })}
            placeholder="12800"
            min={1}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Переваги *
        </label>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="Опис переваги..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                disabled={formData.features.length <= 1}
                className="p-3 rounded-xl bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            Додати перевагу
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Терміновість (необов&apos;язково)
        </label>
        <input
          type="text"
          value={formData.urgency}
          onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
          placeholder="Залишилось 3 місця"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Порядок сортування
          </label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Популярний
          </label>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_popular: !formData.is_popular })}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
              formData.is_popular
                ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400'
                : 'bg-white/5 border-white/10 text-gray-500'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {formData.is_popular ? 'Популярний' : 'Звичайний'}
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Видимість
          </label>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
              formData.is_active
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-white/5 border-white/10 text-gray-500'
            }`}
          >
            {formData.is_active ? (
              <><Eye className="w-4 h-4" /> Активний</>
            ) : (
              <><EyeOff className="w-4 h-4" /> Прихований</>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-white/5">
        {!isNew && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-3 bg-white/5 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Видалити
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/20 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isNew ? 'Створити' : 'Зберегти'}
        </button>
      </div>
    </GlassCard>
  );
}
