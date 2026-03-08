import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import { RoleDetailView } from '@/features/access/components/role-detail';
import type { RoleDetail, RoleUserItem } from '@/features/access/types';
import type { BaseResponse } from '@/shared/types/api';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('SIFPI_TOKEN')?.value ?? null;
}

async function fetchRoleDetail(id: string, token: string): Promise<RoleDetail | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/roles/${id}`,
      { headers: { Cookie: `SIFPI_TOKEN=${token}` }, cache: 'no-store' },
    );
    if (!res.ok) return null;
    const body: BaseResponse<RoleDetail> = await res.json();
    return body.data ?? null;
  } catch {
    return null;
  }
}

async function fetchRoleUsers(
  id: string,
  token: string,
): Promise<{ users: RoleUserItem[]; total: number }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/roles/${id}/users`,
      { headers: { Cookie: `SIFPI_TOKEN=${token}` }, cache: 'no-store' },
    );
    if (!res.ok) return { users: [], total: 0 };
    const body: BaseResponse<{ content: RoleUserItem[]; totalElements: number }> =
      await res.json();
    return {
      users: body.data?.content ?? [],
      total: body.data?.totalElements ?? 0,
    };
  } catch {
    return { users: [], total: 0 };
  }
}

export default withPermission('USER', 'READ')(
  async ({ params }: { params: Promise<{ id: string }> }, session) => {
    const { id } = await params;
    const token = await getToken();
    if (!token) notFound();

    const [role, { users, total }] = await Promise.all([
      fetchRoleDetail(id, token),
      fetchRoleUsers(id, token),
    ]);

    if (!role) notFound();

    const canUpdate = hasPermission(session, 'USER', 'UPDATE');

    return <RoleDetailView role={role} initialUsers={users} totalUsers={total} canUpdate={canUpdate} />;
  },
);
