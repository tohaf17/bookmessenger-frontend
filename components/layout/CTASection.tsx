'use client';

import { useT } from '@/lib/translations';
import styles from './CTASection.module.css';

export default function CTASection() {
  const t = useT();
  return (
    <footer className={styles.footer}>
      <p>© 2026 BookMessenger. {t('home.footer')}</p>
    </footer>
  );
}
