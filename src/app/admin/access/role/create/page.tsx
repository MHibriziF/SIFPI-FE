import { withPermission } from '@/shared/lib/auth-guard';
import { RoleCreateForm } from '@/features/access/components/role-create-form';

export default withPermission('USER', 'CREATE')(async () => {
  return (
    <div className="p-6 space-y-2">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <a href="/admin/access">User Management</a> / roles
      </div>

      <h2 className="text-2xl font-bold text-primary">Buat Hak Akses Role Baru</h2>

      <RoleCreateForm />
    </div>
  );
});
