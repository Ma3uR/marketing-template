'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import type { Review, ReviewInsert, ReviewUpdate } from '@/types/database';
import GlassCard from './GlassCard';

interface ReviewEditorProps {
  review: Review;
  isNew?: boolean;
  onClose: () => void;
}

export default function ReviewEditor({ review, isNew, onClose }: ReviewEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    author_name: review.author_name,
    author_photo_url: review.author_photo_url || '',
    rating: review.rating,
    text: review.text,
    business: review.business || '',
    result: review.result || '',
    is_visible: review.is_visible,
    sort_order: review.sort_order,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const photoUrl = formData.author_photo_url.trim();
      const isValidPhotoUrl = photoUrl.startsWith('/') || photoUrl.startsWith('http');

      const payload: ReviewInsert = {
        author_name: formData.author_name,
        author_photo_url: isValidPhotoUrl ? photoUrl : null,
        rating: formData.rating,
        text: formData.text,
        business: formData.business || null,
        result: formData.result || null,
        is_visible: formData.is_visible,
        sort_order: formData.sort_order,
      };

      if (isNew) {
        const { error: insertError } = await supabase
          .from('reviews')
          .insert(payload as never);

        if (insertError) throw insertError;
      } else {
        const updatePayload: ReviewUpdate = { ...payload, updated_at: new Date().toISOString() };
        const { error: updateError } = await supabase
          .from('reviews')
          .update(updatePayload as never)
          .eq('id', review.id);

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
    if (!confirm('Ви впевнені, що хочете видалити цей відгук?')) return;

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', review.id);

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
          {isNew ? 'Новий відгук' : 'Редагувати відгук'}
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
            Ім&apos;я автора *
          </label>
          <input
            type="text"
            value={formData.author_name}
            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
            placeholder="Олена"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Бізнес
          </label>
          <input
            type="text"
            value={formData.business}
            onChange={(e) => setFormData({ ...formData, business: e.target.value })}
            placeholder="Магазин декору"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Рейтинг
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= formData.rating
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Текст відгуку *
        </label>
        <textarea
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Текст відгуку клієнта..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Результат
          </label>
          <input
            type="text"
            value={formData.result}
            onChange={(e) => setFormData({ ...formData, result: e.target.value })}
            placeholder="Зекономила 5000 грн"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            URL фото автора
          </label>
          <input
            type="text"
            value={formData.author_photo_url}
            onChange={(e) => setFormData({ ...formData, author_photo_url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Видимість
          </label>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_visible: !formData.is_visible })}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
              formData.is_visible
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-white/5 border-white/10 text-gray-500'
            }`}
          >
            {formData.is_visible ? (
              <>
                <Eye className="w-4 h-4" /> Видимий на сайті
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" /> Прихований
              </>
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
          disabled={saving || !formData.author_name || !formData.text}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/20 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isNew ? 'Створити' : 'Зберегти'}
        </button>
      </div>
    </GlassCard>
  );
}
