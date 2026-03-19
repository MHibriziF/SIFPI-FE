'use client';

import { Search } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { TextInput, Textarea, Select } from '@/shared/components/form-fields';
import { ChevronLeft as PrevIcon, ChevronRight } from 'lucide-react';
import {
  PERMISSION_MODULES,
  ROLE_STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from '../hooks/use-create-role-form';
import type { PermissionState } from '../hooks/use-create-role-form';

interface RoleInfoSectionProps {
  name: string;
  setName: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  errors: { name?: string; status?: string; description?: string };
}

export function RoleInfoSection({
  name,
  setName,
  status,
  setStatus,
  description,
  setDescription,
  errors,
}: Readonly<RoleInfoSectionProps>) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Nama Role"
          required
          id="role-name"
          placeholder="Contoh: Finance Manager"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          hint="Berikan nama role yang deskriptif dan tidak ambigu."
        />
        <Select
          label="Status Role"
          required
          id="role-status"
          options={ROLE_STATUS_OPTIONS}
          value={status}
          onValueChange={setStatus}
          error={errors.status}
          hint="Hanya role aktif yang memiliki akses ke semua modul/resource alur ini."
        />
      </div>
      <div className="mt-4">
        <Textarea
          label="Deskripsi Role"
          id="role-description"
          required
          placeholder="Deskripsi role menjelaskan apa yang dilakukan oleh role ini"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          hint="Deskripsi role menjelaskan apa yang dilakukan oleh role ini."
        />
      </div>
    </div>
  );
}

interface PermissionMatrixSectionProps {
  permissions: Record<string, PermissionState>;
  togglePermission: (module: string, key: keyof PermissionState) => void;
  permissionsError?: string;
  /** When true, canCreate/canUpdate/canDelete checkboxes are disabled unless canAccess is checked */
  disableSubPermissions?: boolean;
}

export function PermissionMatrixSection({
  permissions,
  togglePermission,
  permissionsError,
  disableSubPermissions = false,
}: Readonly<PermissionMatrixSectionProps>) {
  return (
    <div className="p-6">
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Modul / Fitur Sistem
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dapat Akses
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tambah (Create)
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ubah (Edit)
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hapus (Delete)
              </th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MODULES.map((mod) => {
              const perm = permissions[mod.module];
              return (
                <tr key={mod.module} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="font-medium text-primary">{mod.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{mod.description}</div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <input
                      type="checkbox"
                      checked={perm.canAccess}
                      onChange={() => togglePermission(mod.module, 'canAccess')}
                      className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="text-center py-3 px-4">
                    <input
                      type="checkbox"
                      checked={perm.canCreate}
                      onChange={() => togglePermission(mod.module, 'canCreate')}
                      className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                      disabled={disableSubPermissions && !perm.canAccess}
                    />
                  </td>
                  <td className="text-center py-3 px-4">
                    <input
                      type="checkbox"
                      checked={perm.canUpdate}
                      onChange={() => togglePermission(mod.module, 'canUpdate')}
                      className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                      disabled={disableSubPermissions && !perm.canAccess}
                    />
                  </td>
                  <td className="text-center py-3 px-4">
                    <input
                      type="checkbox"
                      checked={perm.canDelete}
                      onChange={() => togglePermission(mod.module, 'canDelete')}
                      className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                      disabled={disableSubPermissions && !perm.canAccess}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {permissionsError && (
        <p className="mt-3 text-xs text-danger">{permissionsError}</p>
      )}
    </div>
  );
}

interface UserFilterSectionProps {
  userSearch: string;
  setUserSearch: (v: string) => void;
  userRoleFilter: string;
  setUserRoleFilter: (v: string) => void;
  className?: string;
}

export function UserFilterSection({
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  className = '',
}: Readonly<UserFilterSectionProps>) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atau email"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 text-sm text-black border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <select
        value={userRoleFilter}
        onChange={(e) => setUserRoleFilter(e.target.value)}
        className="w-44 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        <option value="">Semua Role</option>
        <option value="ADMIN">Admin</option>
        <option value="PROJECT_OWNER">Project Owner</option>
        <option value="INVESTOR">Investor</option>
        <option value="EXECUTIVE">Executive</option>
      </select>
    </div>
  );
}

interface UserPaginationProps {
  usersTotalElements: number;
  startItem: number;
  endItem: number;
  pageSize: number;
  setPageSize: (v: number) => void;
  userPage: number;
  usersTotalPages: number;
  usersLoading: boolean;
  setUserPage: (v: number) => void;
}

export function UserPagination({
  usersTotalElements,
  startItem,
  endItem,
  pageSize,
  setPageSize,
  userPage,
  usersTotalPages,
  usersLoading,
  setUserPage,
}: Readonly<UserPaginationProps>) {
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <span>
          {usersTotalElements === 0
            ? 'Tidak ada data'
            : `Showing ${startItem}-${endItem} of ${usersTotalElements} pengguna`}
        </span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n} / halaman</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={userPage <= 1 || usersLoading}
          onClick={() => setUserPage(userPage - 1)}
        >
          <PrevIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={userPage >= usersTotalPages || usersLoading}
          onClick={() => setUserPage(userPage + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
