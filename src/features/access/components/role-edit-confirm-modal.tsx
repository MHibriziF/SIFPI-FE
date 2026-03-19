'use client';

import React from 'react';
import { UserPlus, UserMinus, X } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { RoleInfoRows, PermissionTable } from './role-modal-shared';
import type { PermissionState } from './role-modal-shared';

interface QueuedUserDetail {
  id: string;
  nama: string;
  email: string;
}

interface RoleEditConfirmModalProps {
  isOpen: boolean;
  submitting: boolean;
  // Role info
  name: string;
  status: string;
  description: string;
  // Permissions
  permissions: Record<string, PermissionState>;
  // User changes
  toAddDetails: Map<string, QueuedUserDetail>;
  toRemoveDetails: Map<string, QueuedUserDetail>;
  // Actions
  onConfirm: () => void;
  onCancel: () => void;
}

export function RoleEditConfirmModal({
  isOpen,
  submitting,
  name,
  status,
  description,
  permissions,
  toAddDetails,
  toRemoveDetails,
  onConfirm,
  onCancel,
}: Readonly<RoleEditConfirmModalProps>) {
  if (!isOpen) return null;

  const addList = Array.from(toAddDetails.values());
  const removeList = Array.from(toRemoveDetails.values());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-white">Konfirmasi Perubahan Role</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          <RoleInfoRows name={name} status={status} description={description} />

          <PermissionTable permissions={permissions} />

          {/* Users to add */}
          {addList.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="size-3.5 text-info" />
                <span className="text-info">User yang akan ditambahkan ({addList.length})</span>
              </p>
              <div className="rounded-lg border border-info-light overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-info-light border-b border-info-light">
                      <th className="text-left px-4 py-2 font-semibold text-info">Nama</th>
                      <th className="text-left px-4 py-2 font-semibold text-info">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addList.map((u) => (
                      <tr key={u.email} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-primary">{u.nama}</td>
                        <td className="px-4 py-2.5 text-gray-600">{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users to remove */}
          {removeList.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserMinus className="size-3.5 text-danger" />
                <span className="text-danger">User yang akan dihapus dari role ({removeList.length})</span>
              </p>
              <div className="rounded-lg border border-danger-light overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-danger-light border-b border-danger-light">
                      <th className="text-left px-4 py-2 font-semibold text-danger">Nama</th>
                      <th className="text-left px-4 py-2 font-semibold text-danger">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {removeList.map((u) => (
                      <tr key={u.email} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-primary">{u.nama}</td>
                        <td className="px-4 py-2.5 text-gray-600">{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit trail notice */}
          <p className="text-xs text-gray-400 italic">
            Seluruh perubahan akan dicatat dalam audit trail sistem.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
          <Button type="button" variant="outlined" onClick={onCancel} disabled={submitting}>
            Kembali
          </Button>
          <Button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
