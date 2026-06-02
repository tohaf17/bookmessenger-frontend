import Link from 'next/link';
import { BookOpen, Eye } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { Book } from './types';
import css from './BookCatalog.module.css';

interface BookCardProps {
  book: Book;
  canAddToShelf: boolean;
  isAdding: boolean;
  onAddToShelf: (bookId: number, status: string) => void;
}

export default function BookCard({ book, canAddToShelf, isAdding, onAddToShelf }: BookCardProps) {
  const t = useT();

  return (
    <div className={`glass-panel ${css.card}`}>
      <div className={css.coverWrapper}>
        {book.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverImageUrl} alt={book.title} className={css.cover} />
        ) : (
          <div className={css.coverPlaceholder}>
            <BookOpen size={48} color="#4b5563" />
          </div>
        )}
      </div>

      <div className={css.cardContent}>
        <span className={css.genreTag}>{book.genre}</span>
        <h3 className={css.bookTitle}>{book.title}</h3>
        <p className={css.bookAuthor}>{book.authorName}</p>
        <p className={css.bookDesc}>{book.description.length > 120 ? `${book.description.substring(0, 120)}...` : book.description}</p>

        <div className={css.actions}>
          <Link href={`/books/${book.id}`} className={`btn-secondary ${css.detailsBtn}`}>
            <Eye size={16} />
            {t('books.details')}
          </Link>
          {canAddToShelf && (
            <div className={css.shelfSelectWrapper}>
              <select
                defaultValue=""
                onChange={(event) => {
                  if (!event.target.value) return;
                  onAddToShelf(book.id, event.target.value);
                  event.target.value = '';
                }}
                disabled={isAdding}
                className={`glass-input ${css.shelfSelect}`}
              >
                <option value="" disabled>{t('books.addToShelf')}</option>
                <option value="wantToRead">{t('books.wantToRead')}</option>
                <option value="currentlyReading">{t('books.currentlyReading')}</option>
                <option value="read">{t('books.read')}</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
