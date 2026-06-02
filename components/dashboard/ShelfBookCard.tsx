import Link from 'next/link';
import { BookOpen, Eye, Trash2 } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { UserBook } from './types';
import css from './DashboardView.module.css';

interface ShelfBookCardProps {
  userBook: UserBook;
  updatingId: number | null;
  onProgressUpdate: (ubId: number, currentRead: number, total: number, newPages: number) => void;
  onRemove: (ubId: number) => void;
}

export default function ShelfBookCard({ userBook, updatingId, onProgressUpdate, onRemove }: ShelfBookCardProps) {
  const t = useT();
  const book = userBook.book;
  if (!book) return null;

  const total = book.totalPages || null;
  const percent = total ? Math.min(100, Math.round((userBook.readPages / total) * 100)) : 0;

  return (
    <div className={`glass-panel ${css.bookCard}`}>
      <div className={css.coverBox}>
        {book.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverImageUrl} alt={book.title} className={css.coverImage} />
        ) : (
          <div className={css.coverPlaceholder}>
            <BookOpen size={36} color="#4b5563" />
          </div>
        )}
      </div>

      <div className={css.bookDetails}>
        <span className={css.genreTag}>{book.genre}</span>
        <h4 className={css.bookTitle}>{book.title}</h4>
        <p className={css.bookAuthor}>{book.authorName}</p>

        {userBook.status === 'currentlyReading' && (
          <div className={css.progressSection}>
            <div className={css.progressHeader}>
              <span className={css.progressPercent}>{t('dashboard.percentRead', { percent })}</span>
              <span className={css.progressPages}>{userBook.readPages} / {total ?? '?'} {t('books.pages')}</span>
            </div>
            <div className={css.progressBarBg}>
              <div className={css.progressBarFill} style={{ width: `${percent}%` }} />
            </div>
            <div className={css.quickUpdateGroup}>
              <button disabled={updatingId === userBook.id || userBook.readPages <= 0} onClick={() => onProgressUpdate(userBook.id, userBook.readPages, total || userBook.readPages, userBook.readPages - 5)} className={css.stepBtn}>-5</button>
              <button disabled={updatingId === userBook.id || (total !== null && userBook.readPages >= total)} onClick={() => onProgressUpdate(userBook.id, userBook.readPages, total || userBook.readPages + 5, userBook.readPages + 5)} className={css.stepBtn}>+5</button>
              <input
                type="number"
                min={0}
                max={total || undefined}
                defaultValue={userBook.readPages}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (value !== userBook.readPages) onProgressUpdate(userBook.id, userBook.readPages, total || value, value);
                }}
                disabled={updatingId === userBook.id}
                className={`glass-input ${css.inlinePageInput}`}
              />
            </div>
          </div>
        )}

        <div className={css.actionsRow}>
          <Link href={`/books/${book.id}`} className={`btn-secondary ${css.cardBtn}`}>
            <Eye size={14} />
            {t('books.book')}
          </Link>
          <button onClick={() => onRemove(userBook.id)} disabled={updatingId === userBook.id} className={`btn-secondary ${css.removeBtn}`}>
            <Trash2 size={14} color="#ef4444" />
          </button>
        </div>
      </div>
    </div>
  );
}
