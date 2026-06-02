'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle2, Loader2, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import type { GoogleBookResult } from './types';
import css from './GoogleBookSearch.module.css';

interface GoogleBookSearchProps {
  onBookAdded: () => void;
}

export default function GoogleBookSearch({ onBookAdded }: GoogleBookSearchProps) {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [pagesCounts, setPagesCounts] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchBooks = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/books/search/google', {
        params: { q: searchQuery.trim() },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setResults(data);
      setShowDropdown(true);
    } catch (err) {
      console.error('Google Books search failed', err);
      setResults([]);
      setShowDropdown(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchBooks(query);
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchBooks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddBook = async (book: GoogleBookResult) => {
    setAddingId(book.googleBooksId);
    try {
      const res = await api.post('/books', {
        title: book.title,
        authorName: book.authorName,
        genre: book.genre || 'Інше',
        description: book.description || `${book.title} by ${book.authorName}`,
        coverImageUrl: book.coverImageUrl,
        totalPages: book.totalPages || pagesCounts[book.googleBooksId] || undefined,
      });
      setSuccessId(book.googleBooksId);
      setTimeout(() => {
        setSuccessId(null);
        setShowDropdown(false);
        setQuery('');
        setResults([]);
        setPagesCounts({});
        onBookAdded();
        if (res.data?.id) {
          router.push(`/books/${res.data.id}`);
        }
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add book');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className={css.searchSection}>
      <h3 className={css.sectionTitle}>
        <Search size={18} />
        {t('books.searchSection')}
      </h3>
      <div className={css.searchContainer} ref={containerRef}>
        <div className={css.searchInputWrapper}>
          <Search size={18} className={css.searchIcon} />
          <input
            type="text"
            placeholder={t('books.searchGooglePlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            className={css.searchInput}
          />
          {loading && <Loader2 size={18} className={css.loadingIndicator} />}
        </div>

        {showDropdown && (
          <div className={css.dropdown}>
            {results.length === 0 && !loading ? (
              <div className={css.noResults}>{t('books.searchNoResults')}</div>
            ) : (
              results.map((book) => (
                <div key={book.googleBooksId} className={css.resultItem}>
                  <div className={css.resultCover}>
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className={css.resultCoverImg}
                      />
                    ) : (
                      <div className={css.resultCoverPlaceholder}>
                        <BookOpen size={24} />
                      </div>
                    )}
                  </div>
                  <div className={css.resultInfo}>
                    <span className={css.resultTitle}>{book.title}</span>
                    <span className={css.resultAuthor}>{book.authorName}</span>
                    <div className={css.resultMeta}>
                      {book.totalPages ? (
                        <span className={css.resultMetaItem}>📄 {book.totalPages} сторінок</span>
                      ) : (
                        <input
                          type="number"
                          placeholder="Сторінок?"
                          min={1}
                          value={pagesCounts[book.googleBooksId] || ''}
                          onChange={(e) => setPagesCounts({ ...pagesCounts, [book.googleBooksId]: Number(e.target.value) })}
                          style={{ width: '120px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #9333ea', background: '#1a1a2e', color: '#fff' }}
                          disabled={addingId === book.googleBooksId}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      {book.genre && (
                        <span className={css.resultMetaItem}>📚 {book.genre}</span>
                      )}
                    </div>
                    {book.description && (
                      <p className={css.resultDesc}>{book.description}</p>
                    )}
                  </div>
                  {successId === book.googleBooksId ? (
                    <div className={css.successOverlay}>
                      <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    <button
                      className={css.addButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddBook(book);
                      }}
                      disabled={addingId === book.googleBooksId}
                    >
                      {addingId === book.googleBooksId ? (
                        <Loader2 size={16} className={css.addingSpinner} />
                      ) : (
                        <><Plus size={14} /> {t('books.addFromGoogle')}</>
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
