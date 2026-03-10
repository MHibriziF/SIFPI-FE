import { apiGet, apiPatch, apiPost } from '@/shared/lib/api';
import type {
  UserDTO,
  PagedResponse,
  Role,
  CreateRoleRequest,
  RoleDetail,
  BatchRoleUpdateResult,
  User,
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
  return apiGet<{ content: User[]; totalElements: number; totalPages: number }>(
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

// ---------------------------------------------------------------------------
// Server-side helpers (use raw fetch — apiGet uses axios which requires
// document.cookie and cannot run in server components)
// ---------------------------------------------------------------------------

export async function serverGetAdminUsers(
  token: string
): Promise<{ users: UserDTO[]; total: number }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
      headers: { Cookie: `SIFPI_TOKEN=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { users: [], total: 0 };
    const body: BaseResponse<{ content: UserDTO[]; totalElements: number }> = await res.json();
    return {
      users: body.data?.content ?? [],
      total: body.data?.totalElements ?? 0,
    };
  } catch {
    return { users: [], total: 0 };
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

export async function serverGetRoleDetail(id: string, token: string): Promise<RoleDetail | null> {
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
  token: string
): Promise<AdminUserDetail | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${encodeURIComponent(email)}`,
      {
        headers: { Cookie: `SIFPI_TOKEN=${token}` },
        cache: 'no-store',
      }
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
  token: string
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
