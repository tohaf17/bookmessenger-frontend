'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, PencilLine, ShieldAlert, Trash2, X } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { DEFAULT_ADMIN_EMAIL } from '@/lib/auth';
import { useT } from '@/lib/translations';
import styles from './AdminDashboard.module.css';
import type { AdminUser, PaginationMeta } from './types';

const PAGE_SIZE = 10;

type UserDraft = {
  name: string;
  surname: string;
  email: string;
  language: string;
  avatarUrl: string;
  password: string;
};

const emptyDraft: UserDraft = {
  name: '',
  surname: '',
  email: '',
  language: 'uk',
  avatarUrl: '',
  password: '',
};

export default function AdminUsersPanel() {
  const t = useT();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { page, quantity: PAGE_SIZE } });
      setUsers(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? null);
    } catch (error) {
      console.error('Failed to load users', error);
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const startEditing = (user: AdminUser) => {
    setEditingId(user.id);
    setDraft({
      name: user.name,
      surname: user.surname,
      email: user.email,
      language: user.language || 'uk',
      avatarUrl: user.avatarUrl || '',
      password: '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const saveUser = async (userId: number) => {
    setSavingId(userId);
    try {
      const payload: Record<string, string | undefined> = {
        name: draft.name.trim(),
        surname: draft.surname.trim(),
        email: draft.email.trim(),
        language: draft.language.trim(),
        avatarUrl: draft.avatarUrl.trim(),
      };

      if (draft.password.trim()) {
        payload.password = draft.password.trim();
      }

      await api.patch(`/users/${userId}`, payload);
      cancelEditing();
      await loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || t('admin.users.updateFailed'));
    } finally {
      setSavingId(null);
    }
  };

  const removeUser = async (user: AdminUser) => {
    if (user.email === DEFAULT_ADMIN_EMAIL) {
      alert(t('admin.users.defaultAdminDeleteBlocked'));
      return;
    }

    if (!confirm(t('admin.users.deleteConfirm', { name: user.name, surname: user.surname }))) {
      return;
    }

    setSavingId(user.id);
    try {
      await api.delete(`/users/${user.id}`);
      await loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || t('admin.users.deleteFailed'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={styles.listStack}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>{t('admin.users.title')}</div>
          <div className={styles.sectionText}>{t('admin.users.description')}</div>
        </div>
        <div className={styles.sectionStats}>
          {pagination ? `${pagination.totalItems} ${t('admin.users.total')}` : t('admin.users.title')}
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <Loader2 size={20} className={styles.spinner} />
          <span>{t('admin.users.loading')}</span>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <span>{t('admin.users.empty')}</span>
        </div>
      ) : (
        users.map((user) => {
          const isEditing = editingId === user.id;
          const isProtected = user.email === DEFAULT_ADMIN_EMAIL;

          return (
            <article key={user.id} className={`glass-panel ${styles.resourceCard}`}>
              <div className={styles.resourceTop}>
                <div>
                  <div className={styles.resourceTitle}>
                    {user.name} {user.surname}
                  </div>
                  <div className={styles.cardDescription}>{user.email}</div>
                </div>

                <div className={styles.resourceActions}>
                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        className={`btn-secondary ${styles.resourceActionBtn} ${styles.primaryBtn}`}
                        onClick={() => startEditing(user)}
                        disabled={isProtected}
                        title={isProtected ? t('admin.users.protectedAccount') : t('admin.users.editTitle')}
                      >
                        <PencilLine size={14} />
                        {t('admin.users.edit')}
                      </button>
                      <button
                        type="button"
                        className={`btn-secondary ${styles.resourceActionBtn} ${styles.dangerBtn}`}
                        onClick={() => removeUser(user)}
                        disabled={savingId === user.id || isProtected}
                        title={isProtected ? t('admin.users.protectedAccount') : t('admin.users.deleteTitle')}
                      >
                        {savingId === user.id ? <Loader2 size={14} className={styles.spinner} /> : <Trash2 size={14} />}
                        {t('admin.users.delete')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={`btn-primary ${styles.resourceActionBtn}`}
                        onClick={() => saveUser(user.id)}
                        disabled={savingId === user.id}
                      >
                        {savingId === user.id ? <Loader2 size={14} className={styles.spinner} /> : <Check size={14} />}
                        {t('common.save')}
                      </button>
                      <button
                        type="button"
                        className={`btn-secondary ${styles.resourceActionBtn}`}
                        onClick={cancelEditing}
                      >
                        <X size={14} />
                        {t('common.cancel')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.resourceMeta}>
                <span className={styles.metaPillSoft}>{t('admin.users.roleLabel')}: {user.role}</span>
                <span className={styles.metaPillMuted}>{t('admin.users.languageLabel')}: {user.language || 'uk'}</span>
                {isProtected && (
                  <span className={styles.metaPillDanger}>
                    <ShieldAlert size={12} />
                    {t('admin.users.protected')}
                  </span>
                )}
              </div>

              {!isEditing ? (
                <div className={styles.inlineHint}>
                  {t('admin.users.joined')} {new Date(user.createdAt).toLocaleDateString()}
                </div>
              ) : (
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>{t('admin.users.nameField')}</span>
                    <input
                      className={styles.fieldInput}
                      value={draft.name}
                      onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>{t('admin.users.surnameField')}</span>
                    <input
                      className={styles.fieldInput}
                      value={draft.surname}
                      onChange={(event) => setDraft((current) => ({ ...current, surname: event.target.value }))}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>{t('admin.users.emailField')}</span>
                    <input
                      className={styles.fieldInput}
                      value={draft.email}
                      onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>{t('admin.users.languageField')}</span>
                    <select
                      className={styles.fieldSelect}
                      value={draft.language}
                      onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value }))}
                    >
                      <option value="uk">uk</option>
                      <option value="en">en</option>
                    </select>
                  </label>
                  <label className={`${styles.field} ${styles.fieldWide}`}>
                    <span className={styles.fieldLabel}>{t('admin.users.avatarField')}</span>
                    <input
                      className={styles.fieldInput}
                      value={draft.avatarUrl}
                      onChange={(event) => setDraft((current) => ({ ...current, avatarUrl: event.target.value }))}
                    />
                  </label>
                  <label className={`${styles.field} ${styles.fieldWide}`}>
                    <span className={styles.fieldLabel}>{t('admin.users.passwordField')}</span>
                    <input
                      className={styles.fieldInput}
                      type="password"
                      value={draft.password}
                      onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
                      placeholder={t('admin.users.passwordHint')}
                      disabled={isProtected}
                    />
                  </label>
                </div>
              )}
            </article>
          );
        })
      )}

      {pagination && (
        <div className={styles.paginationWrap}>
          <Pagination
            page={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
