import { Filter, Search } from 'lucide-react';
import { useT } from '@/lib/translations';
import css from './BookCatalog.module.css';

interface BookSearchBarProps {
  search: string;
  genre: string;
  author: string;
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
}

export default function BookSearchBar({ search, genre, author, onSearchChange, onGenreChange, onAuthorChange }: BookSearchBarProps) {
  const t = useT();

  return (
    <div className={`glass-panel ${css.filterPanel}`}>
      <div className={css.searchWrapper}>
        <Search size={18} className={css.searchIcon} />
        <input
          type="text"
          placeholder={t('books.searchPlaceholder')}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className={`glass-input ${css.searchInput}`}
        />
      </div>

      <div className={css.selectsWrapper}>
        <div className={css.selectContainer}>
          <Filter size={16} className={css.filterIcon} />
          <select value={genre} onChange={(event) => onGenreChange(event.target.value)} className={`glass-input ${css.selectInput}`}>
            <option value="">{t('books.allGenres')}</option>
            <option value="Художня література">Художня література</option>
            <option value="Наукова фантастика">Наукова фантастика</option>
            <option value="Фентезі">Фентезі</option>
            <option value="Детектив">Детектив</option>
            <option value="Психологія">Психологія</option>
            <option value="Історія">Історія</option>
          </select>
        </div>

        <input
          type="text"
          placeholder={t('books.authorPlaceholder')}
          value={author}
          onChange={(event) => onAuthorChange(event.target.value)}
          className={`glass-input ${css.authorInput}`}
        />
      </div>
    </div>
  );
}
