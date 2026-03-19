/**
 * Shared CSV parsing utilities used by bulk-import features.
 */

const MAX_ROWS_DEFAULT = 500;

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

export function normalizeValue(value?: string): string {
  return (value ?? '').trim();
}

export function normalizeHeader(value: string): string {
  return value.trim().toLowerCase();
}

export function getCell(row: string[], index: number | null): string {
  if (index === null || index < 0 || index >= row.length) return '';
  return normalizeValue(row[index]);
}

export function isRowEmpty(row: string[]): boolean {
  return row.every(cell => normalizeValue(cell) === '');
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function parseBoolean(value: string): boolean | null {
  const v = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'aktif'].includes(v)) return true;
  if (['false', '0', 'no', 'n', 'nonaktif', 'tidak aktif'].includes(v)) return false;
  return null;
}

// ---------------------------------------------------------------------------
// CSV parsing (RFC 4180 compliant, handles quoted fields)
// ---------------------------------------------------------------------------

function isNewlineChar(char: string): boolean {
  return char === '\n' || char === '\r';
}

interface CsvParserState {
  rows: string[][];
  row: string[];
  cell: string;
  inQuotes: boolean;
  advance: number;
}

function processQuote(state: CsvParserState, next: string | undefined): void {
  if (state.inQuotes && next === '"') {
    state.cell += '"';
    state.advance = 1;
  } else {
    state.inQuotes = !state.inQuotes;
  }
}

function processDelimiter(state: CsvParserState): void {
  state.row.push(state.cell);
  state.cell = '';
}

function processNewline(state: CsvParserState, char: string, next: string | undefined): void {
  state.row.push(state.cell);
  state.rows.push(state.row);
  state.row = [];
  state.cell = '';
  if (char === '\r' && next === '\n') state.advance = 1;
}

export function parseCsvRows(csvText: string): string[][] {
  const state: CsvParserState = { rows: [], row: [], cell: '', inQuotes: false, advance: 0 };

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];
    state.advance = 0;

    if (char === '"') {
      processQuote(state, next);
    } else if (char === ',' && !state.inQuotes) {
      processDelimiter(state);
    } else if (isNewlineChar(char) && !state.inQuotes) {
      processNewline(state, char, next);
    } else {
      state.cell += char;
    }

    i += state.advance;
  }

  if (state.cell.length > 0 || state.row.length > 0) {
    state.row.push(state.cell);
    state.rows.push(state.row);
  }

  return state.rows;
}

// ---------------------------------------------------------------------------
// CSV output helpers
// ---------------------------------------------------------------------------

export function escapeCsvCell(value: unknown): string {
  const raw = value == null ? '' : String(value);
  if (raw.includes('"') || raw.includes(',') || raw.includes('\n') || raw.includes('\r')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function rowsToCsvText(rows: unknown[][]): string {
  return rows.map(row => row.map(cell => escapeCsvCell(cell)).join(',')).join('\n');
}

// ---------------------------------------------------------------------------
// Generic header mapping
// ---------------------------------------------------------------------------

export function mapHeadersByList<K extends string>(
  headerRow: string[],
  expectedHeaders: K[]
): Record<K, number | null> {
  const indexMap = {} as Record<K, number | null>;
  expectedHeaders.forEach(h => {
    indexMap[h] = null;
  });

  expectedHeaders.forEach(header => {
    const idx = headerRow.findIndex(col => normalizeHeader(col) === header.toLowerCase());
    if (idx >= 0) indexMap[header] = idx;
  });

  return indexMap;
}

export function mapHeadersWithAliases<K extends string>(
  headerRow: string[],
  expectedHeaders: K[],
  aliases: Record<string, K>
): Record<K, number | null> {
  const indexMap = {} as Record<K, number | null>;
  expectedHeaders.forEach(h => {
    indexMap[h] = null;
  });

  // First try aliases
  headerRow.forEach((col, idx) => {
    const normalized = normalizeHeader(col);
    const mapped = aliases[normalized];
    if (mapped && indexMap[mapped] === null) {
      indexMap[mapped] = idx;
    }
  });

  // Fallback: exact match on expected headers
  expectedHeaders.forEach(header => {
    if (indexMap[header] !== null) return;
    const idx = headerRow.findIndex(col => normalizeHeader(col) === header.toLowerCase());
    if (idx >= 0) indexMap[header] = idx;
  });

  return indexMap;
}

// ---------------------------------------------------------------------------
// Generic file → parsed rows pipeline
// ---------------------------------------------------------------------------

export interface ParseResult<T> {
  rows: T[];
  globalErrors: string[];
}

export async function parseFile<T>(
  file: File,
  parseCsvFn: (csvText: string) => ParseResult<T>
): Promise<ParseResult<T>> {
  const extension = getFileExtension(file.name);

  if (extension === 'csv') {
    const text = await file.text();
    return parseCsvFn(text);
  }

  if (extension === 'xlsx') {
    const { default: readXlsxFile } = await import('read-excel-file/browser');
    const xlsxRows = await readXlsxFile(file);
    if (xlsxRows.length === 0)
      return { rows: [], globalErrors: ['File XLSX tidak memiliki data.'] };
    const csvText = rowsToCsvText(xlsxRows);
    return parseCsvFn(csvText);
  }

  return { rows: [], globalErrors: ['Format file tidak didukung. Gunakan file .csv atau .xlsx.'] };
}

// ---------------------------------------------------------------------------
// Generic pre-validation (empty file, missing headers, row limits)
// ---------------------------------------------------------------------------

export function preValidateCsv<K extends string>(
  csvText: string,
  requiredFields: K[],
  headerMapper: (headerRow: string[]) => Record<K, number | null>,
  maxRows: number = MAX_ROWS_DEFAULT
): {
  ok: false;
  globalErrors: string[];
} | {
  ok: true;
  headerMap: Record<K, number | null>;
  dataRows: string[][];
} {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) {
    return { ok: false, globalErrors: ['File CSV kosong.'] };
  }

  const headerMap = headerMapper(rows[0]);
  const missingHeaders = requiredFields.filter(field => headerMap[field] === null);
  if (missingHeaders.length > 0) {
    return {
      ok: false,
      globalErrors: [
        `Header wajib tidak lengkap: ${missingHeaders.join(', ')}. Gunakan template CSV agar format sesuai.`,
      ],
    };
  }

  const dataRows = rows.slice(1).filter(row => !isRowEmpty(row));
  if (dataRows.length === 0) {
    return { ok: false, globalErrors: ['Tidak ada data baris untuk diimpor.'] };
  }

  if (dataRows.length > maxRows) {
    return { ok: false, globalErrors: [`Maksimal ${maxRows} baris per upload.`] };
  }

  return { ok: true, headerMap, dataRows };
}

// ---------------------------------------------------------------------------
// Session-storage draft helpers (generic)
// ---------------------------------------------------------------------------

export function saveDraft<T>(storageKey: string, draft: T): void {
  sessionStorage.setItem(storageKey, JSON.stringify(draft));
}

export function getDraft<T extends { rows: unknown[] }>(storageKey: string): T | null {
  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as T;
    if (!parsed || !Array.isArray(parsed.rows)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft(storageKey: string): void {
  sessionStorage.removeItem(storageKey);
}
