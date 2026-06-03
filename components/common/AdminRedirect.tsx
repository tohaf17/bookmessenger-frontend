'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { isAdminUser } from '@/lib/auth';

export default function AdminRedirect({ to = '/admin' }: { to?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token && !user && !loading) {
      fetchMe();
    }
  }, [token, user, loading, fetchMe]);

  useEffect(() => {
    if (isAdminUser(user) && pathname !== to) {
      router.replace(to);
    }
  }, [pathname, router, to, user]);

  return null;
}
