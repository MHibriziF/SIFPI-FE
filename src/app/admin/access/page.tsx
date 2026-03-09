import { cookies } from 'next/headers';
import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import { UserTable } from '@/features/access/components/user-table';
import { RoleTable } from '@/features/access/components/role-table';
import { serverGetAdminUsers, serverGetRoles } from '@/features/access/services';

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
