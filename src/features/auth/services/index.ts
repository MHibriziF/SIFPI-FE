import { apiPost, apiPatch } from '@/shared/lib/api';
import type { LoginRequest, AuthResponse, CreateOwnerRequest, CreateInvestorRequest, OwnerDTO, InvestorDTO } from '@/features/auth/types';
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
