'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, CircleAlert } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { bulkInsertUsers } from '@/features/user-management/services';
import { BulkImportTrigger } from '@/features/user-management/components/bulk-import-trigger';
import type {
  BackendValidationError,
  BulkImportDraft,
  BulkInsertUserRequest,
  ParsedBulkUserRow,
} from '@/features/user-management/types';
import { ApiError } from '@/shared/types/api';
import { clearBulkImportDraft, getBulkImportDraft } from '@/features/user-management/utils/csv';

interface RowView extends ParsedBulkUserRow {
  selected: boolean;
}

function formatRowErrorMessages(row: RowView): string {
  if (row.errors.length === 0) return '-';
  return row.errors.join(' | ');
}

function formatStatusActive(value: boolean): string {
  return value ? 'Aktif' : 'Tidak Aktif';
}

function toDisplayRowNumber(rowNumber: number): number {
  return Math.max(1, rowNumber - 1);
}

function parseBackendValidationErrors(details: unknown): BackendValidationError[] {
  if (!details) return [];

  if (Array.isArray(details)) return details as BackendValidationError[];

  if (typeof details === 'object' && details !== null) {
    const record = details as Record<string, unknown>;
    if (Array.isArray(record.errors)) return record.errors as BackendValidationError[];
    if (Array.isArray(record.errorDetails)) return record.errorDetails as BackendValidationError[];
  }

  return [];
}

function extractBackendMessages(err: BackendValidationError): string[] {
  const messages: string[] = [];

  if (Array.isArray(err.reasons)) {
    messages.push(...err.reasons.filter(Boolean));
  }
  if (err.reason) {
    messages.push(err.reason);
  }
  if (err.message) {
    messages.push(err.message);
  }

  return [...new Set(messages)];
}

function getBackendRowCandidates(err: BackendValidationError): number[] {
  const values = [err.row, err.rowNumber].filter((value): value is number => Number.isFinite(value));
  return [...new Set(values)];
}

function resolveBackendErrorRows(
  backendError: BackendValidationError,
  submittedRows: RowView[]
): number[] {
  const candidates = getBackendRowCandidates(backendError);
  const matched: number[] = [];

  for (const candidate of candidates) {
    // Primary mapping: backend returns 1-based index of submitted payload.
    const fromOneBased = submittedRows[candidate - 1];
    if (fromOneBased) {
      matched.push(fromOneBased.rowNumber);
      continue;
    }

    // Fallback: backend returns 0-based index.
    const fromZeroBased = submittedRows[candidate];
    if (fromZeroBased) {
      matched.push(fromZeroBased.rowNumber);
      continue;
    }

    // Last fallback: backend already returns absolute row number from CSV.
    const direct = submittedRows.find(row => row.rowNumber === candidate);
    if (direct) {
      matched.push(direct.rowNumber);
    }
  }

  return [...new Set(matched)];
}

export default function ImportUsersPage() {
  const router = useRouter();

  const [draft, setDraft] = useState<BulkImportDraft | null>(null);
  const [rows, setRows] = useState<RowView[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyDraft = (draftData: BulkImportDraft) => {
    setDraft(draftData);
    setRows(
      draftData.rows.map(row => ({
        ...row,
        selected: row.errors.length === 0,
      }))
    );
  };

  useEffect(() => {
    const draftData = getBulkImportDraft();
    if (!draftData) return;
    applyDraft(draftData);
  }, []);

  const selectedRows = useMemo(
    () => rows.filter(row => row.selected),
    [rows]
  );
  const selectedValidRows = useMemo(
    () => rows.filter(row => row.selected && row.errors.length === 0),
    [rows]
  );
  const selectedInvalidRows = useMemo(
    () => rows.filter(row => row.selected && row.errors.length > 0),
    [rows]
  );

  const selectedInvalidErrorItems = useMemo(
    () =>
      selectedInvalidRows.map(row => ({
        rowNumber: toDisplayRowNumber(row.rowNumber),
        message: row.errors.join(' | '),
      })),
    [selectedInvalidRows]
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
    setRows(prev =>
      prev.map(row => {
        return { ...row, selected: checked };
      })
    );
  };

  const handleImport = async () => {
    if (selectedValidRows.length === 0) {
      showToast('warning', 'Tidak ada baris valid', 'Pilih minimal 1 user valid untuk diimpor.');
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
      const payload: BulkInsertUserRequest[] = selectedValidRows.map(row => row.dto);
      const response = await bulkInsertUsers(payload);

      clearBulkImportDraft();
      showToast(
        'success',
        'Bulk insert berhasil',
        `${response.data.imported} user berhasil diimpor.`
      );
      router.push('/admin/access');
    } catch (error) {
      if (error instanceof ApiError) {
        const backendErrors = parseBackendValidationErrors(error.details);

        if (backendErrors.length > 0) {
          const backendMessagesByRow = new Map<number, string[]>();
          backendErrors.forEach(err => {
            const messages = extractBackendMessages(err);
            const resolvedRows = resolveBackendErrorRows(err, selectedValidRows);
            const finalMessages = messages.length > 0 ? messages : ['Baris tidak valid.'];

            resolvedRows.forEach(rowNumber => {
              const existing = backendMessagesByRow.get(rowNumber) ?? [];
              backendMessagesByRow.set(rowNumber, [...new Set([...existing, ...finalMessages])]);
            });
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

          showToast('danger', 'Validasi backend gagal', 'Periksa baris yang ditandai error.');
          return;
        }

        showToast('danger', 'Import gagal', error.message);
        return;
      }

      showToast('danger', 'Import gagal', 'Terjadi kesalahan saat mengirim data ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!draft) {
    return (
      <main className="px-6 py-8">
        <div className="rounded-xl border bg-white p-6">
          <h1 className="text-2xl font-semibold text-primary">Import Pengguna</h1>
          <p className="mt-2 text-sm text-gray-500">
            Data CSV belum ditemukan. Mulai proses dari dashboard admin.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/admin/dashboard">Kembali ke Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-8">
      <div className="space-y-6 rounded-xl bg-white p-6">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Manajemen Pengguna &amp; Akses</h1>
          <p className="mt-1 text-sm text-gray-600">Kelola verifikasi Project Owner dan akses Investor</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary">Import Pengguna</h2>
          <Link
            href="/admin/access"
            className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Lihat semua pengguna
          </Link>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold text-primary">{rows.length} User Terdeteksi</p>
            <p className="mt-1 text-sm text-gray-500">Sumber file: {draft.sourceFileName}</p>
          </div>
          <BulkImportTrigger
            buttonLabel="Ubah sumber file"
            buttonVariant="outlined"
            redirectPath={null}
            onDraftReady={applyDraft}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selectedRows.length === rows.length}
                      onChange={event => toggleAllRows(event.target.checked)}
                    />
                  </th>
                  <th className="w-16 px-4 py-3">Baris</th>
                  <th className="px-4 py-3">Nama User</th>
                  <th className="px-4 py-3">Organisasi</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Nomor Telepon</th>
                  <th className="px-4 py-3">Status Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map(row => (
                  <tr key={row.rowNumber} className={row.errors.length > 0 ? 'bg-danger-light/20' : ''}>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => toggleRow(row.rowNumber)}
                      />
                    </td>
                    <td className="px-4 py-3 align-top font-medium text-primary">
                      {toDisplayRowNumber(row.rowNumber)}
                    </td>
                    <td className="px-4 py-3 align-top text-primary">{row.dto.nama}</td>
                    <td className="px-4 py-3 align-top text-primary">{row.dto.organisasi}</td>
                    <td className="px-4 py-3 align-top text-primary">{row.dto.role ?? '-'}</td>
                    <td className="px-4 py-3 align-top text-primary">
                      {formatStatusActive(row.dto.is_active)}
                    </td>
                    <td className="px-4 py-3 align-top text-primary">{row.dto.email}</td>
                    <td className="px-4 py-3 align-top text-primary">{row.dto.phone ?? '-'}</td>
                    <td className="px-4 py-3 align-top">
                      {row.errors.length === 0 ? (
                        <span className="font-medium text-success">Valid</span>
                      ) : (
                        <span className="text-danger">{formatRowErrorMessages(row)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <p className="text-sm font-semibold">Error validasi</p>
                {hasNoSelection ? (
                  <p className="mt-1 text-sm">Pilih minimal satu pengguna untuk diimpor.</p>
                ) : selectedInvalidErrorItems.length > 0 ? (
                  <>
                    <div className="mt-1 space-y-1">
                      {selectedInvalidErrorItems.map(item => (
                        <p key={item.rowNumber} className="text-sm">
                          Baris {item.rowNumber}: {item.message}
                        </p>
                      ))}
                    </div>
                    <p className="mt-1 text-sm">
                      Hilangkan centang pada baris bermasalah untuk melanjutkan import.
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm">Validasi awal berhasil.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-info bg-info-light px-4 py-4 text-info">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 size-5" />
            <p className="text-sm">
              Kredensial akun akan dikirimkan ke email yang dimasukkan untuk user aktif. Pastikan email
              valid dan role sudah sesuai.
            </p>
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
              : `Import User Terpilih (${selectedValidRows.length} User)`}
          </Button>
          <Button variant="outlined" asChild>
            <Link href="/admin/dashboard">Kembali (batalkan perubahan)</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
