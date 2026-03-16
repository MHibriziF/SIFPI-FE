'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/button';
import type { Role } from '../types';

interface RoleTableProps {
  roles: Role[];
  canCreate?: boolean;
}

export function RoleTable({ roles, canCreate }: RoleTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between bg-primary px-6 py-3">
        <h2 className="text-white text-lg font-semibold">Manajemen Akses</h2>
        {canCreate && (
          <Button asChild size="sm">
            <Link href="/admin/access/role/create">
              <Plus className="size-4" />
              Tambah Role
            </Link>
          </Button>
        )}
      </div>

      <div className="p-6">
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Role</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah Pengguna</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  Tidak ada data role
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-medium text-primary">{role.name}</td>
                  <td className="py-3 px-4 text-gray-600">{role.description}</td>
                  <td className="py-3 px-4 text-gray-600">{role.userCount}</td>
                  <td className="py-3 px-4">
                    <Button size="xs" asChild>
                      <Link href={`/admin/access/role/${role.id}`}>Lihat Detail</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
