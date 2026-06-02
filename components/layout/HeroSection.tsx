'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/translations';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const { user } = useAuthStore();
  const t = useT();

  return (
    <section className={styles.hero}>
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        <span>{t('home.badge')}</span>
      </div>

      <h1 className={`${styles.title} glow-text`}>{t('home.title')}</h1>
      <p className={styles.subtitle}>{t('home.subtitle')}</p>

      <div className={styles.ctaGroup}>
        {user ? (
          <Link href="/books" className={`btn-primary ${styles.ctaButton}`}>
            {t('home.browse')}
            <ArrowRight size={18} />
          </Link>
        ) : (
          <>
            <Link href="/auth/register" className={`btn-primary ${styles.ctaButton}`}>
              {t('home.start')}
              <ArrowRight size={18} />
            </Link>
            <Link href="/auth/login" className={`btn-secondary ${styles.ctaButton}`}>
              {t('home.login')}
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
