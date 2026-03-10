export interface BulkInsertUserRequest {
  email: string;
  nama: string;
  role?: string;
  organisasi?: string;
  phone?: string;
  is_active: boolean;
}

export interface BulkInsertResultDTO {
  imported: number;
}

export interface ParsedBulkUserRow {
  rowNumber: number;
  dto: BulkInsertUserRequest;
  errors: string[];
}

export interface BulkImportDraft {
  sourceFileName: string;
  rows: ParsedBulkUserRow[];
  createdAt: string;
}

export interface BackendValidationError {
  row?: number;
  rowNumber?: number;
  message?: string;
  reason?: string;
  reasons?: string[];
}

// ─── UM-8: Profile DTOs ───────────────────────────────────────────────────────

export interface CompanyInfo {
  name: string | null;
  sector: string | null;
  industry_type: null;
}

/** Shape returned by GET /api/users/profile for an INVESTOR */
export interface InvestorUserDetailDTO {
  id: string;
  email: string;
  nama: string;
  phone: string;
  role: string;
  organisasi?: string;
  jabatan?: string;
  created_at: string;
  last_login?: string;
  email_verified: boolean;
  is_active: boolean;
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

/** Shape returned by GET /api/users/profile for ADMIN / EXECUTIVE */
export interface AdminUserDetailDTO {
  id: string;
  email: string;
  nama: string;
  phone: string;
  role: string;
  jabatan?: string;
  created_at: string;
  last_login?: string;
  email_verified: boolean;
  is_active: boolean;
}

/** PATCH /api/users/profile — admin / executive payload (UM-8) */
export interface UpdateAdminProfileRequest {
  // Base — required
  name: string;
  email: string;
  phone_number: string;
  // Optional — all roles
  jabatan?: string;
}

/** Shape returned by GET /api/users/profile for PROJECT_OWNER */
export interface ProjectOwnerUserDetailDTO {
  id: string;
  email: string;
  nama: string;
  phone: string;
  role: string;
  organisasi?: string;
  jabatan?: string;
  created_at: string;
  last_login?: string;
  email_verified: boolean;
  is_active: boolean;
  jumlah_proyek?: number;
  inquiry_masuk?: number;
}

/** PATCH /api/users/profile — project owner payload (UM-8) */
export interface UpdateProjectOwnerProfileRequest {
  // Base — required
  name: string;
  email: string;
  phone_number: string;
  // Optional — PROJECT_OWNER extra fields
  institution_name?: string; // → User.organization
  position?: string;         // → User.jabatan (takes precedence over jabatan)
}

/** PATCH /api/users/profile — investor payload (UM-8) */
export interface UpdateInvestorProfileRequest {
  // Base — required
  name: string;
  email: string;
  phone_number: string;
  // Optional — all roles
  jabatan?: string;
  // Optional — INVESTOR extra fields
  company_name?: string;
  investment_interest_sectors?: string[];
  investment_scale?: string;
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
