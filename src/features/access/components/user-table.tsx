'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { StatusBadge } from '@/shared/components/status-badge';
import type { User } from '../types';

type BadgeVariant = 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected';

const STATUS_VARIANT_MAP: Record<string, { variant: BadgeVariant; label: string }> = {
  ACTIVE: { variant: 'approved', label: 'Active' },
  PENDING: { variant: 'in-review', label: 'In-review' },
  INACTIVE: { variant: 'draft', label: 'Inactive' },
  REJECTED: { variant: 'rejected', label: 'Rejected' },
};

interface UserTableProps {
  initialUsers: User[];
  totalEntries: number;
}

export function UserTable({ initialUsers, totalEntries }: UserTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = initialUsers.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

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
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-3 py-2.5 text-sm text-black border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">Semua Role</option>
          <option value="ADMIN">Admin</option>
          <option value="OWNER">Project Owner</option>
          <option value="INVESTOR">Investor</option>
          <option value="EXECUTIVE">Executive</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="INACTIVE">Inactive</option>
        </select>
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  Tidak ada data pengguna
                </td>
              </tr>
            ) : (
              paginated.map((user) => {
                const badge = STATUS_VARIANT_MAP[user.status] ?? STATUS_VARIANT_MAP.INACTIVE;
                return (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-primary">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.organization}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600">{user.role}</td>
                    <td className="py-3 px-4">
                      <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="xs">Lihat Detail</Button>
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
          Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}-
          {Math.min(page * perPage, filtered.length)} of {filtered.length} entries
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={page === i + 1 ? 'filled' : 'ghost'}
              size="icon-sm"
              onClick={() => setPage(i + 1)}
              className="text-xs"
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
