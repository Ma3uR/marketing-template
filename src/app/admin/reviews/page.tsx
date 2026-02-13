import { createClient } from '@/lib/supabase/server';
import { Star } from 'lucide-react';
import type { Review } from '@/types/database';
import GlassCard from '@/components/admin/GlassCard';
import ReviewsList from './ReviewsList';

async function getReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data as Review[];
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '—';

  const visibleCount = reviews.filter((r) => r.is_visible).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Відгуки</h2>
        <p className="text-gray-500">
          Керуйте відгуками, які відображаються на лендінгу
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="text-sm text-gray-500 mb-1">Всього відгуків</div>
          <div className="text-2xl font-bold text-white">{reviews.length}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-gray-500 mb-1">Видимих на сайті</div>
          <div className="text-2xl font-bold text-emerald-400">{visibleCount}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-gray-500 mb-1">Середній рейтинг</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{avgRating}</span>
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
          </div>
        </GlassCard>
      </div>

      <ReviewsList reviews={reviews} />
    </div>
  );
}
