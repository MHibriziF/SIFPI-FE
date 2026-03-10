export interface User {
  id: string;
  name: string;
  organization: string;
  email: string;
  role: string;
  status: string;
}

export interface UserDTO {
  id?: string;
  email: string;
  nama: string;
  organisasi: string;
  phone: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
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
  project_owner_is_verified: boolean | null;
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

/** Shape returned by GET /api/roles/:id/users */
export interface RoleUserItem {
  id: string;
  email: string;
  nama: string;
}

/** Request body for PUT /api/roles/{id} (UM-15) */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  status?: boolean;
  permissions?: { resource: string; actions: string[] }[];
  addUserIds?: string[];
  removeUserIds?: string[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  status: boolean;
  permissions: {
    resource: string;
    actions: string[];
  }[];
  userEmails: string[];
}

// ─── User Detail (GET /api/admin/users/{email}) ────────────────────────────

export interface CompanyInfo {
  name: string;
  sector: string;
  industry_type: string | null;
}

/**
 * Shape returned by GET /api/admin/users/{email}.
 * Role-specific fields are only present for the matching role (@JsonInclude NON_NULL).
 */
export interface AdminUserDetail {
  id: string;
  email: string;
  nama: string;
  phone: string;
  role: string;
  created_at: string;
  last_login: string;
  email_verified: boolean;
  /** Only present for PROJECT_OWNER: true if admin has verified the account */
  owner_verified?: boolean;
  is_active: boolean;

  // PROJECT_OWNER & EXECUTIVE
  jabatan?: string;

  // PROJECT_OWNER only
  organisasi?: string;
  jumlah_proyek?: number;
  inquiry_masuk?: number;

  // INVESTOR only
  company_info?: CompanyInfo;
  sector_interest?: string[];
  budget_range?: string;
  preferred_investment_instrument?: string;
  engagement_model?: string;
  stage_preference?: string;
  risk_appetite?: string;
  esg_standards?: string;
  local_presence?: string;
  aum_size?: string;
  opt_in_email?: boolean;
  agree_privacy?: boolean;
}
