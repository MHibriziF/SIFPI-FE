'use client';

import React from 'react';
import { ShieldCheck, UserPlus, UserMinus, X, Check } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { PERMISSION_MODULES, ROLE_STATUS_OPTIONS, type PermissionState } from '../hooks/use-edit-role-form';

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

const ACTION_LABELS: Record<string, string> = {
  canAccess: 'Akses',
  canCreate: 'Tambah',
  canUpdate: 'Ubah',
  canDelete: 'Hapus',
};

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

  const statusLabel = ROLE_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
  const activeModules = PERMISSION_MODULES.filter((m) => permissions[m.module]?.canAccess);

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
                <span className={`font-medium ${status === '1' ? 'text-success' : 'text-gray-500'}`}>
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
                    {Object.keys(ACTION_LABELS).map((k) => (
                      <th key={k} className="text-center px-3 py-2 font-semibold text-gray-500">
                        {ACTION_LABELS[k]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeModules.map((mod) => {
                    const perm = permissions[mod.module];
                    return (
                      <tr key={mod.module} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-2.5 font-medium text-primary">{mod.label}</td>
                        {(['canAccess', 'canCreate', 'canUpdate', 'canDelete'] as const).map((k) => (
                          <td key={k} className="text-center px-3 py-2.5">
                            {perm[k] ? (
                              <Check className="size-3.5 text-success mx-auto" />
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
