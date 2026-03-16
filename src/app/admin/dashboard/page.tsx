import { BulkImportTrigger } from '@/features/user-management/components/bulk-import-trigger';

export default function AdminDashboardPage() {
  return (
    <main className="px-6 py-8">
      <div className="rounded-xl border border-primary/10 bg-white p-6">
        <h1 className="text-2xl font-semibold text-primary">Dashboard Admin</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gunakan fitur bulk insert untuk migrasi data pengguna legacy dari sistem IPFO sebelumnya.
        </p>

        <div className="mt-4">
          <BulkImportTrigger buttonLabel="Bulk Insert User" />
        </div>
      </div>
    </main>
  );
}
