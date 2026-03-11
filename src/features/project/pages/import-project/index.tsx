'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Download, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { batchUploadProjects } from '@/features/project/services';
import { BulkImportProjectTrigger } from '@/features/project/components/bulk-import-project-trigger';
import { ImportConfirmModal } from '@/features/project/components/import-confirm-modal';
import { ImportProjectTable } from '@/features/project/components/import-project-table';
import type {
  BulkProjectImportDraft,
  BatchUploadProjectRequest,
  BatchUploadProjectError,
  RowView,
} from '@/features/project/types/import-project';
import { ApiError } from '@/shared/types/api';
import {
  clearBulkProjectImportDraft,
  getBulkProjectImportDraft,
  resolveBackendErrorRow,
  downloadImportLog,
} from '@/features/project/utils/csv';
import {
  getImportProgressState,
  setImportProgressState,
  subscribeImportProgress,
} from '@/features/project/store/import-progress-store';

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const CHUNK_SIZE = 5;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ImportProjectPage() {
  const router = useRouter();

  const [draft, setDraft] = useState<BulkProjectImportDraft | null>(null);
  const [rows, setRows] = useState<RowView[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Global import progress — survives client-side navigation
  const importProgress = useSyncExternalStore(
    subscribeImportProgress,
    getImportProgressState,
    () => null
  );

  const isImportRunning = importProgress?.status === 'running';

  // Warn only on page refresh / tab close (which actually kills the fetches)
  useEffect(() => {
    if (!isSubmitting) return;
    const handle = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, [isSubmitting]);

  useEffect(() => {
    const draftData = getBulkProjectImportDraft();
    if (!draftData) return;
    applyDraft(draftData);
  }, []);

  // ─── Derived state ─────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const paginatedRows = useMemo(
    () => rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [rows, currentPage]
  );

  const selectedRows = useMemo(() => rows.filter(r => r.selected), [rows]);
  const selectedValidRows = useMemo(() => rows.filter(r => r.selected && r.errors.length === 0), [rows]);
  const selectedInvalidRows = useMemo(() => rows.filter(r => r.selected && r.errors.length > 0), [rows]);

  const hasNoSelection = selectedRows.length === 0;
  const hasValidationError = selectedInvalidRows.length > 0;

  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, rows.length);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function applyDraft(draftData: BulkProjectImportDraft) {
    setDraft(draftData);
    setRows(draftData.rows.map(row => ({ ...row, selected: row.errors.length === 0 })));
    setCurrentPage(1);
  }

  function toggleRow(rowNumber: number) {
    setRows(prev => prev.map(r => r.rowNumber === rowNumber ? { ...r, selected: !r.selected } : r));
  }

  function toggleAllRows(checked: boolean) {
    setRows(prev => prev.map(r => ({ ...r, selected: checked })));
  }

  const handleImport = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setImportProgressState({ status: 'running', done: 0, total: selectedValidRows.length, sourceFileName: draft!.sourceFileName });

    const chunks: RowView[][] = [];
    for (let i = 0; i < selectedValidRows.length; i += CHUNK_SIZE) {
      chunks.push(selectedValidRows.slice(i, i + CHUNK_SIZE));
    }

    let totalSuccess = 0;
    let totalFailed = 0;
    const backendMessagesByRow = new Map<number, string[]>();
    let networkError: string | null = null;
    let processedRows: RowView[] = [];

    try {
      for (const chunk of chunks) {
        const payload: BatchUploadProjectRequest[] = chunk.map(r => r.dto);
        const response = await batchUploadProjects(payload);
        const { successCount, failedCount, errors } = response.data;

        totalSuccess += successCount;
        totalFailed += failedCount;
        processedRows = [...processedRows, ...chunk];

        errors.forEach((err: BatchUploadProjectError) => {
          const csvRowNumber = resolveBackendErrorRow(err.row, chunk);
          if (csvRowNumber === null) return;
          const messages = err.reasons.length > 0 ? err.reasons : ['Baris tidak valid.'];
          const existing = backendMessagesByRow.get(csvRowNumber) ?? [];
          backendMessagesByRow.set(csvRowNumber, [...new Set([...existing, ...messages])]);
        });

        setImportProgressState({
          status: 'running',
          done: processedRows.length,
          total: selectedValidRows.length,
          sourceFileName: draft!.sourceFileName,
        });
      }
    } catch (error) {
      networkError = error instanceof ApiError ? error.message : 'Koneksi terputus saat mengimpor.';
    } finally {
      setIsSubmitting(false);
    }

    if (networkError !== null) {
      const unprocessedRows = selectedValidRows.filter(
        r => !processedRows.some(p => p.rowNumber === r.rowNumber)
      );
      if (processedRows.length > 0) {
        downloadImportLog(processedRows, backendMessagesByRow, unprocessedRows, draft!.sourceFileName);
      }
      setImportProgressState({
        status: 'completed',
        totalSuccess,
        totalFailed: selectedValidRows.length - processedRows.length + totalFailed,
        hadErrors: true,
      });
      const savedNote = totalSuccess > 0 ? ` ${totalSuccess} proyek sudah tersimpan — log diunduh otomatis.` : '';
      showToast('danger', 'Koneksi terputus', networkError + savedNote);
      return;
    }

    if (backendMessagesByRow.size > 0) {
      setRows(prev =>
        prev.map(row => {
          const deduped = backendMessagesByRow.get(row.rowNumber);
          if (!deduped || deduped.length === 0) return row;
          return { ...row, errors: [...new Set([...row.errors, ...deduped])], selected: false };
        })
      );
      downloadImportLog(processedRows, backendMessagesByRow, [], draft!.sourceFileName);
    }

    setImportProgressState({
      status: 'completed',
      totalSuccess,
      totalFailed,
      hadErrors: totalFailed > 0,
    });

    if (totalFailed === 0) {
      clearBulkProjectImportDraft();
      showToast('success', 'Import proyek berhasil', `${totalSuccess} proyek berhasil diimpor.`);
      router.push('/admin/projects');
    } else if (totalSuccess > 0) {
      showToast('warning', 'Import sebagian berhasil', `${totalSuccess} proyek berhasil, ${totalFailed} gagal. Log kesalahan diunduh otomatis.`);
    } else {
      showToast('danger', 'Import gagal', 'Semua baris gagal diimpor. Log kesalahan diunduh otomatis.');
    }
  };

  // ─── Empty state ───────────────────────────────────────────────────────────

  if (!draft && !isImportRunning) {
    return (
      <main className="px-6 py-8">
        <div className="rounded-xl border bg-white p-6">
          <h1 className="text-2xl font-semibold text-primary">Import Proyek</h1>
          <p className="mt-2 text-sm text-gray-500">
            Data CSV belum ditemukan. Mulai proses dari halaman manajemen proyek.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/admin/projects">Kembali ke Manajemen Proyek</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // ─── Validation summary card class ─────────────────────────────────────────

  const validationCardClass = hasNoSelection
    ? 'rounded-xl border border-warning bg-warning-light/30 p-4 text-warning'
    : hasValidationError
      ? 'rounded-xl border border-danger bg-danger-light/30 p-4 text-danger'
      : 'rounded-xl border border-success bg-success-light/30 p-4 text-success';

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="px-6 py-8">
      <div className="space-y-6 rounded-xl bg-white p-6">

        <div>
          <h2 className="text-2xl font-semibold text-primary">Import Proyek</h2>
          <Link
            href="/admin/projects"
            className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Lihat semua proyek
          </Link>
        </div>

        {/* ── Background import in progress (user navigated away and came back) ── */}
        {isImportRunning && importProgress.status === 'running' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 px-4 py-3 text-warning">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm font-medium">
                Import sedang berjalan di background. Jangan refresh halaman — cukup tunggu di sini atau navigasi bebas.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Mengimpor proyek...</span>
                <span className="font-medium">{importProgress.done} / {importProgress.total}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Completed result banner (shown when user comes back after completion) ── */}
        {importProgress?.status === 'completed' && (
          <div className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 ${
            importProgress.hadErrors
              ? 'border-warning bg-warning/10 text-warning'
              : 'border-success bg-success/10 text-success'
          }`}>
            <div className="flex items-start gap-2">
              {importProgress.hadErrors
                ? <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              }
              <p className="text-sm font-medium">
                {importProgress.hadErrors
                  ? `Import selesai dengan error: ${importProgress.totalSuccess} berhasil, ${importProgress.totalFailed} gagal. Log sudah diunduh.`
                  : `Import selesai: ${importProgress.totalSuccess} proyek berhasil diimpor.`
                }
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 text-xs underline opacity-70 hover:opacity-100"
              onClick={() => setImportProgressState(null)}
            >
              Tutup
            </button>
          </div>
        )}

        {draft && (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold text-primary">{rows.length} Proyek Terdeteksi</p>
                <p className="mt-1 text-sm text-gray-500">Sumber file: {draft.sourceFileName}</p>
              </div>
              <BulkImportProjectTrigger
                buttonLabel="Ubah sumber file"
                buttonVariant="outlined"
                redirectPath={null}
                onDraftReady={applyDraft}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
              <ImportProjectTable
                rows={rows}
                paginatedRows={paginatedRows}
                selectedRows={selectedRows}
                currentPage={currentPage}
                totalPages={totalPages}
                startItem={startItem}
                endItem={endItem}
                onToggleRow={toggleRow}
                onToggleAll={toggleAllRows}
                onPageChange={setCurrentPage}
              />

              <div className={validationCardClass}>
                <div className="flex items-start gap-2">
                  {hasNoSelection || hasValidationError
                    ? <AlertCircle className="mt-0.5 size-5" />
                    : <CheckCircle2 className="mt-0.5 size-5" />
                  }
                  <div>
                    <p className="text-sm font-semibold">
                      {hasNoSelection || hasValidationError ? 'Project tidak valid' : 'Validasi berhasil'}
                    </p>
                    {hasNoSelection ? (
                      <p className="mt-1 text-sm">Pilih minimal satu proyek untuk diimpor.</p>
                    ) : hasValidationError ? (
                      <p className="mt-1 text-sm">
                        Terdapat {selectedInvalidRows.length} project dengan data tidak valid.
                        Perbaiki data atau deselect project untuk dapat mengimpor project.
                      </p>
                    ) : (
                      <p className="mt-1 text-sm">
                        Semua {selectedValidRows.length} proyek terpilih valid dan siap diimpor.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Active progress bar (this component started the import) ── */}
            {isImportRunning && importProgress.status === 'running' && isSubmitting && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Mengimpor proyek...</span>
                  <span className="font-medium">{importProgress.done} / {importProgress.total}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row">
              <Button
                disabled={isImportRunning || selectedValidRows.length === 0 || selectedInvalidRows.length > 0}
                onClick={() => setShowConfirmModal(true)}
              >
                {isImportRunning ? 'Import sedang berjalan...' : `Import project Terpilih (${selectedValidRows.length} Project)`}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/admin/projects')}
              >
                Kembali
              </Button>
              {isImportRunning && (
                <p className="flex items-center gap-1.5 text-xs text-gray-400 self-center">
                  <Download className="size-3.5" />
                  Import berjalan di background 
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <ImportConfirmModal
        isOpen={showConfirmModal}
        projectCount={selectedValidRows.length}
        chunkSize={CHUNK_SIZE}
        onConfirm={handleImport}
        onClose={() => setShowConfirmModal(false)}
      />
    </main>
  );
}
