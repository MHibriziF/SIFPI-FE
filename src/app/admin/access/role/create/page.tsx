import { withPermission } from '@/shared/lib/auth-guard';
import { RoleCreateForm } from '@/features/access/components/role-create-form';
import type { RoleUser } from '@/features/access/types';

// TODO: Replace with real API call once backend is ready
const MOCK_AVAILABLE_USERS: RoleUser[] = [
  { id: '1', name: 'Budi Santoso', email: 'example1@gmail.com', currentRole: 'Project Owner' },
  { id: '2', name: 'Budi Santoso', email: 'mail@gmail.com', currentRole: 'Project Owner' },
  { id: '3', name: 'Budi Santoso', email: 'mail@gmail.com', currentRole: 'Project Owner' },
  { id: '4', name: 'Budi Santoso', email: 'example@gmail.com', currentRole: 'Project Owner' },
];

export default withPermission('USER', 'CREATE')(async (_props, _session) => {
  // TODO: Replace with real API call:
  // const { data: users } = await getUsers();
  const availableUsers = MOCK_AVAILABLE_USERS;

  return (
    <div className="p-6 space-y-2">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        User Management / roles
      </div>

      <h2 className="text-2xl font-bold text-primary">Buat Hak Akses Role Baru</h2>

      <RoleCreateForm availableUsers={availableUsers} />
    </div>
  );
});
