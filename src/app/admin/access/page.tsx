'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getUsers, getRoles } from '@/features/access/services';
import { apiGet } from '@/shared/lib/api';
import type { AdminUser, Role } from '@/features/access/types';
import type { AuthResponse } from '@/features/auth/types';
import { UserTable } from '@/features/access/components/user-table';
import { RoleTable } from '@/features/access/components/role-table';
import { BulkImportTrigger } from '@/features/user-management/components/bulk-import-trigger';

export default function AccessPage() {
  const searchParams = useSearchParams();
  const page   = Math.max(0, parseInt(searchParams.get('page')   ?? '0',  10));
  const size   = Math.max(1, parseInt(searchParams.get('size')   ?? '10', 10));
  const role   = searchParams.get('role')   ?? '';
  const search = searchParams.get('search') ?? '';

  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [roles, setRoles]           = useState<Role[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [canCreate, setCanCreate]   = useState(false);

  // Roles and permissions only need to load once
  useEffect(() => {
    getRoles().then(res => setRoles(res.data ?? []));
    apiGet<AuthResponse>('/api/me').then(res => {
      setCanCreate(res.data?.permissions?.['USER']?.includes('CREATE') ?? false);
    });
  }, []);

  // Users re-fetch whenever pagination or filters change
  useEffect(() => {
    getUsers({ page, size, role: role || undefined, search: search || undefined }).then(res => {
      setUsers((res.data?.content ?? []) as AdminUser[]);
      setTotal(res.data?.totalElements ?? 0);
      setTotalPages(res.data?.totalPages ?? 0);
    });
  }, [page, size, role, search]);

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">User Management</h2>
          <p className="text-sm text-gray-500">Kelola pengguna dan lakukan import user via CSV/XLSX.</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportTrigger />
          {canCreate && (
            <Link
              href="/admin/access/create-executive"
              className="inline-flex items-center gap-2 px-4 py-2 bg-action-submit text-white rounded-lg hover:bg-action-submit/85 transition-colors font-medium text-sm"
            >
              <Plus className="size-4" />
              Buat Akun Executive
            </Link>
          )}
        </div>
      </div>

      <UserTable
        users={users}
        totalEntries={total}
        totalPages={totalPages}
        currentPage={page}
        pageSize={size}
      />

      <RoleTable roles={roles} canCreate={canCreate} />
    </div>
  );
}
