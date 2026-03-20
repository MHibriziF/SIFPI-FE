'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { submitBulkInsert, getBatchUploadStatus } from '@/features/project/services';
import { BulkImportProjectTrigger } from '@/features/project/components/bulk-import-project-trigger';
import { ImportConfirmModal } from '@/features/project/components/import-confirm-modal';
import { ImportProjectTable } from '@/features/project/components/import-project-table';
import type {
  BulkProjectImportDraft,
  BatchUploadStatusDTO,
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

const POLL_INTERVAL_MS = 2000;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ImportProjectPage() {
  const router = useRouter();

  const [draft, setDraft] = useState<BulkProjectImportDraft | null>(null);
  const [rows, setRows] = useState<RowView[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [processedCount, setProcessedCount] = useState(0);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Global import progress — survives client-side navigation
  const importProgress = useSyncExternalStore(
    subscribeImportProgress,
    getImportProgressState,
    () => null
  );

  const isImportRunning = importProgress?.status === 'running';

  // Warn on page refresh while submitting (the actual job is safe server-side,
  // but refreshing stops the polling loop)
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

  // Resume polling if the user navigated away while an import was running
  useEffect(() => {
    if (importProgress?.status === 'running') {
      setIsSubmitting(true);
      startPolling(importProgress.jobId, importProgress.submittedRows);
    }
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Polling helpers ────────────────────────────────────────────────────────

  function stopPolling() {
    if (pollingRef.current !== null) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  function startPolling(jobId: string, submittedRows: RowView[]) {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const response = await getBatchUploadStatus(jobId);
        const statusData = response.data;
        if (statusData.status === 'PROCESSING') {
          setProcessedCount(statusData.processedCount ?? 0);
          return;
        }

        stopPolling();
        setIsSubmitting(false);
        completeBatchImport(statusData, submittedRows);
      } catch {
        stopPolling();
        setIsSubmitting(false);
        setImportProgressState({ status: 'completed', totalSuccess: 0, totalFailed: 0, hadErrors: true });
        showToast('danger', 'Koneksi terputus', 'Gagal memperoleh hasil import. Silakan periksa daftar proyek.');
      }
    }, POLL_INTERVAL_MS);
  }

  function completeBatchImport(statusData: BatchUploadStatusDTO, submittedRows: RowView[]) {
    const { successCount, failedCount } = statusData;
    const errors = statusData.errors ?? [];

    const backendMessagesByRow = new Map<number, string[]>();
    errors.forEach(err => {
      const csvRowNumber = resolveBackendErrorRow(err.row, submittedRows);
      if (csvRowNumber === null) return;
      const messages = err.reasons.length > 0 ? err.reasons : ['Baris tidak valid.'];
      const existing = backendMessagesByRow.get(csvRowNumber) ?? [];
      backendMessagesByRow.set(csvRowNumber, [...new Set([...existing, ...messages])]);
    });

    const processedRowNumbers = new Set(submittedRows.map(r => r.rowNumber));
    setRows(prev =>
      prev.map(row => {
        if (!processedRowNumbers.has(row.rowNumber)) return row;
        const errs = backendMessagesByRow.get(row.rowNumber);
        if (errs && errs.length > 0) {
          return { ...row, errors: [...new Set([...row.errors, ...errs])], selected: false };
        }
        return { ...row, errors: [], selected: false };
      })
    );

    const sourceFileName = importProgress?.status === 'running'
      ? importProgress.sourceFileName
      : (draft?.sourceFileName ?? 'import');

    if (backendMessagesByRow.size > 0) {
      downloadImportLog(submittedRows, backendMessagesByRow, [], sourceFileName);
    }

    setImportProgressState({
      status: 'completed',
      totalSuccess: successCount,
      totalFailed: failedCount,
      hadErrors: failedCount > 0,
    });

    if (failedCount === 0) {
      clearBulkProjectImportDraft();
      showToast('success', 'Import proyek berhasil', `${successCount} proyek berhasil diimpor.`);
      router.push('/admin/projects');
    } else if (successCount > 0) {
      showToast('warning', 'Import sebagian berhasil', `${successCount} proyek berhasil, ${failedCount} gagal. Log kesalahan diunduh otomatis.`);
    } else {
      showToast('danger', 'Import gagal', 'Semua baris gagal diimpor. Log kesalahan diunduh otomatis.');
    }
  }

  // ─── Derived state ─────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  const paginatedRows = useMemo(
    () => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [rows, currentPage, pageSize]
  );

  const selectedRows = useMemo(() => rows.filter(r => r.selected), [rows]);
  const selectedValidRows = useMemo(() => rows.filter(r => r.selected && r.errors.length === 0), [rows]);
  const selectedInvalidRows = useMemo(() => rows.filter(r => r.selected && r.errors.length > 0), [rows]);

  const hasNoSelection = selectedRows.length === 0;
  const hasValidationError = selectedInvalidRows.length > 0;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, rows.length);

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

    const rowsToSubmit = selectedValidRows;
    const payload = rowsToSubmit.map(r => r.dto);

    try {
      const response = await submitBulkInsert(payload);
      const { jobId, total } = response.data;

      setImportProgressState({
        status: 'running',
        jobId,
        total,
        sourceFileName: draft!.sourceFileName,
        submittedRows: rowsToSubmit,
      });

      startPolling(jobId, rowsToSubmit);
    } catch (error) {
      setIsSubmitting(false);
      showToast('danger', 'Gagal memulai import', error instanceof ApiError ? error.message : 'Terjadi kesalahan.');
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

  const validationCardClass = (() => {
    if (hasNoSelection) return 'rounded-xl border border-warning bg-warning-light/30 p-4 text-warning';
    if (hasValidationError) return 'rounded-xl border border-danger bg-danger-light/30 p-4 text-danger';
    return 'rounded-xl border border-success bg-success-light/30 p-4 text-success';
  })();

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
        {isImportRunning && !isSubmitting && importProgress.status === 'running' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 px-4 py-3 text-warning">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm font-medium">
                Import sedang berjalan di background. Jangan refresh halaman — cukup tunggu di sini atau navigasi bebas.
              </p>
            </div>
            <ImportProgress processed={processedCount} total={importProgress.total} />
          </div>
        )}

        {/* ── Completed result banner ── */}
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
                pageSize={pageSize}
                onToggleRow={toggleRow}
                onToggleAll={toggleAllRows}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
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
                    {(() => {
                      if (hasNoSelection) {
                        return <p className="mt-1 text-sm">Pilih minimal satu proyek untuk diimpor.</p>;
                      }
                      if (hasValidationError) {
                        return (
                          <p className="mt-1 text-sm">
                            Terdapat {selectedInvalidRows.length} project dengan data tidak valid.
                            Perbaiki data atau deselect project untuk dapat mengimpor project.
                          </p>
                        );
                      }
                      return (
                        <p className="mt-1 text-sm">
                          Semua {selectedValidRows.length} proyek terpilih valid dan siap diimpor.
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Active progress bar (this component started the import) ── */}
            {isImportRunning && isSubmitting && importProgress.status === 'running' && (
              <ImportProgress processed={processedCount} total={importProgress.total} />
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
            </div>
          </>
        )}
      </div>

      <ImportConfirmModal
        isOpen={showConfirmModal}
        projectCount={selectedValidRows.length}
        onConfirm={handleImport}
        onClose={() => setShowConfirmModal(false)}
      />
    </main>
  );
}

// ─── Import progress bar ──────────────────────────────────────────────────────

function ImportProgress({ processed, total }: Readonly<{ processed: number; total: number }>) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const hasProgress = processed > 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Memproses {total} proyek...</span>
        {hasProgress && <span>{processed} / {total} tervalidasi</span>}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        {hasProgress ? (
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        ) : (
          <div className="h-full w-1/3 rounded-full bg-primary animate-[slide_1.4s_ease-in-out_infinite]" />
        )}
      </div>
    </div>
  );
}
