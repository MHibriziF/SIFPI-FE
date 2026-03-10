import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import { UserTable } from '@/features/access/components/user-table';
import { RoleTable } from '@/features/access/components/role-table';
import { BulkImportTrigger } from '@/features/user-management/components/bulk-import-trigger';
import type { User, Role } from '@/features/access/types';
import Link from 'next/link';
import { Plus } from 'lucide-react';

// TODO: Replace with real API calls once backend is ready
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    organization: 'PT Infrastructure Development',
    email: 'example@gmail.com',
    role: 'Project Owner',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Budi Santoso',
    organization: 'Green Energy Solutions',
    email: 'example@gmail.com',
    role: 'Project Owner',
    status: 'PENDING',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    organization: 'Urban Tech Indonesia',
    email: 'example@gmail.com',
    role: 'Investor',
    status: 'ACTIVE',
  },
  {
    id: '4',
    name: 'Budi Santoso',
    organization: 'Maritime Holdings Ltd',
    email: 'example@gmail.com',
    role: 'Project Owner',
    status: 'REJECTED',
  },
];

const MOCK_ROLES: Role[] = [
  { id: '1', name: 'Admin', description: 'Keterangan role', userCount: 5 },
  { id: '2', name: 'Executive', description: 'Keterangan role', userCount: 130 },
  { id: '3', name: 'Project Owner', description: 'Keterangan role', userCount: 130 },
  { id: '4', name: 'Investor', description: 'Keterangan role', userCount: 150 },
];

export default withPermission('USER', 'READ')(async (_props, session) => {
  // TODO: Replace with real API calls:
  // const { data: usersData } = await getUsers();
  // const { data: rolesData } = await getRoles();
  const users = MOCK_USERS;
  const roles = MOCK_ROLES;

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
        initialUsers={users}
        totalEntries={users.length}
      />

      {/* Role / Access Management Section */}
      <RoleTable
        roles={roles}
        canCreate={canCreate}
      />
    </div>
  );
});
