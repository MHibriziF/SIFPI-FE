import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { withPermission } from '@/shared/lib/auth-guard';
import { RoleEditForm } from '@/features/access/components/role-edit-form';
import { serverGetRoleDetail, serverGetRoleUsers } from '@/features/access/services';

export default withPermission('USER', 'UPDATE')(
  async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('SIFPI_TOKEN')?.value ?? '';

    const [role, { users: roleUsers, total }] = await Promise.all([
      serverGetRoleDetail(id, token),
      serverGetRoleUsers(id, token),
    ]);

    if (!role) notFound();

    return (
      <div className="p-6 space-y-2">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500">
          <a href="/admin/access" className="hover:underline">
            Manajemen Pengguna &amp; Akses
          </a>
          {' / '}
          <a href="/admin/access" className="hover:underline">
            Manajemen Role
          </a>
          {' / '}
          <a href={`/admin/access/role/${id}`} className="hover:underline">
            {role.name}
          </a>
          {' / '}
          <span className="font-semibold text-primary">Edit</span>
        </div>

        <h2 className="text-2xl font-bold text-primary">Edit Hak Akses Role</h2>

        <RoleEditForm role={role} initialRoleUsers={roleUsers} totalUsers={total} />
      </div>
    );
  },
);
