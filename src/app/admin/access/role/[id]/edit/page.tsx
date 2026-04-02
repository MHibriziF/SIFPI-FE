'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getRoleDetail, getRoleUsers } from '@/features/access/services';
import type { RoleDetail, RoleUserItem } from '@/features/access/types';
import { RoleEditForm } from '@/features/access/components/role-edit-form';

export default function RoleEditPage() {
  const { id } = useParams<{ id: string }>();

  const [role, setRole]           = useState<RoleDetail | null>(null);
  const [roleUsers, setRoleUsers] = useState<RoleUserItem[]>([]);
  const [total, setTotal]         = useState(0);
  const [missing, setMissing]     = useState(false);

  useEffect(() => {
    Promise.all([
      getRoleDetail(id),
      getRoleUsers(id),
    ]).then(([roleRes, usersRes]) => {
      if (!roleRes.data) { setMissing(true); return; }
      setRole(roleRes.data);
      setRoleUsers(usersRes.data?.content ?? []);
      setTotal(usersRes.data?.totalElements ?? 0);
    }).catch(() => setMissing(true));
  }, [id]);

  if (missing) notFound();
  if (!role) return null;

  return (
    <div className="p-6 space-y-2">
      <div className="text-sm text-gray-500">
        <a href="/admin/access" className="hover:underline">Manajemen Pengguna &amp; Akses</a>
        {' / '}
        <a href="/admin/access" className="hover:underline">Manajemen Role</a>
        {' / '}
        <a href={`/admin/access/role/${id}`} className="hover:underline">{role.name}</a>
        {' / '}
        <span className="font-semibold text-primary">Edit</span>
      </div>

      <h2 className="text-2xl font-bold text-primary">Edit Hak Akses Role</h2>

      <RoleEditForm role={role} initialRoleUsers={roleUsers} totalUsers={total} />
    </div>
  );
}
