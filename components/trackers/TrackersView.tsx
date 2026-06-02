'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Award, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AdminRedirect from '@/components/common/AdminRedirect';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import { useAuthStore } from '@/store/authStore';
import ChallengeCard from './ChallengeCard';
import ChallengeForm from './ChallengeForm';
import type { Tracker, TrackerItem, UserBook } from './types';
import css from './TrackersView.module.css';

export default function TrackersView() {
  const router = useRouter();
  const t = useT();
  const { token } = useAuthStore();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [trackerItems, setTrackerItems] = useState<TrackerItem[]>([]);
  const [completedBooks, setCompletedBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetCount, setTargetCount] = useState(5);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) router.push('/auth/login');
  }, [token, router]);

  const loadTrackerData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const trackersRes = await api.get('/trackers', { params: { page: 1, quantity: 50 } });
      setTrackers(trackersRes.data?.data || trackersRes.data || []);

      const itemsRes = await api.get('/tracker-items', { params: { page: 1, quantity: 100 } });
      setTrackerItems(await resolveTrackerItems(itemsRes.data?.data || itemsRes.data || []));

      const userBooksRes = await api.get('/me/books', { params: { page: 1, quantity: 100 } });
      const readShelf = (userBooksRes.data?.data || userBooksRes.data || []).filter((book: any) => book.status === 'read');
      setCompletedBooks(await resolveCompletedBooks(readShelf));
    } catch (err) {
      console.error('Failed to load trackers data', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTrackerData();
  }, [loadTrackerData]);

  const handleStartChallenge = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!startDate || !endDate || targetCount <= 0) return;
    setSubmitting(true);
    try {
      await api.post('/trackers', {
        targetBooksCount: Number(targetCount),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setStartDate('');
      setEndDate('');
      setTargetCount(5);
      await loadTrackerData();
    } catch (err: any) {
      alert(err.response?.data?.message || t('trackers.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkBook = async (trackerId: number, userBookId: number) => {
    try {
      await api.post('/tracker-items', { trackerId, userBookId });
      await loadTrackerData();
    } catch (err: any) {
      alert(err.response?.data?.message || t('trackers.alreadyLinked'));
    }
  };

  const handleRemoveTracker = async (id: number) => {
    if (!confirm(t('trackers.deleteConfirm'))) return;
    await api.delete(`/trackers/${id}`);
    await loadTrackerData();
  };

  const handleRemoveLinkedBook = async (itemId: number) => {
    if (!confirm(t('trackers.removeBookConfirm'))) return;
    await api.delete(`/tracker-items/${itemId}`);
    await loadTrackerData();
  };

  if (loading) {
    return (
      <div className={css.appContainer}>
        <Navbar />
        <div className={css.loaderContainer}>
          <Loader2 size={48} className={css.spinner} />
          <p>{t('common.loadingChallenges')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={css.appContainer}>
      <AdminRedirect />
      <Navbar />
      <main className={css.main}>
        <div className={css.header}>
          <h1 className={`glow-text ${css.title}`}>{t('trackers.title')}</h1>
          <p className={css.subtitle}>{t('trackers.subtitle')}</p>
        </div>

        <div className={css.columns}>
          <div className={css.leftCol}>
            <ChallengeForm
              targetCount={targetCount}
              startDate={startDate}
              endDate={endDate}
              submitting={submitting}
              onTargetCountChange={setTargetCount}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onSubmit={handleStartChallenge}
            />
          </div>

          <div className={css.rightCol}>
            {trackers.length === 0 ? (
              <div className={`glass-panel ${css.emptyContainer}`}>
                <Award size={48} color="#4b5563" />
                <h3>{t('trackers.noActive')}</h3>
                <p>{t('trackers.noActiveHint')}</p>
              </div>
            ) : (
              <div className={css.challengesList}>
                {trackers.map((tracker) => {
                  const linkedItems = trackerItems.filter((item) => item.trackerId === tracker.id);
                  const linkableBooks = completedBooks.filter((book) => !linkedItems.some((item) => item.userBookId === book.id));
                  return (
                    <ChallengeCard
                      key={tracker.id}
                      tracker={tracker}
                      linkedItems={linkedItems}
                      linkableBooks={linkableBooks}
                      onLinkBook={handleLinkBook}
                      onRemoveTracker={handleRemoveTracker}
                      onRemoveLinkedBook={handleRemoveLinkedBook}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

async function resolveTrackerItems(items: any[]) {
  return Promise.all(items.map(async (item) => {
    try {
      const ubRes = await api.get(`/user-books/${item.userBookId}`);
      const bookRes = await api.get(`/books/${ubRes.data.bookId}`);
      return { ...item, userBook: { ...ubRes.data, book: bookRes.data } };
    } catch {
      return item;
    }
  }));
}

async function resolveCompletedBooks(books: any[]) {
  return Promise.all(books.map(async (book) => {
    try {
      const bookRes = await api.get(`/books/${book.bookId}`);
      return { ...book, book: bookRes.data };
    } catch {
      return book;
    }
  }));
}
