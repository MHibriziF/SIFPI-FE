import type { BulkImportDraft, BulkInsertUserRequest, ParsedBulkUserRow } from '@/features/user-management/types';
import {
  getCell,
  mapHeadersByList,
  normalizeValue,
  parseBoolean,
  parseFile,
  preValidateCsv,
  saveDraft,
  getDraft,
  clearDraft,
  type ParseResult,
} from '@/shared/lib/csv';

const STORAGE_KEY = 'admin-bulk-user-import-draft';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

const EXPECTED_HEADERS: Array<keyof BulkInsertUserRequest> = [
  'email',
  'nama',
  'role',
  'organisasi',
  'phone',
  'isActive',
];

const REQUIRED_FIELDS: Array<keyof BulkInsertUserRequest> = ['email', 'nama', 'isActive'];

function sanitizePhone(value: string): string {
  return value.replace(/[\s()-]/g, '');
}

function validateRequiredFields(
  email: string,
  nama: string,
  isActive: boolean | null,
  organisasi: string,
  roleRaw: string,
): string[] {
  const errors: string[] = [];

  if (!email) errors.push('Email wajib diisi.');
  else if (!EMAIL_REGEX.test(email)) errors.push('Format email tidak valid.');

  if (!nama) errors.push('Nama wajib diisi.');

  if (isActive === null) {
    errors.push('isActive wajib diisi dengan nilai true/false.');
  } else if (isActive) {
    if (!organisasi) errors.push('Organisasi wajib diisi ketika isActive bernilai true.');
    if (!roleRaw) errors.push('Role wajib diisi ketika isActive bernilai true.');
  }

  return errors;
}

function buildRowDto(
  csvRow: string[],
  headerMap: Record<keyof BulkInsertUserRequest, number | null>,
): { dto: BulkInsertUserRequest; email: string; nama: string; organisasi: string; roleRaw: string; isActive: boolean | null; errors: string[] } {
  const email = getCell(csvRow, headerMap.email).toLowerCase();
  const nama = getCell(csvRow, headerMap.nama);
  const organisasi = getCell(csvRow, headerMap.organisasi);
  const roleRaw = getCell(csvRow, headerMap.role).toUpperCase();
  const phoneRaw = getCell(csvRow, headerMap.phone);
  const isActiveRaw = getCell(csvRow, headerMap.isActive);
  const isActive = parseBoolean(isActiveRaw);

  const dto: BulkInsertUserRequest = {
    email,
    nama,
    isActive: isActive ?? false,
  };

  if (organisasi) dto.organisasi = organisasi;
  if (roleRaw) dto.role = roleRaw;
  if (phoneRaw) dto.phone = sanitizePhone(phoneRaw);

  if (isActive !== null) dto.isActive = isActive;

  const errors = validateRequiredFields(email, nama, isActive, organisasi, roleRaw);
  if (dto.phone && !PHONE_REGEX.test(dto.phone)) {
    errors.push('Nomor telepon tidak valid.');
  }

  return { dto, email, nama, organisasi, roleRaw, isActive, errors };
}

export function parseAndValidateBulkUserCsv(csvText: string): ParseResult<ParsedBulkUserRow> {
  const pre = preValidateCsv(
    csvText,
    REQUIRED_FIELDS,
    headerRow => mapHeadersByList(headerRow, EXPECTED_HEADERS)
  );
  if (!pre.ok) return { rows: [], globalErrors: pre.globalErrors };

  const { headerMap, dataRows } = pre;

  const parsed: ParsedBulkUserRow[] = dataRows.map((csvRow, idx) => {
    const rowNumber = idx + 2;
    const { dto, errors } = buildRowDto(csvRow, headerMap);

    return {
      rowNumber,
      dto,
      errors,
    };
  });

  const emailOccurrences = new Map<string, number>();
  parsed.forEach(item => {
    if (!item.dto.email) return;
    emailOccurrences.set(item.dto.email, (emailOccurrences.get(item.dto.email) ?? 0) + 1);
  });

  parsed.forEach(item => {
    if (!item.dto.email) return;
    if ((emailOccurrences.get(item.dto.email) ?? 0) > 1) {
      item.errors.push('Email duplikat pada file CSV.');
    }
  });

  return {
    rows: parsed,
    globalErrors: [],
  };
}

export async function parseAndValidateBulkUserFile(
  file: File
): Promise<ParseResult<ParsedBulkUserRow>> {
  return parseFile(file, parseAndValidateBulkUserCsv);
}

export function saveBulkImportDraft(draft: BulkImportDraft): void {
  saveDraft(STORAGE_KEY, draft);
}

export function getBulkImportDraft(): BulkImportDraft | null {
  return getDraft<BulkImportDraft>(STORAGE_KEY);
}

export function clearBulkImportDraft(): void {
  clearDraft(STORAGE_KEY);
}

export function buildTemplateCsv(): string {
  return [
    'email,nama,role,organisasi,phone,isActive,keterangan',
    'budi.santoso@example.com,Budi Santoso,INVESTOR,PT Infrastructure Development,+6281248724912,true,"Role valid: ADMIN, PROJECT_OWNER, INVESTOR, EXECUTIVE"',
    'siti.rahma@example.com,Siti Rahma,,PT Infrastruktur Nusantara,+6281332211000,false,"Jika isActive=false, role dan organisasi boleh kosong"',
  ].join('\n');
}
