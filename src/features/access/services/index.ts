import { apiGet, apiPatch, apiPost, apiPut } from '@/shared/lib/api';
import type {
  AdminUser,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleDetail,
  BatchRoleUpdateResult,
  RoleUserItem,
  AdminUserDetail,
} from '../types';

export async function getUsers(params?: {
  search?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  organisasi?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}) {
  return apiGet<{ content: AdminUser[]; totalElements: number; totalPages: number }>(
    '/api/admin/users',
    params
  );
}

export async function getRoles() {
  return apiGet<Role[]>('/api/roles');
}

export async function getRoleDetail(id: string) {
  return apiGet<RoleDetail>(`/api/roles/${id}`);
}

export async function getRoleUsers(
  id: string,
  params?: { search?: string; page?: number; size?: number; sort?: string }
) {
  return apiGet<{ content: RoleUserItem[]; totalElements: number; totalPages: number }>(
    `/api/roles/${id}/users`,
    params
  );
}

export async function createRole(data: CreateRoleRequest) {
  return apiPost<RoleDetail>('/api/roles', data);
}

export async function updateRole(id: string, data: UpdateRoleRequest) {
  return apiPut<RoleDetail>(`/api/roles/${id}`, data);
}

/** Fetch a single user's detail (including their UUID id) by email. */
export async function getUserByEmail(email: string) {
  return apiGet<AdminUserDetail>(`/api/admin/users/${encodeURIComponent(email)}`);
}

export async function updateUserRoles(updates: { email: string; roleName: string }[]) {
  return apiPatch<BatchRoleUpdateResult>('/api/admin/users/roles', { updates });
}

// ─── User Account Actions (Admin) ──────────────────────────────────────────

/**
 * Verify a Project Owner account.
 * PATCH /api/admin/users/:email/verify
 */
export async function verifyProjectOwner(email: string) {
  return apiPatch<{ email: string; verified: boolean; verifiedBy: string; verifiedAt: string }>(
    `/api/admin/users/${encodeURIComponent(email)}/verify`,
    {}
  );
}

/**
 * Update user active status (soft delete / deactivate).
 * PATCH /api/admin/users/:email/status
 * @param isActive - false to deactivate, true to reactivate
 */
export async function updateUserStatus(email: string, isActive: boolean) {
  return apiPatch<{ email: string; active: boolean; action: string }>(
    `/api/admin/users/${encodeURIComponent(email)}/status`,
    { isActive }
  );
}

