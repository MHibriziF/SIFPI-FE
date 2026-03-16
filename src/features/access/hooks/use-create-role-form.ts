'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createRole, getUsers } from '../services';
import { ApiError } from '@/shared/types/api';
import { showToast } from '@/shared/components/toast';
import type { UserDTO } from '../types';

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

function buildInitialPermissions(): Record<string, PermissionState> {
  return Object.fromEntries(
    PERMISSION_MODULES.map(m => [
      m.module,
      { canAccess: false, canCreate: false, canUpdate: false, canDelete: false },
    ])
  );
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function useCreateRoleForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [permissions, setPermissions] =
    useState<Record<string, PermissionState>>(buildInitialPermissions());

  // User search/filter state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Users fetched from BE
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalElements, setUsersTotalElements] = useState(0);

  // Selected emails + display info (persisted across pages)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectedUserDetails, setSelectedUserDetails] = useState<
    Map<string, { nama: string; role: string }>
  >(new Map());

  // Confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(userSearch), 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Reset to page 1 when filter/search/pageSize changes
  useEffect(() => {
    setUserPage(1);
  }, [debouncedSearch, userRoleFilter, pageSize]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await getUsers({
        search: debouncedSearch || undefined,
        role: userRoleFilter || undefined,
        page: userPage - 1, // Spring Pageable is 0-indexed
        size: pageSize,
      });
      setUsers(res.data.content);
      setUsersTotalPages(res.data.totalPages);
      setUsersTotalElements(res.data.totalElements);
    } catch {
      setUsers([]);
      setUsersTotalPages(1);
      setUsersTotalElements(0);
    } finally {
      setUsersLoading(false);
    }
  }, [debouncedSearch, userRoleFilter, userPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  function toggleEmailSelection(user: UserDTO) {
    const { email, nama, role } = user;
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
        setSelectedUserDetails(d => {
          const m = new Map(d);
          m.delete(email);
          return m;
        });
      } else {
        next.add(email);
        setSelectedUserDetails(d => new Map(d).set(email, { nama, role }));
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nama role wajib diisi';
    if (!status) newErrors.status = 'Status role wajib dipilih';
    if (!description.trim()) newErrors.description = 'Deskripsi role wajib diisi';
    const hasAnyPermission = Object.values(permissions).some(p => p.canAccess);
    if (!hasAnyPermission) newErrors.permissions = 'Minimal satu modul akses harus dipilih';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setConfirmModalOpen(true);
  }

  async function confirmSubmit() {
    setConfirmModalOpen(false);
    setSubmitting(true);

    try {
      const permPayload = Object.entries(permissions)
        .filter(([, p]) => p.canAccess)
        .map(([resource, p]) => {
          const actions: string[] = ['READ'];
          if (p.canCreate) actions.push('CREATE');
          if (p.canUpdate) actions.push('UPDATE');
          if (p.canDelete) actions.push('DELETE');
          return { resource, actions };
        });

      await createRole({
        name: name.trim(),
        description: description.trim(),
        status: status === '1',
        permissions: permPayload,
        userEmails: Array.from(selectedEmails),
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
    closeConfirmModal: () => setConfirmModalOpen(false),
    confirmSubmit,

    // Actions
    handleSubmit,
    goBack: () => router.push('/admin/access'),
  };
}
