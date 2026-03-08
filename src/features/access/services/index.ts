import { apiGet, apiPost } from '@/shared/lib/api';
import type { User, Role, CreateRoleRequest, RoleDetail, RoleUserItem } from '../types';

export async function getUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  return apiGet<{ content: User[]; totalElements: number; totalPages: number }>('/users', params);
}

export async function getRoles() {
  return apiGet<Role[]>('/roles');
}

export async function getRoleDetail(id: string) {
  return apiGet<RoleDetail>(`/api/roles/${id}`);
}

export async function getRoleUsers(
  id: string,
  params?: { search?: string; page?: number; size?: number; sort?: string },
) {
  return apiGet<{ content: RoleUserItem[]; totalElements: number; totalPages: number }>(
    `/api/roles/${id}/users`,
    params,
  );
}

export async function createRole(data: CreateRoleRequest) {
  return apiPost<RoleDetail>('/api/roles', data);
}
