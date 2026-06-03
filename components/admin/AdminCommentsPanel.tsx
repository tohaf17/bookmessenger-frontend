'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import styles from './AdminDashboard.module.css';
import type { AdminComment, PaginationMeta } from './types';

const PAGE_SIZE = 10;

interface CommentNodeProps {
  comment: AdminComment;
  deletingId: number | null;
  onDelete: (id: number) => void;
  depth?: number;
}

function CommentNode({ comment, deletingId, onDelete, depth = 0 }: CommentNodeProps) {
  const t = useT();
  const nestedClassName = depth > 0 ? ` ${styles.commentNested}` : '';

  return (
    <div className={`${styles.commentCard}${nestedClassName} glass-panel`}>
      <div className={styles.commentTop}>
        <div>
          <div className={styles.commentUser}>
            {comment.user?.name} {comment.user?.surname}
          </div>
          <div className={styles.commentBook}>
            {t('admin.comments.bookBy', { book: comment.book?.title ?? '', author: comment.book?.authorName ?? '' })}
          </div>
        </div>

        <button
          type="button"
          className={`btn-secondary ${styles.resourceActionBtn} ${styles.dangerBtn}`}
          onClick={() => onDelete(comment.id)}
          disabled={deletingId === comment.id}
        >
          {deletingId === comment.id ? <Loader2 size={14} className={styles.spinner} /> : <Trash2 size={14} />}
          {t('admin.comments.delete')}
        </button>
      </div>

      <div className={styles.cardDescription}>
        {t('admin.comments.created')} {new Date(comment.createdAt).toLocaleDateString()} · {t('admin.comments.commentId')} {comment.id}
      </div>
      <div className={styles.commentText}>{comment.content}</div>

      {comment.replies.length > 0 && (
        <div className={styles.commentTree}>
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              deletingId={deletingId}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCommentsPanel() {
  const t = useT();
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/comments', { params: { page, quantity: PAGE_SIZE } });
      setComments(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? null);
    } catch (error) {
      console.error('Failed to load comments', error);
      setComments([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const deleteComment = async (commentId: number) => {
    if (!confirm(t('admin.comments.deleteConfirm'))) {
      return;
    }

    setDeletingId(commentId);
    try {
      await api.delete(`/comments/${commentId}`);
      await loadComments();
    } catch (error: any) {
      alert(error.response?.data?.message || t('admin.comments.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.listStack}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>{t('admin.comments.title')}</div>
          <div className={styles.sectionText}>{t('admin.comments.description')}</div>
        </div>
        <div className={styles.sectionStats}>
          {pagination ? `${pagination.totalItems} ${t('admin.comments.total')}` : t('admin.comments.title')}
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <Loader2 size={20} className={styles.spinner} />
          <span>{t('admin.comments.loading')}</span>
        </div>
      ) : comments.length === 0 ? (
        <div className={styles.emptyState}>
          <span>{t('admin.comments.empty')}</span>
        </div>
      ) : (
        comments.map((comment) => (
          <CommentNode
            key={comment.id}
            comment={comment}
            deletingId={deletingId}
            onDelete={deleteComment}
          />
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
