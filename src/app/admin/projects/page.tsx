import { BulkImportProjectTrigger } from '@/features/project/components/bulk-import-project-trigger';

export default function AdminProjectsPage() {
  return (
    <main className="px-6 py-8">
      <div className="space-y-6 rounded-xl bg-white p-6">
        <div>
          <BulkImportProjectTrigger />
        </div>
        <p className="text-sm text-gray-400">
          Halaman daftar proyek belum tersedia. Gunakan tombol di atas untuk mencoba import proyek.
        </p>
      </div>
    </main>
  );
}
