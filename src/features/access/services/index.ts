import { apiGet, apiPatch, apiPost, apiPut } from '@/shared/lib/api';
import type {
  UserDTO,
  AdminUser,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleDetail,
  BatchRoleUpdateResult,
  RoleUserItem,
  AdminUserDetail,
} from '../types';
import { BaseResponse } from '@/shared/types/api';

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
  return apiGet<{ content: UserDTO[]; totalElements: number; totalPages: number }>(
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

// ---------------------------------------------------------------------------
// Server-side helpers (use raw fetch — apiGet uses axios which requires
// document.cookie and cannot run in server components)
// ---------------------------------------------------------------------------

export async function serverGetAdminUsers(
  token: string,
  params?: { page?: number; size?: number; role?: string; search?: string },
): Promise<{ users: AdminUser[]; total: number; totalPages: number }> {
  try {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.size != null) qs.set('size', String(params.size));
    if (params?.role)         qs.set('role', params.role);
    if (params?.search)       qs.set('search', params.search);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${qs}`;
    const res = await fetch(url, {
      headers: { Cookie: `SIFPI_TOKEN=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { users: [], total: 0, totalPages: 0 };
    const body: BaseResponse<{ content: AdminUser[]; totalElements: number; totalPages: number }> = await res.json();
    return {
      users:      body.data?.content    ?? [],
      total:      body.data?.totalElements ?? 0,
      totalPages: body.data?.totalPages    ?? 0,
    };
  } catch {
    return { users: [], total: 0, totalPages: 0 };
  }
}

export async function serverGetRoles(token: string): Promise<Role[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
      headers: { Cookie: `SIFPI_TOKEN=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const body: BaseResponse<Role[]> = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

export async function serverGetRoleDetail(
  id: string,
  token: string,
): Promise<RoleDetail | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${id}`, {
      headers: { Cookie: `SIFPI_TOKEN=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body: BaseResponse<RoleDetail> = await res.json();
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function serverGetAdminUserDetail(
  email: string,
  token: string,
): Promise<AdminUserDetail | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${encodeURIComponent(email)}`,
      {
        headers: { Cookie: `SIFPI_TOKEN=${token}` },
        cache: 'no-store',
      },
    );
    if (!res.ok) return null;
    const body: BaseResponse<AdminUserDetail> = await res.json();
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function serverGetRoleUsers(
  id: string,
  token: string,
): Promise<{ users: RoleUserItem[]; total: number }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${id}/users`, {
      headers: { Cookie: `SIFPI_TOKEN=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { users: [], total: 0 };
    const body: BaseResponse<{ content: RoleUserItem[]; totalElements: number }> = await res.json();
    return {
      users: body.data?.content ?? [],
      total: body.data?.totalElements ?? 0,
    };
  } catch {
    return { users: [], total: 0 };
  }
}
