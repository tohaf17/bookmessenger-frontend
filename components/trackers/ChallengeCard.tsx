import { BookOpen, Calendar, Trash2 } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { Tracker, TrackerItem, UserBook } from './types';
import css from './TrackersView.module.css';

interface ChallengeCardProps {
  tracker: Tracker;
  linkedItems: TrackerItem[];
  linkableBooks: UserBook[];
  onLinkBook?: (trackerId: number, userBookId: number) => void;
  onRemoveTracker?: (id: number) => void;
  onRemoveLinkedBook?: (itemId: number) => void;
}

export default function ChallengeCard({ tracker, linkedItems, linkableBooks, onLinkBook, onRemoveTracker, onRemoveLinkedBook }: ChallengeCardProps) {
  const t = useT();
  const loggedCount = linkedItems.length;
  const percent = Math.min(100, Math.round((loggedCount / tracker.targetBooksCount) * 100));

  return (
    <div className={`glass-panel ${css.challengeCard}`}>
      <div className={css.cardHeader}>
        <div className={css.cardInfo}>
          <h4 className={css.challengeTitle}>{t('trackers.challenge')}</h4>
          <span className={css.challengeDates}>
            <Calendar size={12} />
            {new Date(tracker.startDate).toLocaleDateString()} - {new Date(tracker.endDate).toLocaleDateString()}
          </span>
        </div>
        {onRemoveTracker && (
          <button onClick={() => onRemoveTracker(tracker.id)} className={css.removeTrackerBtn}>
            <Trash2 size={16} color="#ef4444" />
          </button>
        )}
      </div>

      <div className={css.progressBox}>
        <div className={css.progressHeader}>
          <span className={css.percentText}>{t('trackers.completedPercent', { percent })}</span>
          <span className={css.countText}>{t('trackers.countBooks', { count: loggedCount, total: tracker.targetBooksCount })}</span>
        </div>
        <div className={css.progressBarBg}>
          <div className={css.progressBarFill} style={{ width: `${percent}%` }} />
        </div>
      </div>

      {onLinkBook && linkableBooks.length > 0 && (
        <div className={css.linkMenuWrapper}>
          <label className={css.linkSelectLabel}>{t('trackers.logBook')}</label>
          <select
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              onLinkBook(tracker.id, Number(e.target.value));
              e.target.value = '';
            }}
            className={`glass-input ${css.linkSelect}`}
          >
            <option value="" disabled>{t('trackers.selectBook')}</option>
            {linkableBooks.map((book) => (
              <option key={book.id} value={book.id}>{book.book?.title} ({book.book?.authorName})</option>
            ))}
          </select>
        </div>
      )}

      <div className={css.linkedBooksSection}>
        <h5 className={css.linkedTitle}>
          <BookOpen size={14} />
          {t('trackers.loggedBooks')} ({loggedCount})
        </h5>
        {linkedItems.length === 0 ? (
          <p className={css.noLinkedBooks}>{t('trackers.noLinkedBooks')}</p>
        ) : (
          <div className={css.linkedList}>
            {linkedItems.map((item) => (
              <div key={item.id} className={`glass-panel ${css.linkedBookItem}`}>
                <span className={css.linkedBookName}>
                  {item.userBook?.book?.title}
                  <span className={css.linkedAuthor}> ({item.userBook?.book?.authorName})</span>
                </span>
                {onRemoveLinkedBook && (
                  <button onClick={() => onRemoveLinkedBook(item.id)} className={css.unlinkBtn}>
                    <Trash2 size={12} color="#ef4444" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
