'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRole } from '../services';
import { ApiError } from '@/shared/types/api';
import { setFlashToast } from '@/shared/hooks/use-flash-toast';
import { showToast } from '@/shared/components/toast';
import type { RoleUser } from '../types';

export interface PermissionState {
  canAccess: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export const PERMISSION_MODULES = [
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

export const ROLE_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Draft' },
];

const USERS_PER_PAGE = 5;

function buildInitialPermissions(): Record<string, PermissionState> {
  return Object.fromEntries(
    PERMISSION_MODULES.map(m => [
      m.module,
      { canAccess: false, canCreate: false, canUpdate: false, canDelete: false },
    ])
  );
}

export function useCreateRoleForm(availableUsers: RoleUser[]) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [permissions, setPermissions] =
    useState<Record<string, PermissionState>>(buildInitialPermissions());

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [userPage, setUserPage] = useState(1);

  function togglePermission(module: string, field: keyof PermissionState) {
    setPermissions(prev => {
      const current = prev[module];
      const updated = { ...current, [field]: !current[field] };
      if (field === 'canAccess' && !updated.canAccess) {
        updated.canCreate = false;
        updated.canUpdate = false;
        updated.canDelete = false;
      }
      if (field !== 'canAccess' && updated[field]) {
        updated.canAccess = true;
      }
      return { ...prev, [module]: updated };
    });
  }

  function toggleUserSelection(userId: string) {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  const filteredUsers = availableUsers.filter(u => {
    const matchesSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = !userRoleFilter || u.currentRole === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE
  );

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

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

  return {
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
    usersPerPage: USERS_PER_PAGE,

    // Actions
    handleSubmit,
    goBack: () => router.push('/admin/access'),
  };
}
