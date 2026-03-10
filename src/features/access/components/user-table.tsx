'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { StatusBadge } from '@/shared/components/status-badge';
import type { AdminUser } from '../types';

type BadgeVariant = 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected';

function deriveStatus(user: AdminUser): { variant: BadgeVariant; label: string; key: string } {
  if (user.role === 'PROJECT_OWNER' && user.project_owner_is_verified === false)
    return { variant: 'in-review', label: 'In Review', key: 'IN_REVIEW' };
  if (user.is_active) return { variant: 'approved', label: 'Active',   key: 'ACTIVE' };
  return               { variant: 'draft',    label: 'Inactive', key: 'INACTIVE' };
}

interface UserTableProps {
  users: AdminUser[];
  totalEntries: number;
  totalPages: number;
  currentPage: number; // 0-based (matches API)
  pageSize: number;
}



export function UserTable({ users, totalEntries, totalPages, currentPage, pageSize }: UserTableProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Local search state — debounced before pushing to URL
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') ?? '');

  // Local page-size input — committed on blur or Enter
  const [localSize, setLocalSize] = useState(String(pageSize));

  // Status filter — client-side only (filters within the current page)
  const [statusFilter, setStatusFilter] = useState('');

  /** Merge `updates` into current URL search params and navigate */
  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v == null || v === '') params.delete(k);
        else params.set(k, v);
      });
      startTransition(() => router.push(`?${params.toString()}`));
    },
    [router, searchParams],
  );

  // Debounce search input → push to URL + reset page
  useEffect(() => {
    const id = setTimeout(() => {
      pushParams({ search: localSearch || null, page: null }); // reset to page 0
    }, 400);
    return () => clearTimeout(id);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply status filter client-side on the current page
  const displayed = statusFilter
    ? users.filter((u) => deriveStatus(u).key === statusFilter)
    : users;

  const from = totalEntries === 0 ? 0 : currentPage * pageSize + 1;
  const to   = Math.min((currentPage + 1) * pageSize, totalEntries);

  // Page window — show at most 5 page buttons centred on currentPage
  const windowSize  = 5;
  const halfWindow  = Math.floor(windowSize / 2);
  const windowStart = Math.max(0, Math.min(currentPage - halfWindow, totalPages - windowSize));
  const windowEnd   = Math.min(totalPages, windowStart + windowSize);
  const pageNumbers = Array.from({ length: windowEnd - windowStart }, (_, i) => windowStart + i);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3">Manajemen Pengguna</h2>
      <div className="p-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari Nama, Email atau Organisasi"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm text-black border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          {/* Role — server-side filter */}
          <select
            value={searchParams.get('role') ?? ''}
            onChange={(e) => pushParams({ role: e.target.value || null, page: null })}
            className="w-44 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_OWNER">Project Owner</option>
            <option value="INVESTOR">Investor</option>
            <option value="EXECUTIVE">Executive</option>
          </select>

          {/* Status — client-side filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Active</option>          <option value="IN_REVIEW">In Review</option>            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Page size */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={200}
              value={localSize}
              onChange={(e) => setLocalSize(e.target.value)}
              onBlur={() => {
                const n = Math.min(200, Math.max(1, parseInt(localSize, 10) || pageSize));
                setLocalSize(String(n));
                pushParams({ size: String(n), page: null });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              }}
              className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-primary text-center outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              title="Ukuran halaman kustom"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">/ hal</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organisasi</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Tidak ada data pengguna
                  </td>
                </tr>
              ) : (
                displayed.map((user) => {
                  const badge = deriveStatus(user);
                  return (
                    <tr key={user.email} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-primary">{user.nama}</td>
                      <td className="py-3 px-4 text-gray-600">{user.organisasi ?? '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-gray-600">{user.role}</td>
                      <td className="py-3 px-4">
                        <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="xs" asChild>
                          <Link href={`/admin/access/users/${encodeURIComponent(user.email)}`}>
                            Lihat Detail
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            Menampilkan {from}–{to} dari {totalEntries} entri
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={currentPage <= 0}
              onClick={() => pushParams({ page: String(currentPage - 1) })}
            >
              <ChevronLeft className="size-4" />
            </Button>

            {windowStart > 0 && (
              <>
                <Button variant="ghost" size="icon-sm" className="text-xs" onClick={() => pushParams({ page: '0' })}>1</Button>
                {windowStart > 1 && <span className="px-1">…</span>}
              </>
            )}

            {pageNumbers.map((p) => (
              <Button
                key={p}
                variant={currentPage === p ? 'filled' : 'ghost'}
                size="icon-sm"
                className="text-xs"
                onClick={() => pushParams({ page: String(p) })}
              >
                {p + 1}
              </Button>
            ))}

            {windowEnd < totalPages && (
              <>
                {windowEnd < totalPages - 1 && <span className="px-1">…</span>}
                <Button variant="ghost" size="icon-sm" className="text-xs" onClick={() => pushParams({ page: String(totalPages - 1) })}>{totalPages}</Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon-sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => pushParams({ page: String(currentPage + 1) })}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
