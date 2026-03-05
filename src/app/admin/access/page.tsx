import { withPermission, hasPermission } from '@/shared/lib/auth-guard';
import { UserTable } from '@/features/access/components/user-table';
import { RoleTable } from '@/features/access/components/role-table';
import type { User, Role } from '@/features/access/types';

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
