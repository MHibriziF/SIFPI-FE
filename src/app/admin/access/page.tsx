import { cookies } from 'next/headers';
import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import { UserTable } from '@/features/access/components/user-table';
import { RoleTable } from '@/features/access/components/role-table';
import { serverGetAdminUsers, serverGetRoles } from '@/features/access/services';
import { BulkImportTrigger } from '@/features/user-management/components/bulk-import-trigger';
import { Link, Plus } from 'lucide-react';

export default withPermission('USER', 'READ')(async (_props, session) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('SIFPI_TOKEN')?.value ?? '';

  const [roles, { users, total }] = await Promise.all([
    serverGetRoles(token),
    serverGetAdminUsers(token),
  ]);

  const canCreate = hasPermission(session, 'USER', 'CREATE');

  return (
    <div className="p-6 space-y-8">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen Pengguna & Akses</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola verifikasi Project Owner dan akses Investor
          </p>
        </div>
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

      {/* User Management Section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">User Management</h2>
          <p className="text-sm text-gray-500">Kelola pengguna dan lakukan import user via CSV/XLSX.</p>
        </div>
        <BulkImportTrigger />
      </div>
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
