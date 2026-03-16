'use client';

import React from 'react';
import { Users, X } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { RoleInfoRows, PermissionTable } from './role-modal-shared';
import type { PermissionState } from './role-modal-shared';

interface RoleConfirmModalProps {
  isOpen: boolean;
  submitting: boolean;
  // Role info
  name: string;
  status: string;
  description: string;
  // Permissions
  permissions: Record<string, PermissionState>;
  // Selected users
  selectedEmails: Set<string>;
  selectedUserDetails: Map<string, { nama: string; role: string }>;
  // Actions
  onConfirm: () => void;
  onCancel: () => void;
}

export function RoleConfirmModal({
  isOpen,
  submitting,
  name,
  status,
  description,
  permissions,
  selectedEmails,
  selectedUserDetails,
  onConfirm,
  onCancel,
}: Readonly<RoleConfirmModalProps>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-white">Konfirmasi Pembuatan Role</h2>
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

          {/* Selected users */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="size-3.5" />
              User yang akan diassign ({selectedEmails.size})
            </p>
            {selectedEmails.size === 0 ? (
              <p className="text-sm text-gray-400 italic px-1">Tidak ada user yang dipilih</p>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2 font-semibold text-gray-500">Nama</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-500">Email</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-500">Role Saat Ini</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(selectedEmails).map(email => {
                      const detail = selectedUserDetails.get(email);
                      return (
                        <tr key={email} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-2.5 font-medium text-primary">{detail?.nama ?? '–'}</td>
                          <td className="px-4 py-2.5 text-gray-600">{email}</td>
                          <td className="px-4 py-2.5 text-gray-600">{detail?.role ?? '–'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
