import { apiPost, apiPatch } from '@/shared/lib/api';
import type { LoginRequest, AuthResponse } from '@/features/auth/types';
import type { BaseResponse } from '@/shared/types/api';

export async function login(data: LoginRequest) {
  return apiPost<AuthResponse>('/api/auth/login', data);
}

export async function logout() {
  return apiPost<null>('/api/auth/logout');
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
