'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateRole, getUsers, getUserByEmail } from '../services';
import { ApiError } from '@/shared/types/api';
import { showToast } from '@/shared/components/toast';
import {
  PERMISSION_MODULES,
  ROLE_STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
  type PermissionState,
} from './use-create-role-form';
import type { RoleDetail, RoleUserItem, UserDTO } from '../types';

/** Convert API permissions map → internal PermissionState map */
function parsePermissions(apiPerms: Record<string, string[]>): Record<string, PermissionState> {
  return Object.fromEntries(
    PERMISSION_MODULES.map((m) => {
      const actions = apiPerms[m.module] ?? [];
      return [
        m.module,
        {
          canAccess: actions.includes('READ'),
          canCreate: actions.includes('CREATE'),
          canUpdate: actions.includes('UPDATE'),
          canDelete: actions.includes('DELETE'),
        },
      ];
    }),
  );
}

/** Details stored for each user queued for add/remove */
interface QueuedUserDetail {
  id: string;
  nama: string;
  email: string;
}

export function useEditRoleForm(
  initialRole: RoleDetail,
  initialRoleUsers: RoleUserItem[],
) {
  const router = useRouter();

  // ── Form fields ────────────────────────────────────────────────────────────
  const [name, setName] = useState(initialRole.name);
  const [status, setStatus] = useState(initialRole.status ? '1' : '0');
  const [description, setDescription] = useState(initialRole.description);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Permissions ────────────────────────────────────────────────────────────
  const [permissions, setPermissions] = useState<Record<string, PermissionState>>(
    parsePermissions(initialRole.permissions),
  );

  // ── User search / filter ───────────────────────────────────────────────────
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Users from BE ──────────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalElements, setUsersTotalElements] = useState(0);

  // ── email→id map: seeded from initialRoleUsers (always has IDs now), then
  //    enriched as all-users pages load.
  const [emailToIdMap, setEmailToIdMap] = useState<Map<string, string>>(
    () => new Map(initialRoleUsers.map((u) => [u.email, u.id])),
  );

  // ── Initial role user emails set ────────────────────────────────────────────
  const initialAssignedEmails = useMemo(
    () => new Set(initialRoleUsers.map((u) => u.email)),
    [initialRoleUsers],
  );

  // ── Queued user changes ────────────────────────────────────────────────────
  // toAdd: users NOT currently in this role who should be added
  const [toAddDetails, setToAddDetails] = useState<Map<string, QueuedUserDetail>>(new Map());
  // toRemove: users currently in this role who should be removed
  const [toRemoveDetails, setToRemoveDetails] = useState<Map<string, QueuedUserDetail>>(new Map());

  // ── Confirmation modal ─────────────────────────────────────────────────────
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // ── Debounced search ───────────────────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(userSearch), 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Reset to page 1 when filter / search / pageSize changes
  useEffect(() => {
    setUserPage(1);
  }, [debouncedSearch, userRoleFilter, pageSize]);

  // ── Fetch all users ────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await getUsers({
        search: debouncedSearch || undefined,
        role: userRoleFilter || undefined,
        page: userPage - 1, // Spring Pageable is 0-indexed
        size: pageSize,
      });
      const fetched = res.data.content;
      setUsers(fetched);
      setUsersTotalPages(res.data.totalPages);
      setUsersTotalElements(res.data.totalElements);

      // Update email→id map with any IDs we receive
      setEmailToIdMap((prev) => {
        const next = new Map(prev);
        fetched.forEach((u) => {
          if (u.id) next.set(u.email, u.id);
        });
        return next;
      });
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

  // ── Permission toggle ─────────────────────────────────────────────────────
  function togglePermission(module: string, field: keyof PermissionState) {
    setPermissions((prev) => {
      const current = prev[module];
      const updated = { ...current, [field]: !current[field] };
      // Disabling access clears all sub-permissions
      if (field === 'canAccess' && !updated.canAccess) {
        updated.canCreate = false;
        updated.canUpdate = false;
        updated.canDelete = false;
      }
      // Enabling any sub-permission implicitly enables access
      if (field !== 'canAccess' && updated[field]) {
        updated.canAccess = true;
      }
      return { ...prev, [module]: updated };
    });
  }

  // ── User selection ────────────────────────────────────────────────────────
  function isUserChecked(user: UserDTO): boolean {
    const assigned = initialAssignedEmails.has(user.email);
    const inRemove = toRemoveDetails.has(user.email);
    const inAdd = toAddDetails.has(user.email);
    return (assigned && !inRemove) || (!assigned && inAdd);
  }

  function toggleUserSelection(user: UserDTO) {
    const { email, nama } = user;
    const id = user.id ?? emailToIdMap.get(email) ?? '';
    const isInitiallyAssigned = initialAssignedEmails.has(email);

    if (isInitiallyAssigned) {
      setToRemoveDetails((prev) => {
        const next = new Map(prev);
        if (next.has(email)) {
          next.delete(email); // undo queued removal
        } else {
          next.set(email, { id, nama, email });
        }
        return next;
      });
    } else {
      setToAddDetails((prev) => {
        const next = new Map(prev);
        if (next.has(email)) {
          next.delete(email); // undo queued addition
        } else {
          next.set(email, { id, nama, email });
        }
        return next;
      });
    }
  }

  function resetUserSelections() {
    setToAddDetails(new Map());
    setToRemoveDetails(new Map());
  }

  // ── Form submission ───────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nama role wajib diisi';
    if (!status) newErrors.status = 'Status role wajib dipilih';
    if (!description.trim()) newErrors.description = 'Deskripsi role wajib diisi';
    const hasAnyPermission = Object.values(permissions).some((p) => p.canAccess);
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

      // Resolve IDs for users to add — IDs may be missing if GET /api/admin/users
      // doesn't include them. Fall back to a per-user detail fetch.
      const addEntries = Array.from(toAddDetails.values());
      const resolvedAddIds = await Promise.all(
        addEntries.map(async (u) => {
          if (u.id) return u.id;
          const cached = emailToIdMap.get(u.email);
          if (cached) return cached;
          try {
            const res = await getUserByEmail(u.email);
            return res.data.id;
          } catch {
            return null;
          }
        }),
      );
      const addUserIds = resolvedAddIds.filter((id): id is string => !!id);

      // Remove IDs come from initialRoleUsers which now always has id.
      const removeUserIds = Array.from(toRemoveDetails.values())
        .map((u) => u.id)
        .filter((id): id is string => !!id);

      await updateRole(initialRole.id, {
        name: name.trim(),
        description: description.trim(),
        status: status === '1',
        permissions: permPayload,
        ...(addUserIds.length > 0 ? { addUserIds } : {}),
        ...(removeUserIds.length > 0 ? { removeUserIds } : {}),
      });

      showToast('success', 'Role berhasil diperbarui', `Role "${name}" telah berhasil diperbarui.`);
      router.push(`/admin/access/role/${initialRole.id}`);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast('danger', 'Gagal memperbarui role', err.message);
      } else {
        showToast('danger', 'Gagal memperbarui role', 'Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const startItem = usersTotalElements === 0 ? 0 : (userPage - 1) * pageSize + 1;
  const endItem = Math.min(userPage * pageSize, usersTotalElements);

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
    userPage,
    setUserPage,
    pageSize,
    setPageSize,
    users,
    usersLoading,
    usersTotalPages,
    usersTotalElements,
    startItem,
    endItem,
    isUserChecked,
    toggleUserSelection,
    initialAssignedEmails,
    toAddDetails,
    toRemoveDetails,
    resetUserSelections,

    // Confirmation modal
    confirmModalOpen,
    closeConfirmModal: () => setConfirmModalOpen(false),
    confirmSubmit,

    // Actions
    handleSubmit,
    goBack: () => router.push(`/admin/access/role/${initialRole.id}`),
  };
}

export { PERMISSION_MODULES, ROLE_STATUS_OPTIONS, PAGE_SIZE_OPTIONS };
export type { PermissionState };
