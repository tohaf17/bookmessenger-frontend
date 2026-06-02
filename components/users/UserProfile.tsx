'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdminRedirect from '@/components/common/AdminRedirect';
import { api } from '@/lib/api';
import { useT } from '@/lib/translations';
import { useAuthStore } from '@/store/authStore';
import FollowersList from './FollowersList';
import ReadingStats from './ReadingStats';
import UserProfileHeader from './UserProfileHeader';
import type { SocialTab, UserProfileData, UserStats } from './types';
import css from './UserProfile.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfile({ params }: PageProps) {
  const targetUserId = Number(use(params).id);
  const t = useT();
  const { user: currentUser, token } = useAuthStore();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [followers, setFollowers] = useState<UserProfileData[]>([]);
  const [following, setFollowing] = useState<UserProfileData[]>([]);
  const [userBooks, setUserBooks] = useState<any[]>([]);
  const [userTrackers, setUserTrackers] = useState<any[]>([]);
  const [userTrackerItems, setUserTrackerItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [updatingFollow, setUpdatingFollow] = useState(false);
  const [activeTab, setActiveTab] = useState<SocialTab>('followers');

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, followersRes, followingRes, booksRes, trackersRes, trackerItemsRes] = await Promise.all([
        api.get(`/users/${targetUserId}`),
        api.get(`/users/${targetUserId}/followers`),
        api.get(`/users/${targetUserId}/following`),
        api.get(`/user-books/user/${targetUserId}`, { params: { page: 1, quantity: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get(`/trackers/user/${targetUserId}`, { params: { page: 1, quantity: 50 } }).catch(() => ({ data: { data: [] } })),
        api.get(`/tracker-items/user/${targetUserId}`, { params: { page: 1, quantity: 100 } }).catch(() => ({ data: { data: [] } })),
      ]);
      setProfile(profileRes.data);
      setFollowers(followersRes.data || []);
      setFollowing(followingRes.data || []);

      const rawBooks = booksRes.data?.data || booksRes.data || [];
      const resolvedBooks = await Promise.all(
        rawBooks.map(async (ub: any) => {
          if (ub.book) return ub;
          try {
            const bookRes = await api.get(`/books/${ub.bookId}`);
            return { ...ub, book: bookRes.data };
          } catch {
            return ub;
          }
        })
      );
      setUserBooks(resolvedBooks);

      const rawTrackers = trackersRes.data?.data || trackersRes.data || [];
      setUserTrackers(rawTrackers);

      const rawTrackerItems = trackerItemsRes.data?.data || trackerItemsRes.data || [];
      const resolvedTrackerItems = await Promise.all(
        rawTrackerItems.map(async (item: any) => {
          if (item.userBook) return item;
          try {
            const ub = resolvedBooks.find((b: any) => b.id === item.userBookId);
            if (ub) return { ...item, userBook: ub };
            const ubRes = await api.get(`/user-books/${item.userBookId}`);
            const bookRes = await api.get(`/books/${ubRes.data.bookId}`);
            return { ...item, userBook: { ...ubRes.data, book: bookRes.data } };
          } catch {
            return item;
          }
        })
      );
      setUserTrackerItems(resolvedTrackerItems);

      setIsFollowing(Boolean(currentUser && (followersRes.data || []).some((user: UserProfileData) => user.id === currentUser.id)));

      try {
        const statsRes = await api.get(`/users/${targetUserId}/stats`);
        setStats(statsRes.data);
      } catch {
        setStats({ readCount: 0, currentlyReadingCount: 0, wantToReadCount: 0 });
      }
    } catch (err) {
      console.error('Failed to load profile data', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, currentUser]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleFollowToggle = async () => {
    if (!token) {
      alert(t('users.followLogin'));
      return;
    }
    setUpdatingFollow(true);
    try {
      if (isFollowing) {
        await api.delete(`/users/${targetUserId}/unfollow`);
      } else {
        await api.post(`/users/${targetUserId}/follow`);
      }
      await loadProfileData();
    } catch (err: any) {
      alert(err.response?.data?.message || t('users.socialFailed'));
    } finally {
      setUpdatingFollow(false);
    }
  };

  if (loading) return <ProfileState message={t('common.loadingProfile')} />;
  if (!profile) return <ProfileNotFound />;

  return (
    <div className={css.appContainer}>
      <AdminRedirect />
      <Navbar />
      <main className={css.main}>
        <Link href="/users" className={css.backBtn}>
          <ChevronLeft size={16} />
          {t('users.readerDirectory')}
        </Link>

        <UserProfileHeader
          profile={profile}
          followersCount={followers.length}
          followingCount={following.length}
          isSelf={currentUser?.id === profile.id}
          canFollow={Boolean(currentUser)}
          isFollowing={isFollowing}
          updatingFollow={updatingFollow}
          onFollowToggle={handleFollowToggle}
        />

        <div className={css.columns}>
          <div className={css.leftCol}>
            <ReadingStats stats={stats} />
          </div>
          <div className={css.rightCol}>
            <FollowersList
              activeTab={activeTab}
              followers={followers}
              following={following}
              userBooks={userBooks}
              trackers={userTrackers}
              trackerItems={userTrackerItems}
              isSelf={currentUser?.id === profile.id}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileState({ message }: { message: string }) {
  return (
    <div className={css.appContainer}>
      <Navbar />
      <div className={css.loaderContainer}>
        <Loader2 size={48} className={css.spinner} />
        <p>{message}</p>
      </div>
    </div>
  );
}

function ProfileNotFound() {
  const t = useT();

  return (
    <div className={css.appContainer}>
      <Navbar />
      <div className={css.errorContainer}>
        <h2>{t('users.notFound')}</h2>
        <Link href="/users" className="btn-primary">{t('users.readerDirectory')}</Link>
      </div>
    </div>
  );
}
