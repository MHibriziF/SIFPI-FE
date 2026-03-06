import { apiPost } from '@/shared/lib/api';
import type { BulkInsertResultDTO, BulkInsertUserRequest } from '@/features/user-management/types';

export async function bulkInsertUsers(payload: BulkInsertUserRequest[]) {
  return apiPost<BulkInsertResultDTO>('/api/admin/users/bulk', payload);
}
