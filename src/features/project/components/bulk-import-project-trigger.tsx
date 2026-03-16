'use client';

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert, Loader2, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import type { BulkProjectImportDraft } from '@/features/project/types/import-project';
import {
  buildProjectTemplateCsv,
  parseAndValidateBulkProjectFile,
  saveBulkProjectImportDraft,
} from '@/features/project/utils/csv';
import {
  getImportProgressState,
  subscribeImportProgress,
} from '@/features/project/store/import-progress-store';
import { cn } from '@/shared/lib/utils';

interface BulkImportProjectTriggerProps {
  buttonLabel?: string;
  className?: string;
  buttonVariant?: 'filled' | 'outlined' | 'ghost';
  redirectPath?: string | null;
  onDraftReady?: (draft: BulkProjectImportDraft) => void;
}

export function BulkImportProjectTrigger({
  buttonLabel = 'Import Proyek',
  className,
  buttonVariant = 'filled',
  redirectPath = '/admin/projects/import',
  onDraftReady,
}: BulkImportProjectTriggerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const importProgress = useSyncExternalStore(
    subscribeImportProgress,
    getImportProgressState,
    () => null
  );
  const isImportRunning = importProgress?.status === 'running';

  // When an import is running, show a "Lihat Progress" button instead
  if (isImportRunning && redirectPath !== null) {
    return (
      <Button
        variant={buttonVariant}
        className={className}
        onClick={() => router.push('/admin/projects/import')}
      >
        <Loader2 className="size-4 animate-spin" />
        {' '}Lihat Progress ({importProgress.done}/{importProgress.total})
      </Button>
    );
  }

  const selectedFileLabel = useMemo(
    () => selectedFile?.name ?? 'Tidak ada file yang dipilih',
    [selectedFile]
  );

  const closeModal = () => {
    setOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    const csvContent = buildProjectTemplateCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-import-proyek.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const handleProcessFile = async () => {
    if (!selectedFile) {
      showToast('warning', 'File belum dipilih', 'Silakan pilih file CSV terlebih dahulu.');
      return;
    }

    const isCsv = selectedFile.name.toLowerCase().endsWith('.csv');
    const isXlsx = selectedFile.name.toLowerCase().endsWith('.xlsx');
    if (!isCsv && !isXlsx) {
      showToast('warning', 'Format file tidak sesuai', 'File harus berformat .csv atau .xlsx');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast('warning', 'Ukuran file terlalu besar', 'Maksimal ukuran file adalah 10MB.');
      return;
    }

    setIsParsing(true);

    try {
      const parsed = await parseAndValidateBulkProjectFile(selectedFile);

      if (parsed.globalErrors.length > 0) {
        showToast('danger', 'Gagal membaca CSV', parsed.globalErrors.join(' '));
        return;
      }

      const draft: BulkProjectImportDraft = {
        sourceFileName: selectedFile.name,
        rows: parsed.rows,
        createdAt: new Date().toISOString(),
      };

      saveBulkProjectImportDraft(draft);
      onDraftReady?.(draft);
      setOpen(false);
      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch {
      showToast('danger', 'Terjadi kesalahan', 'File CSV tidak dapat diproses.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className={className} variant={buttonVariant}>
        <Upload className="size-4" />
        {buttonLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Tutup modal"
            className="absolute inset-0 bg-primary/30"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />

          <motion.div
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <div className="bg-primary px-6 py-4 text-center">
              <h2 className="text-2xl font-semibold text-white">Pilih file CSV</h2>
            </div>

            <div className="space-y-6 p-8">
              <div>
                <label htmlFor="bulk-import-project-file" className="text-lg font-medium text-primary">
                  Pilih file CSV
                  <span className="ml-1 text-danger">*</span>
                </label>
                <div className="mt-2 rounded-xl border border-gray-300 px-4 py-3">
                  <input
                    ref={fileInputRef}
                    id="bulk-import-project-file"
                    type="file"
                    accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={event => {
                      const file = event.target.files?.[0] ?? null;
                      setSelectedFile(file);
                    }}
                    className={cn(
                      'w-full text-sm text-primary',
                      'file:mr-4 file:rounded-md file:border file:border-gray-200 file:bg-gray-50',
                      'file:px-4 file:py-1.5 file:text-sm file:text-primary'
                    )}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">Upload CSV/XLSX files (max 10MB)</p>
                <p className="mt-1 text-sm text-gray-500">{selectedFileLabel}</p>
              </div>

              <div className="rounded-2xl border border-info bg-info-light px-6 py-5 text-info">
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-1 size-5" />
                  <div>
                    <p className="text-lg font-semibold">Informasi</p>
                    <p className="mt-2 text-sm">
                      Pastikan baris pertama adalah nama kolom sesuai format. Kolom wajib meliputi:
                      ownerEmail, name, description, sector, location, valueProposition,
                      ownerInstitution, contactPersonName, contactPersonEmail, contactPersonPhone,
                      cooperationModel, concessionPeriod, assetReadiness, governmentSupport,
                      totalCapex, totalOpex, npv, irr, revenueStream, isFeasibilityStudy.
                      Tambahkan kolom{' '}
                      <code className="rounded bg-info/10 px-1">timeline1_timeRange</code>,{' '}
                      <code className="rounded bg-info/10 px-1">timeline1_phaseDescription</code>{' '}
                      dst untuk menyertakan tahapan proyek.
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="mt-1 cursor-pointer text-sm underline"
                    >
                      Download template csv
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <Button
                  onClick={handleProcessFile}
                  disabled={isParsing}
                  className="h-11 flex-1 text-base font-semibold"
                >
                  {isParsing ? 'Memproses...' : 'Import Proyek'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={closeModal}
                  className="h-11 flex-1 text-base font-medium"
                >
                  Kembali (Buang Perubahan)
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
