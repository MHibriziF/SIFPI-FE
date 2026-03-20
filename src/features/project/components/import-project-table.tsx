'use client';

import type { RowView } from '@/features/project/types/import-project';
import { formatFundingDisplay } from '@/features/project/utils/csv';

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
}

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
}: ImportProjectTableProps) {
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
                      onChange={() => onToggleRow(row.rowNumber)}
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
                    {row.dto.isFeasibilityStudy ? 'Ya' : 'Tidak'}
                  </td>
                  <td className={`max-w-[200px] truncate px-4 py-3 align-top ${textColor}`} title={row.dto.additionalInfo ?? ''}>
                    {row.dto.additionalInfo || '-'}
                  </td>
                  <td className={`px-4 py-3 align-top ${textColor}`}>
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
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
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
