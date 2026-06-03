'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Shield, LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { isAdminUser } from '@/lib/auth';
import { useT } from '@/lib/translations';
import styles from './AdminShell.module.css';

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const t = useT();
  const { user, token, loading, fetchMe, logout } = useAuthStore();
  const isReady = Boolean(token && user && isAdminUser(user));

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (!user && !loading) {
      fetchMe();
    }
  }, [fetchMe, loading, router, token, user]);

  useEffect(() => {
    if (user && !isAdminUser(user)) {
      router.replace('/');
    }
  }, [router, user]);

  if (!isReady) {
    return (
      <div className={styles.loading}>
        <div className={`glass-panel ${styles.loadingCard}`}>
          <Loader2 size={22} className={styles.spinner} />
          <span>{t('admin.shell.loading')}</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              <BookOpen size={22} color="#e9d5ff" />
            </div>
            <div className={styles.brandCopy}>
              <div className={styles.brandTitle}>{t('admin.shell.title')}</div>
              <div className={styles.brandSubtitle}>{t('admin.shell.subtitle')}</div>
            </div>
          </div>

          <div className={styles.badgeRow}>
            <span className={styles.badge}>
              <Shield size={14} />
              {t('admin.shell.badge')}
            </span>
            <span className={styles.userPill}>
              {user?.name ?? 'Admin'} {user?.surname ?? ''}
            </span>
            <button type="button" onClick={handleLogout} className={`btn-secondary ${styles.logoutBtn}`}>
              <LogOut size={16} />
              {t('admin.shell.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
