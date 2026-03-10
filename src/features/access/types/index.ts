export interface User {
  id: string;
  name: string;
  organization: string;
  email: string;
  role: string;
  status: string;
}

export interface UserDTO {
  email: string;
  nama: string;
  organisasi: string;
  phone: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface BatchRoleUpdateResult {
  totalRequested: number;
  updatedCount: number;
  errors: { email: string; reason: string }[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string;
  status: boolean;
  permissions: Record<string, string[]>;
}

export interface RolePermission {
  module: string;
  label: string;
  description: string;
  canAccess: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface RoleUser {
  id: string;
  name: string;
  email: string;
  currentRole: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  status: number;
  permissions: {
    resource: string;
    actions: string[];
  }[];
}
