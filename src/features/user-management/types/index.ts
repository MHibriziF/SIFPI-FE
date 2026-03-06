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
