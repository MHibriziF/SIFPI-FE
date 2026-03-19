import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import type { PermissionState } from '../hooks/use-create-role-form';
import { PERMISSION_MODULES, ROLE_STATUS_OPTIONS } from '../hooks/use-create-role-form';

export type { PermissionState };
export { PERMISSION_MODULES, ROLE_STATUS_OPTIONS };

const ACTION_LABELS: Record<string, string> = {
  canAccess: 'Akses',
  canCreate: 'Tambah',
  canUpdate: 'Ubah',
  canDelete: 'Hapus',
};

// ─── Role Info Rows ───────────────────────────────────────────────────────────

interface RoleInfoRowsProps {
  name: string;
  status: string;
  description: string;
}

export function RoleInfoRows({ name, status, description }: Readonly<RoleInfoRowsProps>) {
  const statusLabel = ROLE_STATUS_OPTIONS.find(o => o.value === status)?.label ?? status;
  return (
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
  );
}

// ─── Permission Table ─────────────────────────────────────────────────────────

interface PermissionTableProps {
  permissions: Record<string, PermissionState>;
}

export function PermissionTable({ permissions }: Readonly<PermissionTableProps>) {
  const activeModules = PERMISSION_MODULES.filter(m => permissions[m.module]?.canAccess);
  return (
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
  );
}
