import Link from 'next/link';
import { User as UserIcon, Users, BookOpen, Award } from 'lucide-react';
import { useT } from '@/lib/translations';
import ChallengeCard from '../trackers/ChallengeCard';
import type { SocialTab, UserProfileData } from './types';
import css from './UserProfile.module.css';

interface FollowersListProps {
  activeTab: SocialTab;
  followers: UserProfileData[];
  following: UserProfileData[];
  userBooks: any[];
  trackers: any[];
  trackerItems: any[];
  isSelf: boolean;
  onTabChange: (tab: SocialTab) => void;
}

export default function FollowersList({
  activeTab,
  followers,
  following,
  userBooks,
  trackers,
  trackerItems,
  isSelf,
  onTabChange,
}: FollowersListProps) {
  const t = useT();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'followers':
      case 'following': {
        const users = activeTab === 'followers' ? followers : following;
        const emptyText = activeTab === 'followers' ? t('users.noFollowers') : t('users.noFollowing');

        if (users.length === 0) {
          return <p className={css.emptyText}>{emptyText}</p>;
        }

        return (
          <div className={css.socialList}>
            {users.map((user) => (
              <Link href={`/users/${user.id}`} key={user.id} className={`glass-panel ${css.socialUserRow}`}>
                <div className={css.smallAvatar}>
                  <UserIcon size={16} color="#9333ea" />
                </div>
                <span className={css.socialUserName}>
                  {user.name} {user.surname}
                </span>
                <span className={css.viewProfileBtn}>{t('users.viewProfile')} →</span>
              </Link>
            ))}
          </div>
        );
      }

      case 'books': {
        if (userBooks.length === 0) {
          return <p className={css.emptyText}>{t('users.noBooks')}</p>;
        }

        return (
          <div className={css.booksGrid}>
            {userBooks.map((ub) => {
              const book = ub.book;
              if (!book) return null;

              const total = book.totalPages || null;
              const percent = total ? Math.min(100, Math.round((ub.readPages / total) * 100)) : 0;

              let badgeClass = css.badgeWant;
              let statusText = t('books.wantToRead');

              if (ub.status === 'currentlyReading') {
                badgeClass = css.badgeReading;
                statusText = t('books.currentlyReading');
              } else if (ub.status === 'read') {
                badgeClass = css.badgeRead;
                statusText = t('books.read');
              }

              return (
                <div key={ub.id} className={`glass-panel ${css.profileBookCard}`}>
                  <div className={css.bookCoverBox}>
                    {book.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverImageUrl} alt={book.title} className={css.bookCoverImg} />
                    ) : (
                      <div className={css.bookCoverPlaceholder}>
                        <BookOpen size={24} color="#4b5563" />
                      </div>
                    )}
                  </div>

                  <div className={css.bookInfoBox}>
                    <div className={css.bookTitleRow}>
                      <Link href={`/books/${book.id}`} className={css.profileBookTitle}>
                        {book.title}
                      </Link>
                      <span className={`${css.statusBadge} ${badgeClass}`}>{statusText}</span>
                    </div>
                    <p className={css.profileBookAuthor}>{book.authorName}</p>

                    {ub.status === 'currentlyReading' && (
                      <div className={css.bookProgressSection}>
                        <div className={css.progressLabelRow}>
                          <span>
                            {ub.readPages} / {total === null ? '?' : total} {t('books.pages')}
                          </span>
                          <span className={css.progressPercentText}>{percent}%</span>
                        </div>
                        <div className={css.progressBarBackground}>
                          <div className={css.progressBarFill} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      case 'trackers': {
        if (trackers.length === 0) {
          return <p className={css.emptyText}>{t('users.noTrackers')}</p>;
        }

        return (
          <div className={css.challengesTabList}>
            {trackers.map((tracker) => {
              const linkedItems = trackerItems.filter((item) => item.trackerId === tracker.id);
              return (
                <ChallengeCard
                  key={tracker.id}
                  tracker={tracker}
                  linkedItems={linkedItems}
                  linkableBooks={[]}
                />
              );
            })}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`glass-panel ${css.socialCard}`}>
      <div className={css.tabHeader}>
        <button
          className={`${css.tabBtn} ${activeTab === 'followers' ? css.tabBtnActive : ''}`}
          onClick={() => onTabChange('followers')}
        >
          <Users size={16} /> {t('users.followers')} ({followers.length})
        </button>
        <button
          className={`${css.tabBtn} ${activeTab === 'following' ? css.tabBtnActive : ''}`}
          onClick={() => onTabChange('following')}
        >
          <Users size={16} /> {t('users.following')} ({following.length})
        </button>
        <button
          className={`${css.tabBtn} ${activeTab === 'books' ? css.tabBtnActive : ''}`}
          onClick={() => onTabChange('books')}
        >
          <BookOpen size={16} /> {t('users.books')} ({userBooks.length})
        </button>
        <button
          className={`${css.tabBtn} ${activeTab === 'trackers' ? css.tabBtnActive : ''}`}
          onClick={() => onTabChange('trackers')}
        >
          <Award size={16} /> {t('users.trackers')} ({trackers.length})
        </button>
      </div>

      <div className={css.tabContent}>{renderTabContent()}</div>
    </div>
  );
}
