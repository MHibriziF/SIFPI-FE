export interface User {
  id: string;
  name: string;
  organization: string;
  email: string;
  role: string;
  status: string;
}

/** Shape returned by GET /api/admin/users */
export interface AdminUser {
  email: string;
  nama: string;
  organisasi: string | null;
  phone: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
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

/** Shape returned by GET /api/roles/:id/users */
export interface RoleUserItem {
  email: string;
  nama: string;
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
