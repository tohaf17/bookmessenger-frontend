'use client';

import { useState } from 'react';
import { BookOpen, Users, MessageSquare, Star, ShieldAlert, FilePenLine } from 'lucide-react';
import TabSwitcher from '@/components/common/TabSwitcher';
import { useAuthStore } from '@/store/authStore';
import { isAdminUser } from '@/lib/auth';
import { useT } from '@/lib/translations';
import styles from './AdminDashboard.module.css';
import AdminBooksPanel from './AdminBooksPanel';
import AdminUsersPanel from './AdminUsersPanel';
import AdminReviewsPanel from './AdminReviewsPanel';
import AdminCommentsPanel from './AdminCommentsPanel';

type AdminTab = 'books' | 'users' | 'reviews' | 'comments';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const t = useT();
  const [activeTab, setActiveTab] = useState<AdminTab>('books');

  const introName = user && isAdminUser(user) ? `${user.name} ${user.surname}` : 'Admin';

  return (
    <div className={styles.dashboard}>
      <section className="glass-panel">
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <h1 className={styles.introTitle}>{t('admin.dashboard.title')}</h1>
            <p className={styles.introText}>{t('admin.dashboard.description')}</p>
          </div>

          <div className={`glass-panel ${styles.introCard}`}>
            <div className={styles.introCardTitle}>{t('admin.dashboard.signedInAs')}</div>
            <div className={styles.introEmail}>
              <ShieldAlert size={14} />
              {user?.email ?? 'admin@bookmessenger.com'}
            </div>
            <div className={styles.introCardText}>{t('admin.dashboard.welcome', { name: introName })}</div>
          </div>
        </div>
      </section>

      <div className={styles.summaryGrid}>
        <div className={`glass-panel ${styles.summaryCard}`}>
          <div className={styles.summaryValue}>
            <BookOpen size={22} color="#c084fc" />
          </div>
          <div className={styles.summaryLabel}>{t('admin.dashboard.summary.books')}</div>
        </div>
        <div className={`glass-panel ${styles.summaryCard}`}>
          <div className={styles.summaryValue}>
            <Users size={22} color="#60a5fa" />
          </div>
          <div className={styles.summaryLabel}>{t('admin.dashboard.summary.users')}</div>
        </div>
        <div className={`glass-panel ${styles.summaryCard}`}>
          <div className={styles.summaryValue}>
            <Star size={22} color="#f59e0b" />
          </div>
          <div className={styles.summaryLabel}>{t('admin.dashboard.summary.reviews')}</div>
        </div>
        <div className={`glass-panel ${styles.summaryCard}`}>
          <div className={styles.summaryValue}>
            <MessageSquare size={22} color="#10b981" />
          </div>
          <div className={styles.summaryLabel}>{t('admin.dashboard.summary.comments')}</div>
        </div>
      </div>

      <section className={`glass-panel ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionTitle}>{t('admin.dashboard.sectionTitle')}</div>
            <div className={styles.sectionText}>{t('admin.dashboard.sectionText')}</div>
          </div>

          <div className={styles.statusBar}>
            <FilePenLine size={14} />
            {t('admin.dashboard.oneAdminOnly')}
          </div>
        </div>

        <div className={styles.tabsWrap}>
          <TabSwitcher
            tabs={[
              { key: 'books', label: t('admin.dashboard.tab.books') },
              { key: 'users', label: t('admin.dashboard.tab.users') },
              { key: 'reviews', label: t('admin.dashboard.tab.reviews') },
              { key: 'comments', label: t('admin.dashboard.tab.comments') },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as AdminTab)}
          />
        </div>

        {activeTab === 'books' && <AdminBooksPanel />}
        {activeTab === 'users' && <AdminUsersPanel />}
        {activeTab === 'reviews' && <AdminReviewsPanel />}
        {activeTab === 'comments' && <AdminCommentsPanel />}
      </section>
    </div>
  );
}
