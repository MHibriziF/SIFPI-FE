import { cookies } from 'next/headers';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import { UserTable } from '@/features/access/components/user-table';
import { RoleTable } from '@/features/access/components/role-table';
import { serverGetAdminUsers, serverGetRoles } from '@/features/access/services';
import { BulkImportTrigger } from '@/features/user-management/components/bulk-import-trigger';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default withPermission('USER', 'READ')(async (props: { searchParams?: SearchParams }, session) => {
  const sp = props.searchParams ? await props.searchParams : {};
  const page   = Math.max(0, parseInt((sp.page   as string) ?? '0',  10));
  const size   = Math.max(1, parseInt((sp.size   as string) ?? '10', 10));
  const role   = (sp.role   as string) ?? '';
  const search = (sp.search as string) ?? '';

  const cookieStore = await cookies();
  const token = cookieStore.get('SIFPI_TOKEN')?.value ?? '';

  const [roles, { users, total, totalPages }] = await Promise.all([
    serverGetRoles(token),
    serverGetAdminUsers(token, { page, size, role: role || undefined, search: search || undefined }),
  ]);

  const canCreate = hasPermission(session, 'USER', 'CREATE');

  return (
    <div className="p-6 space-y-8">
      {/* User Management Section */}
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

      {/* Role / Access Management Section */}
      <RoleTable
        roles={roles}
        canCreate={canCreate}
      />
    </div>
  );
});
