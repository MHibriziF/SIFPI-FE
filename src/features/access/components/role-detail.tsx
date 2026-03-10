'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Check, Minus } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { StatusBadge } from '@/shared/components/status-badge';
import { PERMISSION_MODULES } from '../hooks/use-create-role-form';
import type { RoleDetail, RoleUserItem } from '../types';

const ACTIONS = [
  { key: 'READ',   label: 'Lihat (Read)' },
  { key: 'CREATE', label: 'Tambah (Create)' },
  { key: 'UPDATE', label: 'Ubah (Edit)' },
  { key: 'DELETE', label: 'Hapus (Archive)' },
] as const;

const USERS_PER_PAGE = 5;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface RoleDetailViewProps {
  role: RoleDetail;
  initialUsers: RoleUserItem[];
  totalUsers: number;
  canUpdate?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RoleDetailView({ role, initialUsers, totalUsers, canUpdate }: RoleDetailViewProps) {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  // Client-side search on the server-fetched list
  const filteredUsers = initialUsers.filter(
    (u) =>
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages  = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const pagedUsers  = filteredUsers.slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE,
  );

  // Status badge mapping: true → Aktif (green), false → Draft (grey)
  const statusVariant = role.status ? 'approved' : 'draft';
  const statusLabel   = role.status ? 'Aktif'    : 'Draft';

  return (
    <div className="p-6 space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Breadcrumb + title + back link + Edit button                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          {/* Breadcrumb */}
          <p className="text-sm text-gray-500">
            <Link href="/admin/access" className="hover:underline">
              Manajemen Pengguna &amp; Akses
            </Link>
            {' / '}
            <Link href="/admin/access" className="hover:underline">
              Manajemen Role
            </Link>
            {' / '}
            <span className="font-semibold text-primary">{role.name}</span>
          </p>

          <h2 className="text-2xl font-bold text-primary">Manajemen Hak Akses Role</h2>

          {/* Back link */}
          <Link
            href="/admin/access"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <ChevronLeft className="size-4" />
            Lihat semua role terdaftar
          </Link>
        </div>

        {/* Edit button — only rendered when user has UPDATE permission */}
        {canUpdate && (
          <Button asChild variant="outlined">
            <Link href={`/admin/access/role/${role.id}/edit`}>Edit Role Ini</Link>
          </Button>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Role Info Card                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">
          Informasi Role
        </h2>
        <div className="p-6 flex items-start justify-between gap-6">
          <div className="flex flex-col gap-4 flex-1">
            {/* Name + Status row */}
            <div className="flex flex-wrap items-start gap-10">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Role
                </span>
                <span className="text-xl font-semibold text-gray-900">{role.name}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status Role
                </span>
                <StatusBadge variant={statusVariant}>{statusLabel}</StatusBadge>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Deskripsi Role
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">{role.description}</p>
            </div>
          </div>

          {/* Total users */}
          <div className="flex flex-col items-center gap-1 text-center flex-shrink-0">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total users
            </span>
            <span className="text-2xl font-semibold text-gray-900">{totalUsers}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom row: Permissions matrix + Registered users                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex gap-6 items-start flex-wrap xl:flex-nowrap">
        {/* Permissions matrix */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1 min-w-0">
          <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">
            Matriks Kontrol Akses (Permissions)
          </h2>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Modul / Fitur Sistem
                  </th>
                  {ACTIONS.map((a) => (
                    <th
                      key={a.key}
                      className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[90px]"
                    >
                      {a.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MODULES.map((mod) => {
                  const granted = new Set(role.permissions[mod.module] ?? []);
                  return (
                    <tr key={mod.module} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-3">
                        <p className="font-semibold text-gray-900">{mod.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
                      </td>
                      {ACTIONS.map((a) => (
                        <td key={a.key} className="py-3 px-2 text-center align-middle">
                          {granted.has(a.key) ? (
                            <span className="inline-flex items-center justify-center size-6 rounded-md bg-green-100">
                              <Check className="size-4 text-green-600" strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center size-6 rounded-md bg-gray-100">
                              <Minus className="size-3.5 text-gray-400" />
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registered accounts */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full xl:w-72 flex-shrink-0">
          <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">
            Akun Terdaftar
          </h2>
          <div className="p-4 flex flex-col gap-4">
            {/* Search input */}
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />

            {/* Users table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nama User
                  </th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-6 text-gray-400 text-xs">
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                ) : (
                  pagedUsers.map((u) => (
                    <tr key={u.email} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 px-2 text-gray-800 font-medium">{u.nama}</td>
                      <td className="py-2 px-2 text-gray-500 break-all text-xs">{u.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span>
                Showing{' '}
                <span className="text-gray-800">
                  {filteredUsers.length === 0
                    ? 0
                    : (page - 1) * USERS_PER_PAGE + 1}
                  –{Math.min(page * USERS_PER_PAGE, filteredUsers.length)}
                </span>{' '}
                of <span className="text-gray-800">{filteredUsers.length}</span>
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2 py-1 text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
