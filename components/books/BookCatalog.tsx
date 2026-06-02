'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdminRedirect from '@/components/common/AdminRedirect';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import { useAuthStore } from '@/store/authStore';
import BookCard from './BookCard';
import BookSearchBar from './BookSearchBar';
import GoogleBookSearch from './GoogleBookSearch';
import type { Book } from './types';
import css from './BookCatalog.module.css';

export default function BookCatalog() {
  const { user } = useAuthStore();
  const isAdmin = String(user?.role).toLowerCase() === 'admin';
  const t = useT();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [author, setAuthor] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState<string[]>([]);
  const [addingToShelf, setAddingToShelf] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, quantity: 6 };
      if (search) params.search = search;
      if (genre) params.genre = genre;
      if (author) params.author = author;

      const res = await api.get('/books', { params });
      setBooks(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      // refresh genres list so new genres (from newly added books) appear
      fetchGenres();
    } catch (err) {
      console.error('Failed to fetch books', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, genre, author]);

  const fetchGenres = useCallback(async () => {
    try {
      const res = await api.get('/books/genres');
      setGenres(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch genres', err);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, [fetchBooks]);

  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const handleAddToShelf = async (bookId: number, status: string) => {
    if (!user || isAdmin) {
      alert(isAdmin ? 'Адміністратор не використовує полички або трекери' : t('books.addLogin'));
      return;
    }
    setAddingToShelf(bookId);
    try {
      await api.post('/user-books', { bookId, status, readPages: 0 });
      setSuccessMessage(t('books.added'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || t('books.addFailed'));
    } finally {
      setAddingToShelf(null);
    }
  };

  return (
    <div className={css.appContainer}>
      <AdminRedirect />
      <Navbar />
      <main className={css.main}>
        <div className={css.header}>
          <h1 className={`glow-text ${css.title}`}>{t('books.catalogTitle')}</h1>
          <p className={css.subtitle}>{t('books.catalogSubtitle')}</p>
        </div>

        {successMessage && (
          <div className={css.successAlert}>
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        <BookSearchBar
          search={search}
          genre={genre}
          author={author}
          genres={genres}
          onSearchChange={updateFilter(setSearch)}
          onGenreChange={updateFilter(setGenre)}
          onAuthorChange={updateFilter(setAuthor)}
        />

        {user && !isAdmin && (
          <GoogleBookSearch onBookAdded={fetchBooks} />
        )}

        {loading ? (
          <div className={css.loaderContainer}>
            <Loader2 size={40} className={css.spinner} />
            <p>{t('common.loadingBooks')}</p>
          </div>
        ) : books.length === 0 ? (
          <div className={`glass-panel ${css.emptyContainer}`}>
            <BookOpen size={48} color="#6b7280" />
            <h3>{t('books.noBooks')}</h3>
            <p>{t('books.noBooksHint')}</p>
          </div>
        ) : (
          <>
            <div className={css.grid}>
              {books.map((book) => (
                <BookCard key={book.id} book={book} canAddToShelf={Boolean(user)} isAdding={addingToShelf === book.id} onAddToShelf={handleAddToShelf} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className={css.pagination}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className={`btn-secondary ${css.pageBtn}`}>
                  <ChevronLeft size={16} /> {t('common.prev')}
                </button>
                <span className={css.pageIndicator}>{t('books.pageOf', { page, total: totalPages })}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className={`btn-secondary ${css.pageBtn}`}>
                  {t('common.next')} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
