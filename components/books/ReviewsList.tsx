import Link from 'next/link';
import { Loader2, Star } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { Review } from './types';
import css from './BookDetails.module.css';

interface ReviewsListProps {
  reviews: Review[];
  canReview: boolean;
  reviewContent: string;
  reviewRating: number;
  submittingReview: boolean;
  onReviewContentChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onSubmitReview: (event: React.FormEvent) => void;
}

export default function ReviewsList({
  reviews,
  canReview,
  reviewContent,
  reviewRating,
  submittingReview,
  onReviewContentChange,
  onRatingChange,
  onSubmitReview,
}: ReviewsListProps) {
  const t = useT();

  return (
    <div className={css.reviewsPanel}>
      {canReview && (
        <form onSubmit={onSubmitReview} className={`glass-panel ${css.reviewForm}`}>
          <h4 className={css.sectionHeader}>{t('books.writeReview')}</h4>
          <div className={css.reviewRatingSelector}>
            <span className={css.ratingSelectLabel}>{t('books.yourRating')}</span>
            <div className={css.starsWrapper}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => onRatingChange(star)} className={css.starSelectBtn}>
                  <Star size={22} fill={star <= reviewRating ? '#eab308' : 'none'} color={star <= reviewRating ? '#eab308' : '#4b5563'} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder={t('books.reviewPlaceholder')}
            value={reviewContent}
            onChange={(e) => onReviewContentChange(e.target.value)}
            className={`glass-input ${css.reviewTextarea}`}
          />

          <button type="submit" disabled={submittingReview || !reviewContent} className={`btn-primary ${css.reviewSubmitBtn}`}>
            {submittingReview ? <Loader2 size={16} className={css.spinner} /> : t('books.submitReview')}
          </button>
        </form>
      )}

      <div className={css.reviewsList}>
        {reviews.length === 0 ? (
          <p className={css.emptyText}>{t('books.noReviews')}</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={`glass-panel ${css.reviewCard}`}>
              <div className={css.reviewCardHeader}>
                <Link href={`/users/${review.user.id}`} className={css.commentUser}>
                  {review.user.name} {review.user.surname}
                </Link>
                <div className={css.cardStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} fill={star <= review.rating ? '#eab308' : 'none'} color={star <= review.rating ? '#eab308' : '#4b5563'} />
                  ))}
                </div>
                <span className={css.commentDate}>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p className={css.reviewTextContent}>{review.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
