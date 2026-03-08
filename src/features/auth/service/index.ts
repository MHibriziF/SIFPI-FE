import { apiPost } from '@/shared/lib/api';
import type { LoginRequest, AuthResponse, CreateOwnerRequest, CreateInvestorRequest, OwnerDTO, InvestorDTO } from '@/features/auth/types';

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
