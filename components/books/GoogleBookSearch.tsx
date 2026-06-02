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
  const [page, setPage] = useState(1);
  const quantity = 10;
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [pagesCounts, setPagesCounts] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchBooks = useCallback(async (searchQuery: string, pageNum = 1) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/books/search/google', {
        params: { q: searchQuery.trim(), page: pageNum, quantity },
      });
      const payload = res.data || {};
      const data = Array.isArray(payload) ? payload : payload.items || [];
      const total = payload.totalItems ?? null;
      setResults(data);
      setTotalItems(total);
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
      setPage(1);
      searchBooks(query, 1);
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchBooks]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) return;
    searchBooks(query, page);
  }, [page]);

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

  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState({ title: '', authorName: '', genre: '', description: '', totalPages: '' });
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const handleCoverFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverDataUrl(String(reader.result));
    reader.readAsDataURL(file);
    setCoverFileName(file.name);
  };

  const handleCreateCustom = async () => {
    if (!custom.title.trim()) return alert('Title is required');
    try {
      const res = await api.post('/books', {
        title: custom.title,
        authorName: custom.authorName || 'Unknown',
        genre: custom.genre || 'Інше',
        description: custom.description || '',
        totalPages: custom.totalPages ? Number(custom.totalPages) : undefined,
        coverImageUrl: coverDataUrl || undefined,
      });
      setShowCustom(false);
      setCustom({ title: '', authorName: '', genre: '', description: '', totalPages: '' });
      setCoverDataUrl(null);
      onBookAdded();
      if (res.data?.id) router.push(`/books/${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create book');
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
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <button type="button" className="btn-primary" onClick={() => setShowCustom(true)}>
            + {t('books.addFromGoogle') /* reuse label */}
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button disabled={page <= 1} type="button" className="btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            <span className={css.pageIndicator}>{t('books.pageOf', { page, total: totalItems ? Math.ceil(totalItems / quantity) : '...' })}</span>
            <button
              disabled={results.length === 0 || (totalItems !== null && page * quantity >= totalItems)}
              type="button"
              className="btn-secondary"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {showDropdown && (
          <div className={css.dropdown}>
            {results.length === 0 && !loading ? (
              <div className={css.noResults} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <div>{t('books.searchNoResults')}</div>
                <button type="button" className="btn-primary" onClick={() => { setShowCustom(true); setShowDropdown(false); }}>{t('books.createCustom') || 'Create custom book'}</button>
              </div>
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
            {/* pagination footer inside dropdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button disabled={page <= 1} type="button" className="btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                <span style={{ color: '#ddd' }}>{t('books.pageOf', { page, total: totalItems ? Math.ceil(totalItems / quantity) : '...' })}</span>
                <button disabled={results.length === 0 || (totalItems !== null && page * quantity >= totalItems)} type="button" className="btn-secondary" onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
              <div />
            </div>
          </div>
        )}
      </div>
      {showCustom && (
        <div className={css.modalOverlay} onClick={() => setShowCustom(false)}>
          <div className={css.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={css.modalTitle}>{t('books.createCustom') || 'Create custom book'}</h3>
            <div className={css.modalGrid}>
              <input className={css.modalInput} placeholder={t('books.createCustom.titlePlaceholder') || 'Title'} value={custom.title} onChange={(e) => setCustom({ ...custom, title: e.target.value })} />
              <input className={css.modalInput} placeholder={t('books.createCustom.authorPlaceholder') || 'Author'} value={custom.authorName} onChange={(e) => setCustom({ ...custom, authorName: e.target.value })} />
              <input className={css.modalInput} placeholder={t('books.createCustom.genrePlaceholder') || 'Genre'} value={custom.genre} onChange={(e) => setCustom({ ...custom, genre: e.target.value })} />
              <input className={css.modalInput} placeholder={t('books.createCustom.pagesPlaceholder') || 'Pages'} type="number" value={custom.totalPages} onChange={(e) => setCustom({ ...custom, totalPages: e.target.value })} />
            </div>
            <textarea className={css.modalTextarea} placeholder={t('books.createCustom.descriptionPlaceholder') || 'Description'} value={custom.description} onChange={(e) => setCustom({ ...custom, description: e.target.value })} />
            <div className={css.modalFileRow}>
              <label style={{ color: '#cbd5e1' }}>{t('books.createCustom.uploadCover') || 'Upload cover'}</label>
              <input id="custom-cover-input" className={css.modalFileInput} type="file" accept="image/*" onChange={(e) => handleCoverFile(e.target.files?.[0])} />
              <button type="button" className={css.fileButton} onClick={() => document.getElementById('custom-cover-input')?.click()}>{t('books.createCustom.chooseFile') || 'Choose file'}</button>
              <span className={css.fileName}>{coverFileName ?? t('books.createCustom.noFile') ?? 'No file chosen'}</span>
              {coverDataUrl && <img className={css.modalCoverPreview} src={coverDataUrl} />}
            </div>
            <div className={css.modalActions}>
              <button type="button" className="btn-secondary" onClick={() => setShowCustom(false)}>{t('books.createCustom.cancel') || 'Cancel'}</button>
              <button type="button" className="btn-primary" onClick={handleCreateCustom}>{t('books.createCustom.create') || 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
