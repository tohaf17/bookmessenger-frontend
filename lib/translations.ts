import { useLangStore } from '@/store/langStore';

import { translations } from './translations/index';

export { translations };

export type TranslationKey = string;

export { navTranslations } from './translations/nav';
export { homeTranslations } from './translations/home';
export { authTranslations } from './translations/auth';
export { commonTranslations } from './translations/common';
export { booksTranslations } from './translations/books';
export { dashboardTranslations } from './translations/dashboard';
export { trackersTranslations } from './translations/trackers';
export { usersTranslations } from './translations/users';
export { adminTranslations } from './translations/admin';

const formatTranslation = (value: string, values?: Record<string, string | number>) => {
  if (!values) {
    return value;
  }
  return Object.entries(values).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
};

export const t = (key: string, values?: Record<string, string | number>) => {
  const lang = useLangStore.getState().lang;
  return formatTranslation(translations[key as keyof typeof translations]?.[lang] ?? key, values);
};

export const useT = () => {
  const lang = useLangStore((state) => state.lang);
  return (key: string, values?: Record<string, string | number>) =>
    formatTranslation(translations[key as keyof typeof translations]?.[lang] ?? key, values);
};
