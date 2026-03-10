'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, ChevronLeft as PrevIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { TextInput, Textarea, Select } from '@/shared/components/form-fields';
import { Toast } from '@/shared/components/toast';
import {
  useCreateRoleForm,
  PERMISSION_MODULES,
  ROLE_STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from '../hooks/use-create-role-form';
import { RoleConfirmModal } from './role-confirm-modal';

export function RoleCreateForm() {
  const {
    // Form fields
    name,
    setName,
    status,
    setStatus,
    description,
    setDescription,
    errors,
    submitting,

    // Permissions
    permissions,
    togglePermission,

    // User assignment
    userSearch,
    setUserSearch,
    userRoleFilter,
    setUserRoleFilter,
    selectedEmails,
    selectedUserDetails,
    toggleEmailSelection,
    userPage,
    setUserPage,
    pageSize,
    setPageSize,
    users,
    usersLoading,
    usersTotalPages,
    usersTotalElements,

    // Confirmation modal
    confirmModalOpen,
    closeConfirmModal,
    confirmSubmit,

    // Actions
    handleSubmit,
    goBack,
  } = useCreateRoleForm();

  const infoSectionRef = useRef<HTMLDivElement>(null);
  const permissionsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    if (errors.name || errors.status || errors.description) {
      infoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (errors.permissions) {
      permissionsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [errors]);

  const startItem = usersTotalElements === 0 ? 0 : (userPage - 1) * pageSize + 1;
  const endItem = Math.min(userPage * pageSize, usersTotalElements);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back navigation */}
      <div>
        <Link
          href="/admin/access"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <ChevronLeft className="size-4" />
          Lihat semua role terdaftar
        </Link>
      </div>

      {/* Section: Informasi Role */}
      <div ref={infoSectionRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">Informasi Role</h2>
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
      </div>

      {/* Section: Permission Matrix */}
      <div ref={permissionsSectionRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">Matriks Kontrol Akses (Permissions)</h2>
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
                      />
                    </td>
                    <td className="text-center py-3 px-4">
                      <input
                        type="checkbox"
                        checked={perm.canUpdate}
                        onChange={() => togglePermission(mod.module, 'canUpdate')}
                        className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="text-center py-3 px-4">
                      <input
                        type="checkbox"
                        checked={perm.canDelete}
                        onChange={() => togglePermission(mod.module, 'canDelete')}
                        className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {errors.permissions && (
          <p className="mt-3 text-xs text-danger">{errors.permissions}</p>
        )}
      </div>
      </div>

      {/* Section: Akun Terdaftar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">Akun Terdaftar</h2>
        <div className="p-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
            className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_OWNER">Project Owner</option>
            <option value="INVESTOR">Investor</option>
            <option value="EXECUTIVE">Executive</option>
          </select>
        </div>

        {/* Users table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-10 py-3 px-4" />
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role Saat Ini
                </th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 px-4"><div className="size-4 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Tidak ada pengguna ditemukan
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.email} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(user.email)}
                        onChange={() => toggleEmailSelection(user)}
                        className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-primary">{user.nama}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600">{user.role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      </div>
      </div>

      {/* Warning notice */}
      <Toast
        variant="info"
        title="Perhatian!"
        description="Pastikan untuk memberikan akses yang tepat sesuai dengan kebutuhan pengguna. Hindari memberikan akses berlebihan yang tidak diperlukan."
      />

      {/* Submit error */}
      {errors.submit && (
        <div className="bg-danger-light border border-danger/30 rounded-xl p-4">
          <p className="text-sm text-danger">{errors.submit}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
        <Button type="button" variant="outlined" onClick={goBack}>
          Batal/Buang Perubahan
        </Button>
      </div>

      <RoleConfirmModal
        isOpen={confirmModalOpen}
        submitting={submitting}
        name={name}
        status={status}
        description={description}
        permissions={permissions}
        selectedEmails={selectedEmails}
        selectedUserDetails={selectedUserDetails}
        onConfirm={confirmSubmit}
        onCancel={closeConfirmModal}
      />
    </form>
  );
}
