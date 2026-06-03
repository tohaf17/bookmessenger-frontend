export type AuthUserLike = {
  role?: string | null;
  email?: string | null;
} | null | undefined;

export const DEFAULT_ADMIN_EMAIL = 'admin@bookmessenger.com';

export const isAdminRole = (role?: string | null): boolean =>
  String(role).toLowerCase() === 'admin';

export const isAdminUser = (user?: AuthUserLike): boolean =>
  isAdminRole(user?.role) ||
  String(user?.email).toLowerCase() === DEFAULT_ADMIN_EMAIL;
