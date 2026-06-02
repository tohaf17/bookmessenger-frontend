'use client';

import css from './ReaderDirectory.module.css';
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AdminRedirect from '@/components/common/AdminRedirect';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import { useAuthStore } from '@/store/authStore';
import { Search, User as UserIcon, Loader2, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
}

export default function ReadersDirectory() {
  const { user: currentUser } = useAuthStore();
  const t = useT();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { page, quantity: 12 } });
      const dataList = res.data?.data || res.data || [];
      
      setUsers(dataList);
      setTotalPages(res.data?.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load readers directory', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter local results if the endpoint doesn't support query-level search
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.name} ${u.surname}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={css.appContainer}>
      <AdminRedirect />
      <Navbar />

      <main className={css.main}>
        <div className={css.header}>
          <h1 className={`glow-text ${css.title}`}>{t('users.directoryTitle')}</h1>
          <p className={css.subtitle}>{t('users.directorySubtitle')}</p>
        </div>

        {/* Search Panel */}
        <div className={`glass-panel ${css.searchPanel}`}>
          <Search size={18} className={css.searchIcon} />
          <input
            type="text"
            placeholder={t('users.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`glass-input ${css.searchInput}`}
          />
        </div>

        {loading ? (
          <div className={css.loaderContainer}>
            <Loader2 size={40} className={css.spinner} />
            <p>{t('users.loadingReaders')}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={`glass-panel ${css.emptyContainer}`}>
            <UserIcon size={48} color="#6b7280" />
            <h3>{t('users.noReaders')}</h3>
            <p>{t('users.noReadersHint')}</p>
          </div>
        ) : (
          <div className={css.grid}>
            {filteredUsers.map((u) => {
              const isSelf = currentUser?.id === u.id;
              
              return (
                <div key={u.id} className={`glass-panel ${css.card}`}>
                  <div className={css.cardHeader}>
                    <div className={css.avatar}>
                      <UserIcon size={24} color="#9333ea" />
                    </div>
                    <div className={css.nameGroup}>
                      <h4 className={css.userName}>
                        {u.name} {u.surname} {isSelf && ` (${t('users.you')})`}
                      </h4>
                      <span className={css.roleTag}>{u.role}</span>
                    </div>
                  </div>

                  <p className={css.userEmail}>{u.email}</p>

                  <Link href={`/users/${u.id}`} className={`btn-secondary ${css.profileBtn}`}>
                    {t('users.viewProfile')}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

