'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { batchUploadProjects } from '@/features/project/service';
import { BulkImportProjectTrigger } from '@/features/project/components/bulk-import-project-trigger';
import type {
  BulkProjectImportDraft,
  BatchUploadProjectRequest,
  BatchUploadProjectError,
  ParsedBulkProjectRow,
} from '@/features/project/types/import-project';
import { ApiError } from '@/shared/types/api';
import {
  clearBulkProjectImportDraft,
  getBulkProjectImportDraft,
  formatFundingDisplay,
} from '@/features/project/utils/csv';

const PAGE_SIZE = 10;

interface RowView extends ParsedBulkProjectRow {
  selected: boolean;
}

function resolveBackendErrorRow(
  backendRow: number,
  submittedRows: RowView[]
): number | null {
  // Backend returns 1-based index into the submitted payload array
  const fromOneBased = submittedRows[backendRow - 1];
  if (fromOneBased) return fromOneBased.rowNumber;

  // Fallback: 0-based index
  const fromZeroBased = submittedRows[backendRow];
  if (fromZeroBased) return fromZeroBased.rowNumber;

  // Last fallback: direct match on absolute CSV row number
  const direct = submittedRows.find(row => row.rowNumber === backendRow);
  if (direct) return direct.rowNumber;

  return null;
}

export default function ImportProjectPage() {
  const router = useRouter();

  const [draft, setDraft] = useState<BulkProjectImportDraft | null>(null);
  const [rows, setRows] = useState<RowView[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const applyDraft = (draftData: BulkProjectImportDraft) => {
    setDraft(draftData);
    setRows(
      draftData.rows.map(row => ({
        ...row,
        selected: row.errors.length === 0,
      }))
    );
    setCurrentPage(1);
  };

  useEffect(() => {
    const draftData = getBulkProjectImportDraft();
    if (!draftData) return;
    applyDraft(draftData);
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = useMemo(
    () => rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [rows, currentPage]
  );

  const selectedRows = useMemo(() => rows.filter(row => row.selected), [rows]);
  const selectedValidRows = useMemo(
    () => rows.filter(row => row.selected && row.errors.length === 0),
    [rows]
  );
  const selectedInvalidRows = useMemo(
    () => rows.filter(row => row.selected && row.errors.length > 0),
    [rows]
  );

  const hasValidationError = selectedInvalidRows.length > 0;
  const hasNoSelection = selectedRows.length === 0;

  const toggleRow = (rowNumber: number) => {
    setRows(prev =>
      prev.map(row => {
        if (row.rowNumber !== rowNumber) return row;
        return { ...row, selected: !row.selected };
      })
    );
  };

  const toggleAllRows = (checked: boolean) => {
    setRows(prev => prev.map(row => ({ ...row, selected: checked })));
  };

  const handleImport = async () => {
    if (selectedValidRows.length === 0) {
      showToast('warning', 'Tidak ada baris valid', 'Pilih minimal 1 proyek valid untuk diimpor.');
      return;
    }
    if (selectedInvalidRows.length > 0) {
      showToast(
        'danger',
        'Masih ada baris bermasalah',
        'Hilangkan centang pada baris yang error agar proses import bisa dilanjutkan.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: BatchUploadProjectRequest[] = selectedValidRows.map(row => row.dto);
      const response = await batchUploadProjects(payload);
      const { successCount, failedCount, errors } = response.data;

      if (failedCount === 0) {
        // Full success
        clearBulkProjectImportDraft();
        showToast(
          'success',
          'Import proyek berhasil',
          `${successCount} proyek berhasil diimpor.`
        );
        router.push('/admin/projects');
        return;
      }

      // Partial success — mark failed rows with backend errors
      const backendMessagesByRow = new Map<number, string[]>();
      errors.forEach((err: BatchUploadProjectError) => {
        const csvRowNumber = resolveBackendErrorRow(err.row, selectedValidRows);
        if (csvRowNumber === null) return;
        const messages = err.reasons.length > 0 ? err.reasons : ['Baris tidak valid.'];
        const existing = backendMessagesByRow.get(csvRowNumber) ?? [];
        backendMessagesByRow.set(csvRowNumber, [...new Set([...existing, ...messages])]);
      });

      setRows(prev =>
        prev.map(row => {
          const deduped = backendMessagesByRow.get(row.rowNumber);
          if (!deduped || deduped.length === 0) return row;
          return {
            ...row,
            errors: [...new Set([...row.errors, ...deduped])],
            selected: false,
          };
        })
      );

      if (successCount > 0) {
        showToast(
          'warning',
          'Import sebagian berhasil',
          `${successCount} proyek berhasil, ${failedCount} gagal. Periksa baris yang ditandai error.`
        );
      } else {
        showToast('danger', 'Import gagal', 'Semua baris gagal diimpor. Periksa error pada tiap baris.');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        showToast('danger', 'Import gagal', error.message);
      } else {
        showToast('danger', 'Import gagal', 'Terjadi kesalahan saat mengirim data ke server.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!draft) {
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

  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, rows.length);

  return (
    <main className="px-6 py-8">
      <div className="space-y-6 rounded-xl bg-white p-6">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Manajemen Proyek</h1>
          <p className="mt-1 text-sm text-gray-600">Kelola verifikasi proyek</p>
        </div>

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

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold text-primary">
              {rows.length} Proyek Terdeteksi
            </p>
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
          <div className="min-w-0">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-max min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="sticky left-0 z-10 w-12 bg-gray-50 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={rows.length > 0 && selectedRows.length === rows.length}
                        onChange={event => toggleAllRows(event.target.checked)}
                      />
                    </th>
                    <th className="whitespace-nowrap px-4 py-3">Project Name</th>
                    <th className="whitespace-nowrap px-4 py-3">Owner Email</th>
                    <th className="whitespace-nowrap px-4 py-3">Description</th>
                    <th className="whitespace-nowrap px-4 py-3">Sector</th>
                    <th className="whitespace-nowrap px-4 py-3">Location</th>
                    <th className="whitespace-nowrap px-4 py-3">Value Proposition</th>
                    <th className="whitespace-nowrap px-4 py-3">Owner Institution</th>
                    <th className="whitespace-nowrap px-4 py-3">Contact Name</th>
                    <th className="whitespace-nowrap px-4 py-3">Contact Email</th>
                    <th className="whitespace-nowrap px-4 py-3">Contact Phone</th>
                    <th className="whitespace-nowrap px-4 py-3">Cooperation Model</th>
                    <th className="whitespace-nowrap px-4 py-3">Concession Period</th>
                    <th className="whitespace-nowrap px-4 py-3">Asset Readiness</th>
                    <th className="whitespace-nowrap px-4 py-3">Gov. Support</th>
                    <th className="whitespace-nowrap px-4 py-3">Total CAPEX</th>
                    <th className="whitespace-nowrap px-4 py-3">Total OPEX</th>
                    <th className="whitespace-nowrap px-4 py-3">NPV</th>
                    <th className="whitespace-nowrap px-4 py-3">IRR</th>
                    <th className="whitespace-nowrap px-4 py-3">Revenue Stream</th>
                    <th className="whitespace-nowrap px-4 py-3">Feasibility Study</th>
                    <th className="whitespace-nowrap px-4 py-3">Additional Info</th>
                    <th className="whitespace-nowrap px-4 py-3">Location Image</th>
                    <th className="whitespace-nowrap px-4 py-3">Structure Image</th>
                    <th className="whitespace-nowrap px-4 py-3">Project File</th>
                    <th className="sticky right-0 z-10 min-w-[200px] whitespace-nowrap bg-gray-50 px-4 py-3 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]">
                      Status Validasi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedRows.map(row => {
                    const isInvalid = row.errors.length > 0;
                    const textColor = isInvalid ? 'text-danger' : 'text-primary';
                    const rowBg = isInvalid ? 'bg-red-50' : 'bg-white';

                    return (
                      <tr key={row.rowNumber} className={rowBg}>
                        <td className={`sticky left-0 z-10 px-4 py-3 align-top ${rowBg}`}>
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => toggleRow(row.rowNumber)}
                          />
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top font-medium ${textColor}`}>
                          {row.dto.name || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.ownerEmail || '-'}
                        </td>
                        <td className={`max-w-[200px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.description}>
                          {row.dto.description || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.sector || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.location || '-'}
                        </td>
                        <td className={`max-w-[200px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.valueProposition}>
                          {row.dto.valueProposition || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.ownerInstitution || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.contactPersonName || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.contactPersonEmail || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.contactPersonPhone || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.cooperationModel || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.concessionPeriod ? `${row.dto.concessionPeriod} tahun` : '-'}
                        </td>
                        <td className={`max-w-[200px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.assetReadiness}>
                          {row.dto.assetReadiness || '-'}
                        </td>
                        <td className={`max-w-[200px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.governmentSupport}>
                          {row.dto.governmentSupport || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.totalCapex ? formatFundingDisplay(row.dto.totalCapex) : '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.totalOpex ? formatFundingDisplay(row.dto.totalOpex) : '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.npv ? formatFundingDisplay(row.dto.npv) : '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.irr ? `${row.dto.irr}%` : '-'}
                        </td>
                        <td className={`max-w-[200px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.revenueStream}>
                          {row.dto.revenueStream || '-'}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 align-top ${textColor}`}>
                          {row.dto.is_feasibility_study ? 'Ya' : 'Tidak'}
                        </td>
                        <td className={`max-w-[200px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.additionalInfo ?? ''}>
                          {row.dto.additionalInfo || '-'}
                        </td>
                        <td className={`max-w-[150px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.locationImageUrl ?? ''}>
                          {row.dto.locationImageUrl || '-'}
                        </td>
                        <td className={`max-w-[150px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.projectStructureImageUrl ?? ''}>
                          {row.dto.projectStructureImageUrl || '-'}
                        </td>
                        <td className={`max-w-[150px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.projectFileUrl ?? ''}>
                          {row.dto.projectFileUrl || '-'}
                        </td>
                        <td className={`sticky right-0 z-10 min-w-[200px] px-4 py-3 align-top ${rowBg} shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]`}>
                          {isInvalid ? (
                            <div className="space-y-0.5">
                              {row.errors.map((err, i) => (
                                <p key={i} className="text-sm text-danger">{err}</p>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                              <span className="size-2 rounded-full bg-success" />
                              Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <p>
                Showing {startItem}-{endItem} of {rows.length} projects
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="hover:underline disabled:opacity-40 disabled:no-underline"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="hover:underline disabled:opacity-40 disabled:no-underline"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div
            className={
              hasNoSelection
                ? 'rounded-xl border border-warning bg-warning-light/30 p-4 text-warning'
                : hasValidationError
                  ? 'rounded-xl border border-danger bg-danger-light/30 p-4 text-danger'
                  : 'rounded-xl border border-success bg-success-light/30 p-4 text-success'
            }
          >
            <div className="flex items-start gap-2">
              {hasNoSelection || hasValidationError ? (
                <AlertCircle className="mt-0.5 size-5" />
              ) : (
                <CheckCircle2 className="mt-0.5 size-5" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {hasNoSelection || hasValidationError
                    ? 'Project tidak valid'
                    : 'Validasi berhasil'}
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

        <div className="flex flex-col gap-3 md:flex-row">
          <Button
            disabled={
              isSubmitting || selectedValidRows.length === 0 || selectedInvalidRows.length > 0
            }
            onClick={handleImport}
          >
            {isSubmitting
              ? 'Mengimpor...'
              : `Import project Terpilih (${selectedValidRows.length} Project)`}
          </Button>
          <Button variant="outlined" asChild>
            <Link href="/admin/projects">Kembali (batalkan perubahan)</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
