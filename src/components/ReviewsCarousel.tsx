'use client';

import Image from 'next/image';
import type { Review } from '@/types/database';

interface ReviewsCarouselProps {
  reviews: Review[];
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-[340px] flex-shrink-0 bg-[#1a0d2e]/60 border border-white/5 p-8 rounded-3xl flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        {review.author_photo_url &&
        (review.author_photo_url.startsWith('/') ||
          review.author_photo_url.startsWith('http')) ? (
          <div className="w-14 h-14 rounded-full border-2 border-[#a855f7] p-0.5 overflow-hidden relative flex-shrink-0">
            <Image
              src={review.author_photo_url}
              alt={`Фото ${review.author_name}`}
              fill
              sizes="56px"
              className="rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full border-2 border-[#a855f7] bg-gradient-to-br from-[#d946ef] to-[#fb7185] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {review.author_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h4 className="font-bold text-lg">{review.author_name}</h4>
          {review.business && (
            <p className="text-sm text-gray-500">{review.business}</p>
          )}
        </div>
      </div>
      <div className="mb-4 text-gray-300 leading-relaxed italic line-clamp-6 flex-1">
        &ldquo;{review.text}&rdquo;
      </div>
      {review.result && (
        <div className="pt-4 border-t border-white/5">
          <div className="text-[#fb7185] font-bold text-sm uppercase">
            {review.result}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  if (reviews.length === 0) return null;

  const duplicated = [...reviews, ...reviews];

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
      }}
    >
      <div
        className="flex gap-8 hover:[animation-play-state:paused]"
        style={{ animation: 'marquee 40s linear infinite' }}
      >
        {duplicated.map((review, i) => (
          <ReviewCard key={`${review.id}-${i}`} review={review} />
        ))}
      </div>
    </div>
  );
}
