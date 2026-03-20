'use client';

import { useState, useRef, useEffect } from 'react';
import type { RowView, BatchUploadProjectRequest } from '@/features/project/types/import-project';

interface ImportProjectTableProps {
  rows: RowView[];
  paginatedRows: RowView[];
  selectedRows: RowView[];
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  pageSize: number;
  onToggleRow: (rowNumber: number) => void;
  onToggleAll: (checked: boolean) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onUpdateRow: (rowNumber: number, field: keyof BatchUploadProjectRequest, value: string) => void;
}

// ─── Editable cell ────────────────────────────────────────────────────────────

type CellId = `${number}-${string}`;

function EditableCell({
  value,
  rowNumber,
  field,
  className,
  title,
  onCommit,
  editingCell,
  setEditingCell,
}: Readonly<{
  value: string;
  rowNumber: number;
  field: keyof BatchUploadProjectRequest;
  className: string;
  title?: string;
  onCommit: (rowNumber: number, field: keyof BatchUploadProjectRequest, value: string) => void;
  editingCell: CellId | null;
  setEditingCell: (cell: CellId | null) => void;
}>) {
  const cellId: CellId = `${rowNumber}-${field}`;
  const isEditing = editingCell === cellId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  if (isEditing) {
    return (
      <td className={className}>
        <input
          ref={inputRef}
          defaultValue={value}
          className="w-full min-w-24 rounded border border-primary/40 bg-white px-1.5 py-0.5 text-sm outline-none focus:ring-1 focus:ring-primary/30"
          onBlur={(e) => {
            onCommit(rowNumber, field, e.target.value);
            setEditingCell(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onCommit(rowNumber, field, (e.target as HTMLInputElement).value);
              setEditingCell(null);
            }
            if (e.key === 'Escape') setEditingCell(null);
          }}
        />
      </td>
    );
  }

  return (
    <td
      className={`${className} cursor-pointer hover:bg-primary/5`}
      title={title ?? value}
      onDoubleClick={() => setEditingCell(cellId)}
    >
      {value || '-'}
    </td>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function ImportProjectTable({
  rows,
  paginatedRows,
  selectedRows,
  currentPage,
  totalPages,
  startItem,
  endItem,
  pageSize,
  onToggleRow,
  onToggleAll,
  onPageChange,
  onPageSizeChange,
  onUpdateRow,
}: Readonly<ImportProjectTableProps>) {
  const [editingCell, setEditingCell] = useState<CellId | null>(null);

  return (
    <div className="min-w-0">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-max min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="sticky left-0 z-10 w-12 bg-gray-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selectedRows.length === rows.length}
                  onChange={e => onToggleAll(e.target.checked)}
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
              <th className="whitespace-nowrap px-4 py-3">Timelines</th>
              <th className="whitespace-nowrap px-4 py-3">Location Image</th>
              <th className="whitespace-nowrap px-4 py-3">Structure Image</th>
              <th className="whitespace-nowrap px-4 py-3">Project File</th>
              <th className="sticky right-0 z-10 min-w-50 whitespace-nowrap bg-gray-50 px-4 py-3 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]">
                Status Validasi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedRows.map(row => {
              const isInvalid = row.errors.length > 0;
              const textColor = isInvalid ? 'text-danger' : 'text-primary';
              const rowBg = isInvalid ? 'bg-red-50' : 'bg-white';
              const cellBase = `px-4 py-3 align-top ${textColor}`;

              return (
                <tr key={row.rowNumber} className={rowBg}>
                  <td className={`sticky left-0 z-10 px-4 py-3 align-top ${rowBg}`}>
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => onToggleRow(row.rowNumber)}
                    />
                  </td>
                  <EditableCell value={row.dto.name || ''} rowNumber={row.rowNumber} field="name" className={`whitespace-nowrap font-medium ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.ownerEmail || ''} rowNumber={row.rowNumber} field="ownerEmail" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.description || ''} rowNumber={row.rowNumber} field="description" className={`max-w-50 truncate ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.sector || ''} rowNumber={row.rowNumber} field="sector" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.location || ''} rowNumber={row.rowNumber} field="location" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.valueProposition || ''} rowNumber={row.rowNumber} field="valueProposition" className={`max-w-50 truncate ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.ownerInstitution || ''} rowNumber={row.rowNumber} field="ownerInstitution" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.contactPersonName || ''} rowNumber={row.rowNumber} field="contactPersonName" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.contactPersonEmail || ''} rowNumber={row.rowNumber} field="contactPersonEmail" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.contactPersonPhone || ''} rowNumber={row.rowNumber} field="contactPersonPhone" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.cooperationModel || ''} rowNumber={row.rowNumber} field="cooperationModel" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.concessionPeriod ? String(row.dto.concessionPeriod) : ''} rowNumber={row.rowNumber} field="concessionPeriod" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.assetReadiness || ''} rowNumber={row.rowNumber} field="assetReadiness" className={`max-w-50 truncate ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.governmentSupport || ''} rowNumber={row.rowNumber} field="governmentSupport" className={`max-w-50 truncate ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.totalCapex ? String(row.dto.totalCapex) : ''} rowNumber={row.rowNumber} field="totalCapex" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.totalOpex ? String(row.dto.totalOpex) : ''} rowNumber={row.rowNumber} field="totalOpex" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.npv ? String(row.dto.npv) : ''} rowNumber={row.rowNumber} field="npv" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.irr ? String(row.dto.irr) : ''} rowNumber={row.rowNumber} field="irr" className={`whitespace-nowrap ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.revenueStream || ''} rowNumber={row.rowNumber} field="revenueStream" className={`max-w-50 truncate ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <td className={`whitespace-nowrap ${cellBase}`}>
                    {row.dto.isFeasibilityStudy ? 'Ya' : 'Tidak'}
                  </td>
                  <EditableCell value={row.dto.additionalInfo || ''} rowNumber={row.rowNumber} field="additionalInfo" className={`max-w-50 truncate ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <td className={cellBase}>
                    {row.dto.timelines && row.dto.timelines.length > 0 ? (
                      <ul className="space-y-1 text-xs">
                        {row.dto.timelines.map((t, i) => (
                          <li key={i} className="whitespace-nowrap">
                            <span className="font-medium">{t.timeRange}</span>
                            {t.phaseDescription && (
                              <span className="text-gray-400">
                                {' '}— {t.phaseDescription.slice(0, 40)}{t.phaseDescription.length > 40 ? '…' : ''}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : '-'}
                  </td>
                  <EditableCell value={row.dto.locationImageUrl || ''} rowNumber={row.rowNumber} field="locationImageUrl" className={`max-w-37.5 truncate ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.projectStructureImageUrl || ''} rowNumber={row.rowNumber} field="projectStructureImageUrl" className={`max-w-37.5 truncate ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <EditableCell value={row.dto.projectFileUrl || ''} rowNumber={row.rowNumber} field="projectFileUrl" className={`max-w-37.5 truncate ${cellBase}`} onCommit={onUpdateRow} editingCell={editingCell} setEditingCell={setEditingCell} />
                  <td className={`sticky right-0 z-10 min-w-50 px-4 py-3 align-top ${rowBg} shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]`}>
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

      <div className="mt-3 flex items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Showing {startItem}–{endItem} of {rows.length} projects</span>
          <span>·</span>
          <span>Tampilkan</span>
          <select
            className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>per halaman</span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="hover:underline disabled:opacity-40 disabled:no-underline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="hover:underline disabled:opacity-40 disabled:no-underline"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
