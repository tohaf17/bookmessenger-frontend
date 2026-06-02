'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { BookOpen, LogOut, User, Compass, Target, LogIn, UserPlus } from 'lucide-react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/translations';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, token, logout, fetchMe } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  if (String(user?.role).toLowerCase() === 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const linkClass = (path: string) =>
    `${styles.navLink} ${pathname === path ? styles.activeLink : ''}`;

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <BookOpen size={24} color="#9333ea" />
          <span className={styles.logoText}>Book<span className={styles.logoAccent}>Messenger</span></span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="/books" className={linkClass('/books')}>
            <Compass size={18} />
            {t('nav.books')}
          </Link>
          {user && (
            <>
              <Link href="/trackers" className={linkClass('/trackers')}>
                <Target size={18} />
                {t('nav.trackers')}
              </Link>
              <Link href="/dashboard" className={linkClass('/dashboard')}>
                <User size={18} />
                {t('nav.dashboard')}
              </Link>
              <Link href={`/users/${user.id}`} className={linkClass(`/users/${user.id}`)}>
                <User size={18} />
                {t('nav.profile')}
              </Link>
            </>
          )}
        </div>

        <div className={styles.authSection}>
          <LanguageSwitcher />
          {user ? (
            <div className={styles.userContainer}>
              <span className={styles.username}>
                {user.name} {user.surname}
              </span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={16} />
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className={styles.guestButtons}>
              <Link href="/auth/login" className={styles.loginBtn}>
                <LogIn size={16} />
                {t('nav.login')}
              </Link>
              <Link href="/auth/register" className={styles.registerBtn}>
                <UserPlus size={16} />
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
