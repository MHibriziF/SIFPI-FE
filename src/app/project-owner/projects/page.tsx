import Link from 'next/link';
import { Button } from '@/shared/components/button';

export default function ProjectOwnerProjectsPage() {
  return (
    <main className="px-6 py-8">
      <div className="rounded-xl border border-primary/10 bg-white p-6">
        <h1 className="text-2xl font-semibold text-primary">Riwayat Proyek</h1>
        <p className="mt-2 text-sm text-gray-500">Halaman daftar proyek dapat dilengkapi pada iterasi berikutnya.</p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/project-owner/projects/create">Buat Pengajuan Proyek Baru</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
