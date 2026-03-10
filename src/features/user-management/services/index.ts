import { apiPost, apiGet } from '@/shared/lib/api';
import type { BulkInsertResultDTO, BulkInsertUserRequest } from '@/features/user-management/types';
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
