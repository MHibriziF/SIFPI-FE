import { apiGet, apiPatch, apiPost } from '@/shared/lib/api';
import type {
  UserDTO,
  PagedResponse,
  Role,
  CreateRoleRequest,
  RoleDetail,
  BatchRoleUpdateResult,
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
  return apiGet<PagedResponse<UserDTO>>('/api/admin/users', params);
}

export async function updateUserRoles(updates: { email: string; roleName: string }[]) {
  return apiPatch<BatchRoleUpdateResult>('/api/users/roles', { updates });
}

export async function getRoles() {
  return apiGet<Role[]>('/roles');
}

export async function getRoleDetail(id: string) {
  return apiGet<RoleDetail>(`/roles/${id}`);
}

export async function createRole(data: CreateRoleRequest) {
  return apiPost<RoleDetail>('/api/roles', data);
}
