import { BookOpen, Bookmark, Loader2, Star, Trash2 } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { Book, UserBook } from './types';
import css from './BookDetails.module.css';

interface ShelfSelectorProps {
  book: Book;
  averageRating: number;
  reviewsCount: number;
  readRightNowCount: number;
  wantToReadCount: number;
  alreadyReadCount: number;
  currentUserBook: UserBook | null;
  shelfStatus: string;
  readPages: number;
  updatingShelf: boolean;
  onStatusChange: (status: string) => void;
  onReadPagesChange: (pages: number) => void;
  onSave: () => void;
  onRemove: () => void;
  showShelf: boolean;
}

export default function ShelfSelector({
  book,
  averageRating,
  reviewsCount,
  readRightNowCount,
  wantToReadCount,
  alreadyReadCount,
  currentUserBook,
  shelfStatus,
  readPages,
  updatingShelf,
  onStatusChange,
  onReadPagesChange,
  onSave,
  onRemove,
  showShelf,
}: ShelfSelectorProps) {
  const t = useT();
  const progress = book.totalPages ? Math.min(100, (readPages / book.totalPages) * 100) : 0;

  return (
    <>
      <div className={`glass-panel ${css.coverPanel}`}>
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} className={css.coverImage} />
        ) : (
          <div className={css.coverPlaceholder}>
            <BookOpen size={72} color="#4b5563" />
          </div>
        )}
      </div>

      <div className={`glass-panel ${css.ratingOverview}`}>
        <div className={css.ratingValue}>
          <Star size={24} fill="#eab308" color="#eab308" />
          <span className={css.averageRating}>{averageRating ? averageRating.toFixed(1) : '0.0'}</span>
        </div>
        <span className={css.ratingMeta}>{reviewsCount} {t('books.reviews')}</span>
      </div>

      <div className={`glass-panel ${css.shelfStatsPanel}`}>
        <h3 className={css.shelfStatsTitle}>{t('books.shelfStats')}</h3>
        <div className={css.shelfStatsGrid}>
          <div className={css.shelfStatCard}>
            <span className={css.shelfStatValue}>{readRightNowCount}</span>
            <span className={css.shelfStatLabel}>{t('books.currentlyReading')}</span>
          </div>
          <div className={css.shelfStatCard}>
            <span className={css.shelfStatValue}>{wantToReadCount}</span>
            <span className={css.shelfStatLabel}>{t('books.wantToRead')}</span>
          </div>
          <div className={css.shelfStatCard}>
            <span className={css.shelfStatValue}>{alreadyReadCount}</span>
            <span className={css.shelfStatLabel}>{t('books.read')}</span>
          </div>
        </div>
      </div>

      {showShelf && (
        <div className={`glass-panel ${css.shelfPanel}`}>
          <h3 className={css.shelfTitle}>
            <Bookmark size={18} color="#9333ea" />
            {t('books.yourShelf')}
          </h3>

          <div className={css.shelfInputGroup}>
            <label className={css.shelfLabel}>{t('books.status')}</label>
            <select value={shelfStatus} onChange={(e) => onStatusChange(e.target.value)} className={`glass-input ${css.shelfSelect}`}>
              <option value="" disabled>{t('books.chooseStatus')}</option>
              <option value="wantToRead">{t('books.wantToRead')}</option>
              <option value="currentlyReading">{t('books.currentlyReading')}</option>
              <option value="read">{t('books.read')}</option>
            </select>
          </div>

          {shelfStatus === 'currentlyReading' && (
            <div className={css.shelfInputGroup}>
              <label className={css.shelfLabel}>
                {t('books.pagesRead')} 
                {book.totalPages ? ` (${readPages} / ${book.totalPages}) - ${progress.toFixed(0)}%` : ` (${readPages} / ?)`}
              </label>
              <input
                type="number"
                min={0}
                max={book.totalPages || undefined}
                value={readPages}
                onChange={(e) => onReadPagesChange(Math.min(book.totalPages || 9999, Number(e.target.value)))}
                className="glass-input"
              />
              <div className={css.progressBarWrapper}>
                <div className={css.progressBarFill} style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className={css.shelfActions}>
            <button onClick={onSave} disabled={updatingShelf || !shelfStatus} className={`btn-primary ${css.shelfSubmitBtn}`}>
              {updatingShelf ? <Loader2 size={16} className={css.spinner} /> : t('common.save')}
            </button>
            {currentUserBook && (
              <button onClick={onRemove} disabled={updatingShelf} className={`btn-secondary ${css.shelfRemoveBtn}`}>
                <Trash2 size={14} color="#ef4444" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
