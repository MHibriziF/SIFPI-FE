'use client';

import { Download, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/components/button';

interface ImportConfirmModalProps {
  isOpen: boolean;
  projectCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export function ImportConfirmModal({
  isOpen,
  projectCount,
  onConfirm,
  onClose,
}: Readonly<ImportConfirmModalProps>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-primary px-6 py-4">
          <h2 className="text-base font-semibold text-white">Konfirmasi Import</h2>
        </div>
        <div className="px-6 py-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/15">
              <TriangleAlert className="size-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Anda akan mengimpor {projectCount} proyek.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Proses ini tidak dapat dibatalkan setelah dimulai. Pastikan data sudah benar sebelum melanjutkan.
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                <Download className="size-3.5" />
                Log hasil import akan diunduh otomatis jika ada proyek yang gagal.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outlined" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={onConfirm}>
              Ya, Import Sekarang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
