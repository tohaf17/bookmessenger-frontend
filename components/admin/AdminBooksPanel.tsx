'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, PencilLine, Trash2, X } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import styles from './AdminDashboard.module.css';
import type { AdminBook, PaginationMeta } from './types';

const PAGE_SIZE = 8;

type BookDraft = {
  title: string;
  authorName: string;
  genre: string;
  description: string;
  coverImageUrl: string;
  totalPages: string;
};

const emptyDraft: BookDraft = {
  title: '',
  authorName: '',
  genre: '',
  description: '',
  coverImageUrl: '',
  totalPages: '',
};

export default function AdminBooksPanel() {
  const t = useT();
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<BookDraft>(emptyDraft);
  const [page, setPage] = useState(1);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/books', { params: { page, quantity: PAGE_SIZE } });
      setBooks(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? null);
    } catch (error) {
      console.error('Failed to load books', error);
      setBooks([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const startEditing = (book: AdminBook) => {
    setEditingId(book.id);
    setDraft({
      title: book.title,
      authorName: book.authorName,
      genre: book.genre,
      description: book.description,
      coverImageUrl: book.coverImageUrl,
      totalPages: book.totalPages ? String(book.totalPages) : '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const saveBook = async (bookId: number) => {
    setSavingId(bookId);
    try {
      const payload: Record<string, string | number | undefined> = {
        title: draft.title.trim(),
        authorName: draft.authorName.trim(),
        genre: draft.genre.trim(),
        description: draft.description.trim(),
        coverImageUrl: draft.coverImageUrl.trim(),
      };

      if (draft.totalPages.trim()) {
        payload.totalPages = Number(draft.totalPages);
      }

      await api.patch(`/books/${bookId}`, payload);
      cancelEditing();
      await loadBooks();
    } catch (error: any) {
      alert(error.response?.data?.message || t('admin.books.updateFailed'));
    } finally {
      setSavingId(null);
    }
  };

  const removeBook = async (bookId: number) => {
    if (!confirm(t('admin.books.deleteConfirm'))) {
      return;
    }

    setSavingId(bookId);
    try {
      await api.delete(`/books/${bookId}`);
      await loadBooks();
    } catch (error: any) {
      alert(error.response?.data?.message || t('admin.books.deleteFailed'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={styles.listStack}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>{t('admin.books.title')}</div>
          <div className={styles.sectionText}>{t('admin.books.description')}</div>
        </div>
        <div className={styles.sectionStats}>
          {pagination ? `${pagination.totalItems} ${t('admin.books.total')}` : t('admin.books.title')}
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <Loader2 size={20} className={styles.spinner} />
          <span>{t('admin.books.loading')}</span>
        </div>
      ) : books.length === 0 ? (
        <div className={styles.emptyState}>
          <span>{t('admin.books.empty')}</span>
        </div>
      ) : (
        books.map((book) => {
          const isEditing = editingId === book.id;

          return (
            <article key={book.id} className={`glass-panel ${styles.resourceCard}`}>
              <div className={styles.cardHeaderRow}>
                {book.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverImageUrl} alt={book.title} className={styles.thumb} />
                ) : (
                  <div className={styles.thumb} />
                )}

                <div className={styles.cardHeaderCopy}>
                  <div className={styles.resourceTop}>
                    <div>
                      <div className={styles.resourceTitle}>{book.title}</div>
                      <div className={styles.cardDescription}>
                        {book.authorName} · {book.genre} · {book.totalPages ?? t('admin.books.unknownPages')} {t('admin.books.pagesSuffix')}
                      </div>
                    </div>

                    <div className={styles.resourceActions}>
                      {!isEditing ? (
                        <>
                          <button
                            type="button"
                            className={`btn-secondary ${styles.resourceActionBtn} ${styles.primaryBtn}`}
                            onClick={() => startEditing(book)}
                          >
                            <PencilLine size={14} />
                            {t('admin.books.edit')}
                          </button>
                          <button
                            type="button"
                            className={`btn-secondary ${styles.resourceActionBtn} ${styles.dangerBtn}`}
                            onClick={() => removeBook(book.id)}
                            disabled={savingId === book.id}
                          >
                            {savingId === book.id ? <Loader2 size={14} className={styles.spinner} /> : <Trash2 size={14} />}
                            {t('admin.books.delete')}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className={`btn-primary ${styles.resourceActionBtn}`}
                            onClick={() => saveBook(book.id)}
                            disabled={savingId === book.id}
                          >
                            {savingId === book.id ? <Loader2 size={14} className={styles.spinner} /> : <Check size={14} />}
                            {t('common.save')}
                          </button>
                          <button
                            type="button"
                            className={`btn-secondary ${styles.resourceActionBtn}`}
                            onClick={cancelEditing}
                          >
                            <X size={14} />
                            {t('common.cancel')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <p className={styles.cardDescription}>{book.description}</p>
                  ) : (
                    <div className={styles.formGrid}>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>{t('admin.books.titleField')}</span>
                        <input
                          className={styles.fieldInput}
                          value={draft.title}
                          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                        />
                      </label>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>{t('admin.books.authorField')}</span>
                        <input
                          className={styles.fieldInput}
                          value={draft.authorName}
                          onChange={(event) => setDraft((current) => ({ ...current, authorName: event.target.value }))}
                        />
                      </label>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>{t('admin.books.genreField')}</span>
                        <input
                          className={styles.fieldInput}
                          value={draft.genre}
                          onChange={(event) => setDraft((current) => ({ ...current, genre: event.target.value }))}
                        />
                      </label>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>{t('admin.books.pagesField')}</span>
                        <input
                          className={styles.fieldInput}
                          value={draft.totalPages}
                          onChange={(event) => setDraft((current) => ({ ...current, totalPages: event.target.value }))}
                          inputMode="numeric"
                          type="number"
                          min={1}
                        />
                      </label>
                      <label className={`${styles.field} ${styles.fieldWide}`}>
                        <span className={styles.fieldLabel}>{t('admin.books.coverField')}</span>
                        <input
                          className={styles.fieldInput}
                          value={draft.coverImageUrl}
                          onChange={(event) => setDraft((current) => ({ ...current, coverImageUrl: event.target.value }))}
                        />
                      </label>
                      <label className={`${styles.field} ${styles.fieldWide}`}>
                        <span className={styles.fieldLabel}>{t('admin.books.descriptionField')}</span>
                        <textarea
                          className={styles.fieldTextarea}
                          value={draft.description}
                          onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.resourceMeta}>
                <span className={styles.metaPill}>{t('admin.books.bookId')} {book.id}</span>
                <span className={styles.metaPillSoft}>{t('admin.books.created')} {new Date(book.createdAt).toLocaleDateString()}</span>
              </div>
            </article>
          );
        })
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
