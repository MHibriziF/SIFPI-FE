'use client';

import React from 'react';
import { ShieldCheck, Users, X, Check } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { PERMISSION_MODULES, ROLE_STATUS_OPTIONS, type PermissionState } from '../hooks/use-create-role-form';

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

const ACTION_LABELS: Record<string, string> = {
  canAccess: 'Akses',
  canCreate: 'Tambah',
  canUpdate: 'Ubah',
  canDelete: 'Hapus',
};

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

  const statusLabel = ROLE_STATUS_OPTIONS.find(o => o.value === status)?.label ?? status;
  const activeModules = PERMISSION_MODULES.filter(m => permissions[m.module]?.canAccess);

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

          {/* Role info */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Informasi Role</p>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 text-sm">
              <div className="flex px-4 py-2.5 gap-3">
                <span className="text-gray-500 w-24 shrink-0">Nama</span>
                <span className="font-medium text-primary">{name}</span>
              </div>
              <div className="flex px-4 py-2.5 gap-3">
                <span className="text-gray-500 w-24 shrink-0">Status</span>
                <span className={`font-medium ${status === '1' ? 'text-green-600' : 'text-gray-500'}`}>
                  {statusLabel}
                </span>
              </div>
              <div className="flex px-4 py-2.5 gap-3">
                <span className="text-gray-500 w-24 shrink-0">Deskripsi</span>
                <span className="text-gray-700">{description}</span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              Permissions ({activeModules.length} modul)
            </p>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-semibold text-gray-500">Modul</th>
                    {Object.keys(ACTION_LABELS).map(k => (
                      <th key={k} className="text-center px-3 py-2 font-semibold text-gray-500">
                        {ACTION_LABELS[k]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeModules.map(mod => {
                    const perm = permissions[mod.module];
                    return (
                      <tr key={mod.module} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-primary">{mod.label}</td>
                        {(['canAccess', 'canCreate', 'canUpdate', 'canDelete'] as const).map(k => (
                          <td key={k} className="text-center px-3 py-2.5">
                            {perm[k] ? (
                              <Check className="size-3.5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">–</span>
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
