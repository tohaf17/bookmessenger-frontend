import Link from 'next/link';
import { BookMarked, Bookmark, CheckCircle2, TrendingUp } from 'lucide-react';
import { useT } from '@/lib/translations';
import ShelfBookCard from './ShelfBookCard';
import type { ShelfTab, UserBook } from './types';
import css from './DashboardView.module.css';

interface ShelfTabsProps {
  activeTab: ShelfTab;
  currentlyReading: UserBook[];
  wantToRead: UserBook[];
  completed: UserBook[];
  updatingId: number | null;
  onTabChange: (tab: ShelfTab) => void;
  onProgressUpdate: (ubId: number, currentRead: number, total: number, newPages: number) => void;
  onRemove: (ubId: number) => void;
}

export default function ShelfTabs({
  activeTab,
  currentlyReading,
  wantToRead,
  completed,
  updatingId,
  onTabChange,
  onProgressUpdate,
  onRemove,
}: ShelfTabsProps) {
  const t = useT();
  const currentTabBooks = activeTab === 'reading' ? currentlyReading : activeTab === 'want' ? wantToRead : completed;

  return (
    <>
      <div className={css.tabHeader}>
        <button className={`${css.tabBtn} ${activeTab === 'reading' ? css.tabBtnActive : ''}`} onClick={() => onTabChange('reading')}>
          <TrendingUp size={16} /> {t('books.currentlyReading')} ({currentlyReading.length})
        </button>
        <button className={`${css.tabBtn} ${activeTab === 'want' ? css.tabBtnActive : ''}`} onClick={() => onTabChange('want')}>
          <Bookmark size={16} /> {t('books.wantToRead')} ({wantToRead.length})
        </button>
        <button className={`${css.tabBtn} ${activeTab === 'completed' ? css.tabBtnActive : ''}`} onClick={() => onTabChange('completed')}>
          <CheckCircle2 size={16} /> {t('books.read')} ({completed.length})
        </button>
      </div>

      <div className={css.tabContent}>
        {currentTabBooks.length === 0 ? (
          <div className={`glass-panel ${css.emptyShelfCard}`}>
            <BookMarked size={48} color="#4b5563" />
            <h3>{t('dashboard.emptyShelf')}</h3>
            <p>{t('dashboard.emptyShelfHint')}</p>
            <Link href="/books" className={`btn-primary ${css.browseBtn}`}>{t('dashboard.browseBooks')}</Link>
          </div>
        ) : (
          <div className={css.shelfGrid}>
            {currentTabBooks.map((book) => (
              <ShelfBookCard key={book.id} userBook={book} updatingId={updatingId} onProgressUpdate={onProgressUpdate} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
