import { create } from 'zustand';

export type AppLanguage = 'uk' | 'en';

interface LangState {
  lang: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
}

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') 
  {
    return 'uk';
  }
  const saved = window.localStorage.getItem('app-lang');
  return saved === 'en' || saved === 'uk' ? saved : 'uk';
};

export const useLangStore = create<LangState>((set, get) => ({
  lang: getInitialLanguage(),
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app-lang', lang);
    }
    set({ lang });
  },
  toggleLanguage: () => {
    const nextLang = get().lang === 'uk' ? 'en' : 'uk';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app-lang', nextLang);
    }
    set({ lang: nextLang });
  },
}));
