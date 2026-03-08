import { cookies } from 'next/headers';
import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import { UserTable } from '@/features/access/components/user-table';
import { RoleTable } from '@/features/access/components/role-table';
import type { AdminUser, Role } from '@/features/access/types';
import type { BaseResponse } from '@/shared/types/api';

async function fetchAdminUsers(): Promise<{ users: AdminUser[]; total: number }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('SIFPI_TOKEN')?.value;
  if (!token) return { users: [], total: 0 };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
      headers: { Cookie: `SIFPI_TOKEN=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { users: [], total: 0 };
    const body: BaseResponse<{ content: AdminUser[]; totalElements: number }> = await res.json();
    return {
      users: body.data?.content ?? [],
      total: body.data?.totalElements ?? 0,
    };
  } catch {
    return { users: [], total: 0 };
  }
}

async function fetchRoles(): Promise<Role[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('SIFPI_TOKEN')?.value;
  if (!token) return [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
      headers: { Cookie: `SIFPI_TOKEN=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const body: BaseResponse<Role[]> = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

export default withPermission('USER', 'READ')(async (_props, session) => {
  const [roles, { users, total }] = await Promise.all([fetchRoles(), fetchAdminUsers()]);

  const canCreate = hasPermission(session, 'USER', 'CREATE');

  return (
    <div className="p-6 space-y-8">
      {/* User Management Section */}
      <UserTable
        initialUsers={users}
        totalEntries={total}
      />

      {/* Role / Access Management Section */}
      <RoleTable
        roles={roles}
        canCreate={canCreate}
      />
    </div>
  );
});
