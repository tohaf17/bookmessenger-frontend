'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Star, Trash2 } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import styles from './AdminDashboard.module.css';
import type { AdminReview, PaginationMeta } from './types';

const PAGE_SIZE = 10;

export default function AdminReviewsPanel() {
  const t = useT();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews', { params: { page, quantity: PAGE_SIZE } });
      setReviews(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? null);
    } catch (error) {
      console.error('Failed to load reviews', error);
      setReviews([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const deleteReview = async (reviewId: number) => {
    if (!confirm(t('admin.reviews.deleteConfirm'))) {
      return;
    }

    setDeletingId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      await loadReviews();
    } catch (error: any) {
      alert(error.response?.data?.message || t('admin.reviews.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.listStack}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>{t('admin.reviews.title')}</div>
          <div className={styles.sectionText}>{t('admin.reviews.description')}</div>
        </div>
        <div className={styles.sectionStats}>
          {pagination ? `${pagination.totalItems} ${t('admin.reviews.total')}` : t('admin.reviews.title')}
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <Loader2 size={20} className={styles.spinner} />
          <span>{t('admin.reviews.loading')}</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <span>{t('admin.reviews.empty')}</span>
        </div>
      ) : (
        reviews.map((review) => (
          <article key={review.id} className={`glass-panel ${styles.resourceCard}`}>
            <div className={styles.resourceTop}>
              <div>
                <div className={styles.resourceTitle}>
                  {review.user?.name} {review.user?.surname}
                </div>
                <div className={styles.cardDescription}>
                  {t('admin.reviews.bookBy', { book: review.book?.title ?? '', author: review.book?.authorName ?? '' })}
                </div>
              </div>

              <button
                type="button"
                className={`btn-secondary ${styles.resourceActionBtn} ${styles.dangerBtn}`}
                onClick={() => deleteReview(review.id)}
                disabled={deletingId === review.id}
              >
                {deletingId === review.id ? <Loader2 size={14} className={styles.spinner} /> : <Trash2 size={14} />}
                {t('admin.reviews.delete')}
              </button>
            </div>

            <div className={styles.resourceMeta}>
              <span className={styles.metaPill}>
                {t('admin.reviews.rating')}
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    fill={star <= review.rating ? '#f59e0b' : 'none'}
                    color={star <= review.rating ? '#f59e0b' : '#4b5563'}
                  />
                ))}
              </span>
              <span className={styles.metaPillSoft}>{t('admin.reviews.likes')} {review.likesCount || 0}</span>
              <span className={styles.metaPillSoft}>{t('admin.reviews.dislikes')} {review.dislikesCount || 0}</span>
              <span className={styles.metaPillMuted}>{t('admin.reviews.created')} {new Date(review.createdAt).toLocaleDateString()}</span>
            </div>

            <div className={styles.cardDescription}>{review.content}</div>
          </article>
        ))
      )}

      {pagination && (
        <div className={styles.paginationWrap}>
          <Pagination
            page={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
