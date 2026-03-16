import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import { RoleDetailView } from '@/features/access/components/role-detail';
import { serverGetRoleDetail, serverGetRoleUsers } from '@/features/access/services';

export default withPermission('USER', 'READ')(
  async ({ params }: { params: Promise<{ id: string }> }, session) => {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('SIFPI_TOKEN')?.value ?? '';

    const [role, { users, total }] = await Promise.all([
      serverGetRoleDetail(id, token),
      serverGetRoleUsers(id, token),
    ]);

    if (!role) notFound();

    const canUpdate = hasPermission(session, 'USER', 'UPDATE');

    return <RoleDetailView role={role} initialUsers={users} totalUsers={total} canUpdate={canUpdate} />;
  },
);
