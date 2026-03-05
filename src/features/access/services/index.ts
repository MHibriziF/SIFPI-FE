import { apiGet, apiPost } from '@/shared/lib/api';
import type { User, Role, CreateRoleRequest, RoleDetail } from '../types';

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
  return apiGet<RoleDetail>(`/roles/${id}`);
}

export async function createRole(data: CreateRoleRequest) {
  return apiPost<RoleDetail>('/api/roles', data);
}
