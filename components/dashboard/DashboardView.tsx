'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, CheckCircle2, Loader2, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import { useAuthStore } from '@/store/authStore';
import ShelfTabs from './ShelfTabs';
import StatCard from './StatCard';
import type { ShelfTab, UserBook } from './types';
import css from './DashboardView.module.css';

export default function DashboardView() {
  const router = useRouter();
  const t = useT();
  const { user, token } = useAuthStore();
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ShelfTab>('reading');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) router.push('/auth/login');
  }, [token, router]);

  const loadShelf = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get('/me/books', { params: { page: 1, quantity: 100 } });
      const booksList = res.data?.data || res.data || [];
      const resolvedBooks = await Promise.all(
        booksList.map(async (userBook: any) => {
          if (userBook.book) return userBook;
          try {
            const bookRes = await api.get(`/books/${userBook.bookId}`);
            return { ...userBook, book: bookRes.data };
          } catch {
            return userBook;
          }
        }),
      );
      setUserBooks(resolvedBooks);
    } catch (err) {
      console.error('Failed to load user shelf', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadShelf();
  }, [loadShelf]);

  const handleProgressUpdate = async (ubId: number, currentRead: number, total: number, newPages: number) => {
    if (newPages < 0 || newPages > total) return;
    setUpdatingId(ubId);
    try {
      const res = await api.patch(`/user-books/${ubId}`, { readPages: newPages, ...(newPages === total ? { status: 'read' } : {}) });
      // Update local state instead of reloading all books
      setUserBooks((prevBooks) =>
        prevBooks.map((book) => (book.id === ubId ? res.data : book))
      );
    } catch {
      alert(t('dashboard.progressFailed'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (ubId: number) => {
    if (!confirm(t('books.removeConfirm'))) return;
    setUpdatingId(ubId);
    try {
      await api.delete(`/user-books/${ubId}`);
      await loadShelf();
    } catch {
      alert(t('dashboard.removeFailed'));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className={css.appContainer}>
        <Navbar />
        <div className={css.loaderContainer}>
          <Loader2 size={48} className={css.spinner} />
          <p>{t('common.loadingShelf')}</p>
        </div>
      </div>
    );
  }

  const currentlyReading = userBooks.filter((book) => book.status === 'currentlyReading');
  const wantToRead = userBooks.filter((book) => book.status === 'wantToRead');
  const completed = userBooks.filter((book) => book.status === 'read');

  return (
    <div className={css.appContainer}>
      <Navbar />
      <main className={css.main}>
        <div className={css.header}>
          <h1 className={`glow-text ${css.title}`}>{t('dashboard.title')}</h1>
          <p className={css.subtitle}>{t('dashboard.subtitle', { name: user?.name || '' })}</p>
        </div>

        <div className={css.statsGrid}>
          <StatCard icon={<TrendingUp size={20} color="#9333ea" />} tone="purple" value={currentlyReading.length} label={t('dashboard.active')} />
          <StatCard icon={<CheckCircle2 size={20} color="#10b981" />} tone="green" value={completed.length} label={t('dashboard.completed')} />
          <StatCard icon={<Bookmark size={20} color="#3b82f6" />} tone="blue" value={wantToRead.length} label={t('dashboard.wishlist')} />
        </div>

        <ShelfTabs
          activeTab={activeTab}
          currentlyReading={currentlyReading}
          wantToRead={wantToRead}
          completed={completed}
          updatingId={updatingId}
          onTabChange={setActiveTab}
          onProgressUpdate={handleProgressUpdate}
          onRemove={handleRemove}
        />
      </main>
    </div>
  );
}
