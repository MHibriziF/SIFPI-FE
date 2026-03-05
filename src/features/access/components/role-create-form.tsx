'use client';

<<<<<<< HEAD
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, ChevronLeft as PrevIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { TextInput, Textarea, Select } from '@/shared/components/form-fields';
import type { RoleUser } from '../types';
import { Toast } from '@/shared/components/toast';
import {
  useCreateRoleForm,
  PERMISSION_MODULES,
  ROLE_STATUS_OPTIONS,
} from '../hooks/use-create-role-form';
=======
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertTriangle, Search, ChevronLeft as PrevIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { TextInput, Textarea, Select } from '@/shared/components/form-fields';
import { createRole } from '../services';
import { ApiError } from '@/shared/types/api';
import { showToast } from '@/shared/components/toast';
import type { RoleUser } from '../types';
import { Toast } from '@/shared/components/toast';

const ROLE_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Draft' },
];

const PERMISSION_MODULES = [
  {
    module: 'PROJECT',
    label: 'Manajemen Proyek',
    description: 'Mengelola semua informasi proyek yang tersedia di platform.',
  },
  {
    module: 'VERIFICATION',
    label: 'Verifikasi Proyek',
    description: 'Melakukan proses verifikasi proyek.',
  },
  {
    module: 'NEWS',
    label: 'Publikasi Berita & Newsletter',
    description: 'Mengelola artikel berita dan newsletter.',
  },
  {
    module: 'USER',
    label: 'User and Role Management',
    description: 'Mengelola akun pengguna dan hak akses role.',
  },
  {
    module: 'INQUIRY',
    label: 'Inquiry Management',
    description: 'Mengelola inquiry yang masuk.',
  },
];

interface PermissionState {
  canAccess: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}
>>>>>>> 5dd761e (feat: implement access and create role page)

interface RoleCreateFormProps {
  availableUsers: RoleUser[];
}

export function RoleCreateForm({ availableUsers }: RoleCreateFormProps) {
<<<<<<< HEAD
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
    selectedUserIds,
    toggleUserSelection,
    userPage,
    setUserPage,
    filteredUsers,
    paginatedUsers,
    totalUserPages,
    usersPerPage,

    // Actions
    handleSubmit,
    goBack,
  } = useCreateRoleForm(availableUsers);
=======
  const router = useRouter();

  // Form fields
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Permissions matrix
  const [permissions, setPermissions] = useState<Record<string, PermissionState>>(
    Object.fromEntries(
      PERMISSION_MODULES.map((m) => [
        m.module,
        { canAccess: false, canCreate: false, canUpdate: false, canDelete: false },
      ])
    )
  );

  // User assignment
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 5;

  function togglePermission(module: string, field: keyof PermissionState) {
    setPermissions((prev) => {
      const current = prev[module];
      const updated = { ...current, [field]: !current[field] };
      // If toggling off canAccess, disable all others
      if (field === 'canAccess' && !updated.canAccess) {
        updated.canCreate = false;
        updated.canUpdate = false;
        updated.canDelete = false;
      }
      // If toggling on any sub-permission, auto-enable canAccess
      if (field !== 'canAccess' && updated[field]) {
        updated.canAccess = true;
      }
      return { ...prev, [module]: updated };
    });
  }

  function toggleUserSelection(userId: string) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  const filteredUsers = availableUsers.filter((u) => {
    const matchesSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = !userRoleFilter || u.currentRole === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * usersPerPage,
    userPage * usersPerPage
  );

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nama role wajib diisi';
    if (!status) newErrors.status = 'Status role wajib dipilih';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const permPayload = Object.entries(permissions)
        .filter(([, p]) => p.canAccess)
        .map(([resource, p]) => {
          const actions: string[] = ['read'];
          if (p.canCreate) actions.push('create');
          if (p.canUpdate) actions.push('update');
          if (p.canDelete) actions.push('delete');
          return { resource, actions };
        });

      await createRole({
        name: name.trim(),
        description: description.trim(),
        status: Number(status),
        permissions: permPayload,
      });

      showToast('success', 'Role berhasil dibuat', `Role "${name}" telah berhasil dibuat.`);
      router.push('/admin/access');
    } catch (err) {
      if (err instanceof ApiError) {
        showToast('danger', 'Gagal membuat role', err.message);
      } else {
        showToast('danger', 'Gagal membuat role', 'Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setSubmitting(false);
    }
  }
>>>>>>> 5dd761e (feat: implement access and create role page)

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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            placeholder="Deskripsi role menjelaskan apa yang dilakukan oleh role ini"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            hint="Deskripsi role menjelaskan apa yang dilakukan oleh role ini."
          />
        </div>
        </div>
      </div>

      {/* Section: Permission Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
              onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
              className="w-full pl-10 pr-3 py-2.5 text-sm text-black border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <select
            value={userRoleFilter}
            onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
            className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Project Owner</option>
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
                  Nama User/Nama
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
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Tidak ada pengguna ditemukan
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="size-4 rounded border-gray-300 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-primary">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600">{user.currentRole}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            Showing {filteredUsers.length === 0 ? 0 : (userPage - 1) * usersPerPage + 1}-
            {Math.min(userPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} people
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={userPage <= 1}
              onClick={() => setUserPage(userPage - 1)}
            >
              <PrevIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={userPage >= totalUserPages}
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
<<<<<<< HEAD
        <Button type="button" variant="outlined" onClick={goBack}>
=======
        <Button type="button" variant="outlined" onClick={() => router.push('/admin/access')}>
>>>>>>> 5dd761e (feat: implement access and create role page)
          Batal/Buang Perubahan
        </Button>
      </div>
    </form>
  );
}
