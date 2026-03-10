import { apiPost, apiGet, apiPatch } from '@/shared/lib/api';
import type {
  BulkInsertResultDTO,
  BulkInsertUserRequest,
  AdminUserDetailDTO,
  UpdateAdminProfileRequest,
  InvestorUserDetailDTO,
  UpdateInvestorProfileRequest,
  ProjectOwnerUserDetailDTO,
  UpdateProjectOwnerProfileRequest,
} from '@/features/user-management/types';
import type { BaseResponse } from '@/shared/types/api';

export async function bulkInsertUsers(payload: BulkInsertUserRequest[]) {
  return apiPost<BulkInsertResultDTO>('/api/admin/users/bulk', payload);
}

// Executive registration
export interface CreateExecutiveRequest {
  nama: string;
  jabatan: string;
  email: string;
  phone: string;
}

export async function createExecutive(
  request: CreateExecutiveRequest
): Promise<BaseResponse<void>> {
  return apiPost<void>('/api/register/executive', request);
}

// User profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export async function getCurrentUser(): Promise<BaseResponse<UserProfile>> {
  return apiGet<UserProfile>('/api/me');
}

// ─── UM-8: View & Update Own Profile ─────────────────────────────────────────

/** GET /api/users/profile — fetch the caller's own profile (identity from JWT) */
export async function getMyProfile(): Promise<BaseResponse<InvestorUserDetailDTO>> {
  return apiGet<InvestorUserDetailDTO>('/api/users/profile');
}

/** PATCH /api/users/profile — update the caller's own admin / executive profile */
export async function updateAdminProfile(
  payload: UpdateAdminProfileRequest
): Promise<BaseResponse<AdminUserDetailDTO>> {
  return apiPatch<AdminUserDetailDTO>('/api/users/profile', payload);
}

/** PATCH /api/users/profile — update the caller's own project owner profile */
export async function updateOwnerProfile(
  payload: UpdateProjectOwnerProfileRequest
): Promise<BaseResponse<ProjectOwnerUserDetailDTO>> {
  return apiPatch<ProjectOwnerUserDetailDTO>('/api/users/profile', payload);
}

/** PATCH /api/users/profile — update the caller's own investor profile */
export async function updateInvestorProfile(
  payload: UpdateInvestorProfileRequest
): Promise<BaseResponse<InvestorUserDetailDTO>> {
  return apiPatch<InvestorUserDetailDTO>('/api/users/profile', payload);
}
