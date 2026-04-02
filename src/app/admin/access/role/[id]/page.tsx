'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getRoleDetail, getRoleUsers } from '@/features/access/services';
import { apiGet } from '@/shared/lib/api';
import type { RoleDetail, RoleUserItem } from '@/features/access/types';
import type { AuthResponse } from '@/features/auth/types';
import { RoleDetailView } from '@/features/access/components/role-detail';

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [role, setRole]           = useState<RoleDetail | null>(null);
  const [users, setUsers]         = useState<RoleUserItem[]>([]);
  const [total, setTotal]         = useState(0);
  const [canUpdate, setCanUpdate] = useState(false);
  const [missing, setMissing]     = useState(false);

  useEffect(() => {
    Promise.all([
      getRoleDetail(id),
      getRoleUsers(id),
      apiGet<AuthResponse>('/api/me'),
    ]).then(([roleRes, usersRes, sessionRes]) => {
      if (!roleRes.data) { setMissing(true); return; }
      setRole(roleRes.data);
      setUsers(usersRes.data?.content ?? []);
      setTotal(usersRes.data?.totalElements ?? 0);
      setCanUpdate(sessionRes.data?.permissions?.['USER']?.includes('UPDATE') ?? false);
    }).catch(() => setMissing(true));
  }, [id]);

  if (missing) notFound();
  if (!role) return null;

  return (
    <RoleDetailView
      role={role}
      initialUsers={users}
      totalUsers={total}
      canUpdate={canUpdate}
    />
  );
}
