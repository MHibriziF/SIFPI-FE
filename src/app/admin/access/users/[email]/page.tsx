'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getUserByEmail } from '@/features/access/services';
import { apiGet } from '@/shared/lib/api';
import type { AdminUserDetail } from '@/features/access/types';
import type { AuthResponse } from '@/features/auth/types';
import { UserDetailView } from '@/features/access/components/user-detail';

export default function UserDetailPage() {
  const { email } = useParams<{ email: string }>();
  const decodedEmail = decodeURIComponent(email);

  const [user, setUser]           = useState<AdminUserDetail | null>(null);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [missing, setMissing]     = useState(false);

  useEffect(() => {
    Promise.all([
      getUserByEmail(decodedEmail),
      apiGet<AuthResponse>('/api/me'),
    ]).then(([userRes, sessionRes]) => {
      if (!userRes.data) { setMissing(true); return; }
      setUser(userRes.data);
      const perms = sessionRes.data?.permissions?.['USER'] ?? [];
      setCanUpdate(perms.includes('UPDATE'));
      setCanDelete(perms.includes('DELETE'));
    }).catch(() => setMissing(true));
  }, [decodedEmail]);

  if (missing) notFound();
  if (!user) return null;

  return <UserDetailView user={user} canUpdate={canUpdate} canDelete={canDelete} />;
}
