import { BulkImportTrigger } from '@/features/user-management/components/bulk-import-trigger';

export default function AdminUsersPage() {
  return (
    <main className="px-6 py-8">
      <div className="rounded-xl border border-primary/10 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Manajemen Pengguna</h1>
            <p className="mt-2 text-sm text-gray-500">
              Kelola data pengguna dan lakukan migrasi data legacy melalui bulk insert CSV.
            </p>
          </div>
          <BulkImportTrigger />
        </div>
      </div>
    </main>
  );
}
