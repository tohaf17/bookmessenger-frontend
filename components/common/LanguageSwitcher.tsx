'use client';

import { Languages } from 'lucide-react';
import { useLangStore } from '@/store/langStore';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
  const { lang, toggleLanguage } = useLangStore();

  return (
    <button
      type="button"
      className={styles.switcher}
      onClick={toggleLanguage}
      aria-label="Switch interface language"
      title="Switch language"
    >
      <Languages size={15} />
      <span>{lang === 'uk' ? 'UA' : 'EN'}</span>
    </button>
  );
}
