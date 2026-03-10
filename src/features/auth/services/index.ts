import { apiPost, apiPatch, apiGet } from '@/shared/lib/api';
import type {
  LoginRequest,
  AuthResponse,
  CreateOwnerRequest,
  CreateInvestorRequest,
  OwnerDTO,
  InvestorDTO,
  OrganizationDTO,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/features/auth/types';
import type { BaseResponse } from '@/shared/types/api';

export async function login(data: LoginRequest) {
  return apiPost<AuthResponse>('/api/auth/login', data);
}

export async function logout() {
  return apiPost<null>('/api/auth/logout');
}

export async function registerOwner(data: CreateOwnerRequest) {
  return apiPost<OwnerDTO>('/api/auth/register/owner', data);
}

export async function registerInvestor(data: CreateInvestorRequest) {
  return apiPost<InvestorDTO>('/api/auth/register/investor', data);
}

// Password management
export interface SetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function setPassword(request: SetPasswordRequest): Promise<BaseResponse<void>> {
  return apiPost<void>('/api/auth/set-password', request);
}

export async function updatePassword(request: UpdatePasswordRequest): Promise<BaseResponse<void>> {
  return apiPatch<void>('/api/users/password', request);
}

export async function getAllOrganizations(): Promise<BaseResponse<OrganizationDTO[]>> {
  return apiGet<OrganizationDTO[]>('/api/auth/organizations');
}

export async function searchOrganizations(
  searchTerm: string
): Promise<BaseResponse<OrganizationDTO[]>> {
  const encodedTerm = encodeURIComponent(searchTerm);
  return apiGet<OrganizationDTO[]>(`/api/auth/organizations/search?q=${encodedTerm}`);
}

export async function getOrCreateOrganization(
  name: string
): Promise<BaseResponse<OrganizationDTO>> {
  return apiPost<OrganizationDTO>('/api/auth/organizations/get-or-create', { name });
}

// Forgot / Reset password
export async function forgotPassword(data: ForgotPasswordRequest): Promise<BaseResponse<null>> {
  return apiPost<null>('/api/auth/forgot-password', data);
}

export async function resetPassword(data: ResetPasswordRequest): Promise<BaseResponse<null>> {
  return apiPost<null>('/api/auth/reset-password', data);
}
