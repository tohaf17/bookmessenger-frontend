
import {navTranslations} from './nav';
import { homeTranslations } from './home';
import { authTranslations } from './auth';
import { commonTranslations } from './common';
import { booksTranslations } from './books';
import { dashboardTranslations } from './dashboard';
import { trackersTranslations } from './trackers';
import { usersTranslations } from './users';
import { adminTranslations } from './admin';

export const translations = {
  ...navTranslations,
  ...homeTranslations,
  ...authTranslations,
  ...commonTranslations,
  ...booksTranslations,
  ...dashboardTranslations,
  ...trackersTranslations,
  ...usersTranslations,
  ...adminTranslations,
} as const;

export type TranslationKey = keyof typeof translations;
