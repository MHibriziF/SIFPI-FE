'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Toast } from '@/shared/components/toast';
import { useCreateRoleForm } from '../hooks/use-create-role-form';
import { RoleConfirmModal } from './role-confirm-modal';
import { RoleInfoSection, PermissionMatrixSection, UserFilterSection, UserPagination } from './role-form-sections';

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
        <RoleInfoSection
          name={name} setName={setName}
          status={status} setStatus={setStatus}
          description={description} setDescription={setDescription}
          errors={errors}
        />
      </div>

      {/* Section: Permission Matrix */}
      <div ref={permissionsSectionRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">Matriks Kontrol Akses (Permissions)</h2>
        <PermissionMatrixSection
          permissions={permissions}
          togglePermission={togglePermission}
          permissionsError={errors.permissions}
        />
      </div>

      {/* Section: Akun Terdaftar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="bg-primary text-white text-lg font-semibold px-6 py-3 text-center">Akun Terdaftar</h2>
        <div className="p-6">

        {/* Filters */}
        <UserFilterSection
          userSearch={userSearch} setUserSearch={setUserSearch}
          userRoleFilter={userRoleFilter} setUserRoleFilter={setUserRoleFilter}
          className="mb-4"
        />

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
              {usersLoading && (
                Array.from({ length: pageSize }, (_, i) => `skeleton-create-${i}`).map((skeletonId) => (
                  <tr key={skeletonId} className="border-b border-gray-100">
                    <td className="py-3 px-4"><div className="size-4 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                  </tr>
                ))
              )}
              {!usersLoading && users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Tidak ada pengguna ditemukan
                  </td>
                </tr>
              )}
              {!usersLoading && users.length > 0 && (
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
        <UserPagination
          usersTotalElements={usersTotalElements}
          startItem={startItem}
          endItem={endItem}
          pageSize={pageSize}
          setPageSize={setPageSize}
          userPage={userPage}
          usersTotalPages={usersTotalPages}
          usersLoading={usersLoading}
          setUserPage={setUserPage}
        />
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
