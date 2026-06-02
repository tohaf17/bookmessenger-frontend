import { BookOpen, Calendar } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { Book } from './types';
import css from './BookDetails.module.css';

interface BookInfoProps {
  book: Book;
}

export default function BookInfo({ book }: BookInfoProps) {
  const t = useT();

  return (
    <div className={`glass-panel ${css.descPanel}`}>
      <span className={css.genreTag}>{book.genre}</span>
      <h1 className={css.bookTitle}>{book.title}</h1>
      <p className={css.bookAuthor}>Автор: {book.authorName}</p>

      <div className={css.metaRow}>
        {book.totalPages && (
          <span className={css.metaItem}>
            <BookOpen size={16} />
            {book.totalPages} {t('books.pages')}
          </span>
        )}
        <span className={css.metaItem}>
          <Calendar size={16} />
          BookMessenger Spotlight
        </span>
      </div>

      <div className={css.divider} />
      <h3 className={css.descTitle}>{t('books.description')}</h3>
      <p className={css.descText}>{book.description}</p>
    </div>
  );
}
