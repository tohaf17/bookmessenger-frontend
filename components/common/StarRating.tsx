'use client';

import { Star } from 'lucide-react';
import styles from './StarRating.module.css';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({ value, onChange, readonly = false, size = 18 }: StarRatingProps) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={styles.starButton}
          disabled={readonly}
          onClick={() => onChange?.(star)}
          aria-label={`${star} stars`}
        >
          <Star size={size} fill={star <= value ? '#eab308' : 'none'} color={star <= value ? '#eab308' : '#4b5563'} />
        </button>
      ))}
    </div>
  );
}
