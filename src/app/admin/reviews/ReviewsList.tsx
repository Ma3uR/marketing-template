'use client';

import { useState } from 'react';
import { Plus, Star, Pencil, Eye, EyeOff } from 'lucide-react';
import type { Review } from '@/types/database';
import GlassCard from '@/components/admin/GlassCard';
import ReviewEditor from '@/components/admin/ReviewEditor';

const emptyReview: Review = {
  id: '',
  author_name: '',
  author_photo_url: null,
  rating: 5,
  text: '',
  business: null,
  result: null,
  is_visible: true,
  sort_order: 0,
  created_at: '',
  updated_at: '',
};

interface ReviewsListProps {
  reviews: Review[];
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleClose = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {isAdding ? (
        <ReviewEditor review={emptyReview} isNew onClose={handleClose} />
      ) : (
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Додати відгук
        </button>
      )}

      {reviews.length === 0 && !isAdding && (
        <GlassCard>
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Відгуків поки немає</h3>
            <p className="text-gray-500">
              Додайте перший відгук, щоб він з&apos;явився на лендінгу
            </p>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) =>
          editingId === review.id ? (
            <div key={review.id} className="md:col-span-2 lg:col-span-3">
              <ReviewEditor review={review} onClose={handleClose} />
            </div>
          ) : (
            <GlassCard key={review.id} hover className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                    {review.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{review.author_name}</h4>
                    {review.business && (
                      <p className="text-xs text-gray-500">{review.business}</p>
                    )}
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${
                    review.is_visible
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                  }`}
                >
                  {review.is_visible ? (
                    <><Eye className="w-3 h-3" /> ВИДИМИЙ</>
                  ) : (
                    <><EyeOff className="w-3 h-3" /> ПРИХОВАНИЙ</>
                  )}
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-700'
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-gray-300 mb-4 line-clamp-3 flex-1">
                &ldquo;{review.text}&rdquo;
              </p>

              {review.result && (
                <div className="text-[#fb7185] text-xs font-bold uppercase mb-4">
                  {review.result}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-600">
                  #{review.sort_order}
                </span>
                <button
                  onClick={() => { setEditingId(review.id); setIsAdding(false); }}
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
