'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, ChevronLeft as PrevIcon, ChevronRight, Info, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { TextInput, Textarea, Select } from '@/shared/components/form-fields';
import type { RoleDetail, RoleUserItem } from '../types';
import {
  useEditRoleForm,
  PERMISSION_MODULES,
  ROLE_STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from '../hooks/use-edit-role-form';
import { RoleEditConfirmModal } from './role-edit-confirm-modal';

interface RoleEditFormProps {
  role: RoleDetail;
  initialRoleUsers: RoleUserItem[];
  totalUsers: number;
}

export function RoleEditForm({ role, initialRoleUsers, totalUsers }: Readonly<RoleEditFormProps>) {
  const {
    name, setName,
    status, setStatus,
    description, setDescription,
    errors, submitting,
    permissions, togglePermission,
    userSearch, setUserSearch,
    userRoleFilter, setUserRoleFilter,
    userPage, setUserPage,
    pageSize, setPageSize,
    users, usersLoading,
    usersTotalPages, usersTotalElements,
    startItem, endItem,
    isUserChecked, toggleUserSelection,
    initialAssignedEmails,
    toAddDetails, toRemoveDetails,
    resetUserSelections,
    confirmModalOpen, closeConfirmModal, confirmSubmit,
    handleSubmit, goBack,
  } = useEditRoleForm(role, initialRoleUsers);

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

  const addCount = toAddDetails.size;
  const removeCount = toRemoveDetails.size;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back navigation */}
      <div>
        <Link
          href={`/admin/access/role/${role.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <ChevronLeft className="size-4" />
          Lihat detail role
        </Link>
      </div>

      {/* ── Section: Informasi Role ──────────────────────────────────────── */}
      <div ref={infoSectionRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">
          Informasi Role
        </h2>
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

      {/* ── Section: Permission Matrix ───────────────────────────────────── */}
      <div ref={permissionsSectionRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">
          Matriks Kontrol Akses (Permissions)
        </h2>
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
                          disabled={!perm.canAccess}
                        />
                      </td>
                      <td className="text-center py-3 px-4">
                        <input
                          type="checkbox"
                          checked={perm.canUpdate}
                          onChange={() => togglePermission(mod.module, 'canUpdate')}
                          className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                          disabled={!perm.canAccess}
                        />
                      </td>
                      <td className="text-center py-3 px-4">
                        <input
                          type="checkbox"
                          checked={perm.canDelete}
                          onChange={() => togglePermission(mod.module, 'canDelete')}
                          className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                          disabled={!perm.canAccess}
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

      {/* ── Section: Akun Terdaftar ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">
          Akun Terdaftar
        </h2>
        <div className="p-6 space-y-4">

          {/* Summary badge */}
          <p className="text-sm text-gray-500">
            Role ini saat ini memiliki{' '}
            <span className="font-semibold text-primary">{totalUsers}</span> pengguna terdaftar.
            Centang untuk menambahkan atau hapus centang untuk melepas pengguna dari role ini.
          </p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
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

          {/* Table + side panel */}
          <div className="flex gap-4 items-start">

            {/* Users table */}
            <div className="flex-1 min-w-0">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="w-10 py-3 px-4" />
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Nama User
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
                    {usersLoading && (
                      Array.from({ length: pageSize > 5 ? 5 : pageSize }, (_, i) => `skeleton-edit-${i}`).map((skeletonId) => (
                        <tr key={skeletonId} className="border-b border-gray-100">
                          <td className="py-3 px-4"><div className="size-4 bg-gray-200 rounded animate-pulse" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-44 bg-gray-200 rounded animate-pulse" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    )}
                    {!usersLoading && users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                          Tidak ada pengguna ditemukan
                        </td>
                      </tr>
                    )}
                    {!usersLoading && users.length > 0 && (
                      users.map((user) => {
                        const checked = isUserChecked(user);
                        const isCurrentMember = initialAssignedEmails.has(user.email);
                        return (
                          <tr
                            key={user.email}
                            className={`border-b border-gray-100 hover:bg-gray-50/60 cursor-pointer transition-colors ${
                              isCurrentMember ? 'bg-info-light/30' : ''
                            }`}
                            onClick={() => toggleUserSelection(user)}
                          >
                            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleUserSelection(user)}
                                className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 font-medium text-primary">
                              {user.nama}
                              {isCurrentMember && (
                                <span className="ml-2 text-xs font-normal text-info">(anggota)</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                            <td className="py-3 px-4 text-gray-600">{user.role}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>
                    {usersTotalElements === 0
                      ? 'Tidak ada data'
                      : `Showing ${startItem}–${endItem} of ${usersTotalElements} pengguna`}
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

            {/* Side panel: add/remove summary */}
            <div className="w-64 shrink-0 flex flex-col gap-4 pt-1">

              {/* Add count */}
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-full bg-info flex items-center justify-center shrink-0">
                  <UserPlus className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-info leading-none">{addCount}</p>
                  <p className="text-xs text-gray-600 mt-1 leading-snug">
                    Pengguna terpilih siap ditambahkan ke role <span className="font-semibold">{name || 'ini'}</span>
                  </p>
                </div>
              </div>

              {/* Remove count */}
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-full bg-danger flex items-center justify-center shrink-0">
                  <UserMinus className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-danger leading-none">{removeCount}</p>
                  <p className="text-xs text-gray-600 mt-1 leading-snug">
                    Pengguna terpilih akan dihapus dari role <span className="font-semibold">{name || 'ini'}</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outlined"
                  className="flex-1"
                  disabled={addCount === 0 && removeCount === 0}
                  onClick={resetUserSelections}
                >
                  Batalkan
                </Button>
              </div>

              {/* Legend */}
              <div className="rounded-lg border border-gray-200 p-3 space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2.5 rounded-sm bg-info-light border border-info/30" />
                  <span>Pengguna anggota role ini</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2.5 rounded-sm bg-white border border-gray-300" />
                  <span>Pengguna lainnya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Audit trail notice ──────────────────────────────────────────── */}
      <div className="flex gap-3 items-start bg-info-light border border-info/30 rounded-xl p-4">
        <Info className="size-5 text-info shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-info">Penting</p>
          <p className="text-sm text-info/90 leading-relaxed">
            Perubahan pada hak akses role ini akan berdampak langsung pada{' '}
            <strong>{totalUsers}</strong> user terkait. Seluruh perubahan akan dicatat dalam{' '}
            <strong>Sistem Logging Aktivitas</strong> sebagai bagian dari audit trail keamanan sistem.
            Pastikan pemberian hak akses sudah sesuai dengan kebijakan tata kelola data Kemenkoinfra.
          </p>
        </div>
      </div>

      {/* ── Action buttons ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
        <Button type="button" variant="outlined" onClick={goBack}>
          Kembali (Buang Perubahan)
        </Button>
      </div>

      {/* ── Confirmation modal ──────────────────────────────────────────── */}
      <RoleEditConfirmModal
        isOpen={confirmModalOpen}
        submitting={submitting}
        name={name}
        status={status}
        description={description}
        permissions={permissions}
        toAddDetails={toAddDetails}
        toRemoveDetails={toRemoveDetails}
        onConfirm={confirmSubmit}
        onCancel={closeConfirmModal}
      />
    </form>
  );
}
