import type { BulkImportDraft, BulkInsertUserRequest, ParsedBulkUserRow } from '@/features/user-management/types';

const STORAGE_KEY = 'admin-bulk-user-import-draft';
const MAX_ROWS = 500;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

const EXPECTED_HEADERS: Array<keyof BulkInsertUserRequest> = [
  'email',
  'nama',
  'role',
  'organisasi',
  'phone',
  'is_active',
];

const REQUIRED_FIELDS: Array<keyof BulkInsertUserRequest> = ['email', 'nama', 'is_active'];

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeValue(value?: string): string {
  return (value ?? '').trim();
}

function parseBoolean(value: string): boolean | null {
  const v = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'aktif'].includes(v)) return true;
  if (['false', '0', 'no', 'n', 'nonaktif', 'tidak aktif'].includes(v)) return false;
  return null;
}

function sanitizePhone(value: string): string {
  return value.replace(/[\s()-]/g, '');
}

function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function mapHeaders(headerRow: string[]): Record<keyof BulkInsertUserRequest, number | null> {
  const indexMap: Record<keyof BulkInsertUserRequest, number | null> = {
    email: null,
    nama: null,
    role: null,
    organisasi: null,
    phone: null,
    is_active: null,
  };

  EXPECTED_HEADERS.forEach(header => {
    const idx = headerRow.findIndex(col => normalizeHeader(col) === header);
    if (idx >= 0) indexMap[header] = idx;
  });

  return indexMap;
}

function getCell(row: string[], index: number | null): string {
  if (index === null || index < 0 || index >= row.length) return '';
  return normalizeValue(row[index]);
}

function isRowEmpty(row: string[]): boolean {
  return row.every(cell => normalizeValue(cell) === '');
}

function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function parseAndValidateBulkUserCsv(csvText: string): { rows: ParsedBulkUserRow[]; globalErrors: string[] } {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) {
    return { rows: [], globalErrors: ['File CSV kosong.'] };
  }

  const headerMap = mapHeaders(rows[0]);
  const missingHeaders = REQUIRED_FIELDS.filter(field => headerMap[field] === null);
  if (missingHeaders.length > 0) {
    return {
      rows: [],
      globalErrors: [
        `Header wajib tidak lengkap: ${missingHeaders.join(', ')}. Gunakan template CSV agar format sesuai.`,
      ],
    };
  }

  const dataRows = rows.slice(1).filter(row => !isRowEmpty(row));
  if (dataRows.length === 0) {
    return { rows: [], globalErrors: ['Tidak ada data baris untuk diimpor.'] };
  }

  if (dataRows.length > MAX_ROWS) {
    return { rows: [], globalErrors: [`Maksimal ${MAX_ROWS} baris per upload.`] };
  }

  const parsed: ParsedBulkUserRow[] = dataRows.map((csvRow, idx) => {
    const rowNumber = idx + 2;
    const email = getCell(csvRow, headerMap.email).toLowerCase();
    const nama = getCell(csvRow, headerMap.nama);
    const organisasi = getCell(csvRow, headerMap.organisasi);
    const roleRaw = getCell(csvRow, headerMap.role).toUpperCase();
    const phoneRaw = getCell(csvRow, headerMap.phone);
    const isActiveRaw = getCell(csvRow, headerMap.is_active);
    const isActive = parseBoolean(isActiveRaw);

    const dto: BulkInsertUserRequest = {
      email,
      nama,
      is_active: isActive ?? false,
    };

    if (organisasi) dto.organisasi = organisasi;
    if (roleRaw) dto.role = roleRaw;

    if (phoneRaw) {
      dto.phone = sanitizePhone(phoneRaw);
    }

    const errors: string[] = [];

    if (!email) errors.push('Email wajib diisi.');
    else if (!EMAIL_REGEX.test(email)) errors.push('Format email tidak valid.');

    if (!nama) errors.push('Nama wajib diisi.');
    if (isActive === null) {
      errors.push('is_active wajib diisi dengan nilai true/false.');
    } else {
      dto.is_active = isActive;
      if (isActive) {
        if (!organisasi) {
          errors.push('Organisasi wajib diisi ketika is_active bernilai true.');
        }
        if (!roleRaw) {
          errors.push('Role wajib diisi ketika is_active bernilai true.');
        }
      }
    }

    if (dto.phone && !PHONE_REGEX.test(dto.phone)) {
      errors.push('Nomor telepon tidak valid.');
    }

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
): Promise<{ rows: ParsedBulkUserRow[]; globalErrors: string[] }> {
  const extension = getFileExtension(file.name);

  if (extension === 'csv') {
    const text = await file.text();
    return parseAndValidateBulkUserCsv(text);
  }

  if (extension === 'xlsx') {
    const { read, utils } = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(buffer), { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { rows: [], globalErrors: ['File XLSX tidak memiliki sheet data.'] };
    }

    const firstSheet = workbook.Sheets[firstSheetName];
    const csvText = utils.sheet_to_csv(firstSheet, { blankrows: false });
    return parseAndValidateBulkUserCsv(csvText);
  }

  return { rows: [], globalErrors: ['Format file tidak didukung. Gunakan file .csv atau .xlsx.'] };
}

export function saveBulkImportDraft(draft: BulkImportDraft): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function getBulkImportDraft(): BulkImportDraft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as BulkImportDraft;
    if (!parsed || !Array.isArray(parsed.rows)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearBulkImportDraft(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function buildTemplateCsv(): string {
  return [
    'email,nama,role,organisasi,phone,is_active,keterangan',
    'budi.santoso@example.com,Budi Santoso,INVESTOR,PT Infrastructure Development,+6281248724912,true,"Role valid: ADMIN, PROJECT_OWNER, INVESTOR, EXECUTIVE"',
    'siti.rahma@example.com,Siti Rahma,,PT Infrastruktur Nusantara,+6281332211000,false,"Jika is_active=false, role dan organisasi boleh kosong"',
  ].join('\n');
}
