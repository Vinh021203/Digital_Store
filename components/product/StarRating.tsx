'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number | null;
  reviewCount?: number | null;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  reviewCount,
  size = 12,
  showValue = true,
  className = '',
}: StarRatingProps) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const filledStars = Math.round(value);

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`${value.toFixed(1)} trên 5 sao`}>
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            strokeWidth={1.8}
            fill={star <= filledStars ? 'currentColor' : 'none'}
            className={`h-[9px] w-[9px] sm:h-[11px] sm:w-[11px] ${star <= filledStars ? 'text-amber-400' : 'text-slate-200'}`}
          />
        ))}
      </div>
      {showValue && <span className="text-[10px] font-bold text-slate-600 sm:text-xs">{value.toFixed(1)}</span>}
      {typeof reviewCount === 'number' && reviewCount > 0 && (
        <span className="text-[9px] text-slate-400 sm:text-[10px]">({reviewCount})</span>
      )}
    </div>
  );
}
