import { apiPost } from '@/shared/lib/api';
import type { LoginRequest, AuthResponse } from '@/features/auth/types';

export async function login(data: LoginRequest) {
  return apiPost<AuthResponse>('api/auth/login', data);
}

export async function logout() {
  return apiPost<null>('/api/auth/logout');
}
