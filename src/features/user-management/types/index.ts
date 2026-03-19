export interface BulkInsertUserRequest {
  email: string;
  nama: string;
  role?: string;
  organisasi?: string;
  phone?: string;
  isActive: boolean;
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
  industryType: null;
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
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
  isActive: boolean;
  companyInfo?: CompanyInfo;
  sectorInterest?: string[];
  budgetRange?: string;
  preferredInvestmentInstrument?: string;
  engagementModel?: string;
  stagePreference?: string;
  riskAppetite?: string;
  esgStandards?: string;
  localPresence?: string;
  aumSize?: string;
  optInEmail?: boolean;
  agreePrivacy?: boolean;
}

/** Shape returned by GET /api/users/profile for ADMIN / EXECUTIVE */
export interface AdminUserDetailDTO {
  id: string;
  email: string;
  nama: string;
  phone: string;
  role: string;
  jabatan?: string;
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
  isActive: boolean;
}

/** PATCH /api/users/profile — admin / executive payload (UM-8) */
export interface UpdateAdminProfileRequest {
  // Base — required
  name: string;
  email: string;
  phoneNumber: string;
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
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
  isActive: boolean;
  jumlahProyek?: number;
  inquiryMasuk?: number;
}

/** PATCH /api/users/profile — project owner payload (UM-8) */
export interface UpdateProjectOwnerProfileRequest {
  // Base — required
  name: string;
  email: string;
  phoneNumber: string;
  // Optional — PROJECT_OWNER extra fields
  institutionName?: string; // → User.organization
  position?: string;         // → User.jabatan (takes precedence over jabatan)
}

/** PATCH /api/users/profile — investor payload (UM-8) */
export interface UpdateInvestorProfileRequest {
  // Base — required
  name: string;
  email: string;
  phoneNumber: string;
  // Optional — all roles
  jabatan?: string;
  // Optional — INVESTOR extra fields
  companyName?: string;
  investmentInterestSectors?: string[];
  investmentScale?: string;
  preferredInvestmentInstrument?: string;
  engagementModel?: string;
  stagePreference?: string;
  riskAppetite?: string;
  esgStandards?: string;
  localPresence?: string;
  aumSize?: string;
  optInEmail?: boolean;
  agreePrivacy?: boolean;
}
