import type {
  BatchUploadProjectRequest,
  BulkProjectImportDraft,
  ParsedBulkProjectRow,
  ProjectTimeline,
} from '@/features/project/types/import-project';
import {
  getCell,
  mapHeadersWithAliases,
  parseBoolean,
  parseCsvRows,
  parseFile,
  preValidateCsv,
  normalizeHeader,
  saveDraft,
  getDraft,
  clearDraft,
  type ParseResult,
} from '@/shared/lib/csv';

const STORAGE_KEY = 'admin-bulk-project-import-draft';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9-]{8,20}$/;
const URL_REGEX = /^https?:\/\/.+/i;

type HeaderKey = keyof BatchUploadProjectRequest;

const EXPECTED_HEADERS: HeaderKey[] = [
  'ownerEmail',
  'name',
  'description',
  'sector',
  'location',
  'valueProposition',
  'ownerInstitution',
  'contactPersonName',
  'contactPersonEmail',
  'contactPersonPhone',
  'cooperationModel',
  'concessionPeriod',
  'assetReadiness',
  'governmentSupport',
  'totalCapex',
  'totalOpex',
  'npv',
  'irr',
  'revenueStream',
  'isFeasibilityStudy',
  'additionalInfo',
  'locationImageUrl',
  'projectStructureImageUrl',
  'projectFileUrl',
];

const REQUIRED_FIELDS: HeaderKey[] = [
  'ownerEmail',
  'name',
  'description',
  'sector',
  'location',
  'valueProposition',
  'ownerInstitution',
  'contactPersonName',
  'contactPersonEmail',
  'contactPersonPhone',
  'cooperationModel',
  'concessionPeriod',
  'assetReadiness',
  'governmentSupport',
  'totalCapex',
  'totalOpex',
  'npv',
  'irr',
  'revenueStream',
  'isFeasibilityStudy',
  'locationImageUrl',
  'projectStructureImageUrl',
  'projectFileUrl',
];

const HEADER_ALIASES: Record<string, HeaderKey> = {
  owneremail: 'ownerEmail',
  owner_email: 'ownerEmail',
  name: 'name',
  description: 'description',
  sector: 'sector',
  location: 'location',
  valueproposition: 'valueProposition',
  value_proposition: 'valueProposition',
  ownerinstitution: 'ownerInstitution',
  owner_institution: 'ownerInstitution',
  contactpersonname: 'contactPersonName',
  contact_person_name: 'contactPersonName',
  contactpersonemail: 'contactPersonEmail',
  contact_person_email: 'contactPersonEmail',
  contactpersonphone: 'contactPersonPhone',
  contact_person_phone: 'contactPersonPhone',
  cooperationmodel: 'cooperationModel',
  cooperation_model: 'cooperationModel',
  concessionperiod: 'concessionPeriod',
  concession_period: 'concessionPeriod',
  assetreadiness: 'assetReadiness',
  asset_readiness: 'assetReadiness',
  governmentsupport: 'governmentSupport',
  government_support: 'governmentSupport',
  totalcapex: 'totalCapex',
  total_capex: 'totalCapex',
  totalopex: 'totalOpex',
  total_opex: 'totalOpex',
  npv: 'npv',
  irr: 'irr',
  revenuestream: 'revenueStream',
  revenue_stream: 'revenueStream',
  isFeasibilityStudy: 'isFeasibilityStudy',
  isfeasibilitystudy: 'isFeasibilityStudy',
  additionalinfo: 'additionalInfo',
  additional_info: 'additionalInfo',
  locationimageurl: 'locationImageUrl',
  location_image_url: 'locationImageUrl',
  projectstructureimageurl: 'projectStructureImageUrl',
  project_structure_image_url: 'projectStructureImageUrl',
  projectfileurl: 'projectFileUrl',
  project_file_url: 'projectFileUrl',
};

function parseNumber(value: string): number | null {
  const cleaned = value.replace(/[,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseInteger(value: string): number | null {
  const cleaned = value.replace(/[,\s]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

export function formatFundingDisplay(value: number): string {
  if (value >= 1_000_000_000_000) return `Rp${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(0)}Jt`;
  return `Rp${value.toLocaleString('id-ID')}`;
}

// Matches: timeline1_timeRange, timeline_1_time_range, timeline1timeRange, etc.
const TIMELINE_RANGE_RE = /^timeline_?(\d+)_?timerange$/i;
const TIMELINE_DESC_RE = /^timeline_?(\d+)_?phasedescription$/i;

function buildTimelineIndexMaps(headerRow: string[]): {
  rangeMap: Record<number, number>;
  descMap: Record<number, number>;
  slots: number[];
} {
  const rangeMap: Record<number, number> = {};
  const descMap: Record<number, number> = {};

  headerRow.forEach((col, idx) => {
    const normalized = normalizeHeader(col).replace(/_/g, '');
    const rangeMatch = TIMELINE_RANGE_RE.exec(normalized);
    if (rangeMatch) {
      rangeMap[Number(rangeMatch[1])] = idx;
      return;
    }
    const descMatch = TIMELINE_DESC_RE.exec(normalized);
    if (descMatch) {
      descMap[Number(descMatch[1])] = idx;
    }
  });

  const slots = [...new Set([...Object.keys(rangeMap), ...Object.keys(descMap)])]
    .map(Number)
    .sort((a, b) => a - b);

  return { rangeMap, descMap, slots };
}

function validateRequiredText(
  errors: string[],
  value: string,
  label: string,
): void {
  if (!value) errors.push(`${label} wajib diisi.`);
}

function validateEmail(
  errors: string[],
  value: string,
  label: string,
): void {
  if (!value) errors.push(`${label} wajib diisi.`);
  else if (!EMAIL_REGEX.test(value)) errors.push(`Format ${label} tidak valid.`);
}

function validatePhone(
  errors: string[],
  value: string,
): void {
  if (!value) errors.push('Telepon kontak wajib diisi.');
  else if (!PHONE_REGEX.test(value.replace(/[\s()-]/g, '')))
    errors.push('Format telepon kontak tidak valid.');
}

function validateNumber(
  errors: string[],
  raw: string,
  parsed: number | null,
  label: string,
  options?: { nonNegative?: boolean },
): void {
  if (!raw) { errors.push(`${label} wajib diisi.`); return; }
  if (parsed === null) { errors.push(`Format ${label} tidak valid.`); return; }
  if (options?.nonNegative && parsed < 0) errors.push(`${label} tidak boleh negatif.`);
}

function validateUrl(
  errors: string[],
  value: string,
  label: string,
): void {
  if (!value) errors.push(`${label} wajib diisi.`);
  else if (!URL_REGEX.test(value)) errors.push(`Format ${label} tidak valid.`);
}

function validateRow(
  dto: BatchUploadProjectRequest,
  rawFields: {
    concessionPeriodRaw: string;
    totalCapexRaw: string;
    totalOpexRaw: string;
    npvRaw: string;
    irrRaw: string;
    isFeasibilityStudyRaw: string;
  },
  parsedFields: {
    concessionPeriod: number | null;
    totalCapex: number | null;
    totalOpex: number | null;
    npv: number | null;
    irr: number | null;
    isFeasibilityStudy: boolean | null;
  },
): string[] {
  const errors: string[] = [];

  validateEmail(errors, dto.ownerEmail, 'ownerEmail');
  validateRequiredText(errors, dto.name, 'Nama proyek');
  validateRequiredText(errors, dto.description, 'Deskripsi');
  validateRequiredText(errors, dto.sector, 'Sektor');
  validateRequiredText(errors, dto.location, 'Lokasi');
  validateRequiredText(errors, dto.valueProposition, 'Value proposition');
  validateRequiredText(errors, dto.ownerInstitution, 'Owner institution');
  validateRequiredText(errors, dto.contactPersonName, 'Nama kontak');
  validateEmail(errors, dto.contactPersonEmail, 'Email kontak');
  validatePhone(errors, dto.contactPersonPhone);
  validateRequiredText(errors, dto.cooperationModel, 'Model kerjasama');

  if (!rawFields.concessionPeriodRaw) errors.push('Periode konsesi wajib diisi.');
  else if (parsedFields.concessionPeriod === null) errors.push('Format periode konsesi tidak valid (harus angka).');
  else if (parsedFields.concessionPeriod <= 0) errors.push('Periode konsesi harus lebih dari 0.');

  validateRequiredText(errors, dto.assetReadiness, 'Kesiapan aset');
  validateRequiredText(errors, dto.governmentSupport, 'Dukungan pemerintah');
  validateNumber(errors, rawFields.totalCapexRaw, parsedFields.totalCapex, 'Total CAPEX', { nonNegative: true });
  validateNumber(errors, rawFields.totalOpexRaw, parsedFields.totalOpex, 'Total OPEX', { nonNegative: true });
  validateNumber(errors, rawFields.npvRaw, parsedFields.npv, 'NPV');
  validateNumber(errors, rawFields.irrRaw, parsedFields.irr, 'IRR');
  validateRequiredText(errors, dto.revenueStream, 'Revenue stream');

  if (!rawFields.isFeasibilityStudyRaw) errors.push('isFeasibilityStudy wajib diisi (true/false).');
  else if (parsedFields.isFeasibilityStudy === null) errors.push('isFeasibilityStudy harus bernilai true/false.');

  validateUrl(errors, dto.locationImageUrl ?? '', 'URL gambar lokasi proyek');
  validateUrl(errors, dto.projectStructureImageUrl ?? '', 'URL gambar struktur proyek');
  validateUrl(errors, dto.projectFileUrl ?? '', 'URL dokumen proyek');

  return errors;
}

function extractRowFields(
  csvRow: string[],
  headerMap: Record<string, number | null>,
  rangeMap: Record<number, number>,
  descMap: Record<number, number>,
  slots: number[],
): { dto: BatchUploadProjectRequest; rawFields: Record<string, string>; parsedFields: Record<string, unknown> } {
  const ownerEmail = getCell(csvRow, headerMap.ownerEmail).toLowerCase();
  const name = getCell(csvRow, headerMap.name);
  const description = getCell(csvRow, headerMap.description);
  const sector = getCell(csvRow, headerMap.sector);
  const location = getCell(csvRow, headerMap.location);
  const valueProposition = getCell(csvRow, headerMap.valueProposition);
  const ownerInstitution = getCell(csvRow, headerMap.ownerInstitution);
  const contactPersonName = getCell(csvRow, headerMap.contactPersonName);
  const contactPersonEmail = getCell(csvRow, headerMap.contactPersonEmail).toLowerCase();
  const contactPersonPhone = getCell(csvRow, headerMap.contactPersonPhone);
  const cooperationModel = getCell(csvRow, headerMap.cooperationModel);
  const concessionPeriodRaw = getCell(csvRow, headerMap.concessionPeriod);
  const assetReadiness = getCell(csvRow, headerMap.assetReadiness);
  const governmentSupport = getCell(csvRow, headerMap.governmentSupport);
  const totalCapexRaw = getCell(csvRow, headerMap.totalCapex);
  const totalOpexRaw = getCell(csvRow, headerMap.totalOpex);
  const npvRaw = getCell(csvRow, headerMap.npv);
  const irrRaw = getCell(csvRow, headerMap.irr);
  const revenueStream = getCell(csvRow, headerMap.revenueStream);
  const isFeasibilityStudyRaw = getCell(csvRow, headerMap.isFeasibilityStudy);
  const additionalInfo = getCell(csvRow, headerMap.additionalInfo) || null;
  const locationImageUrl = getCell(csvRow, headerMap.locationImageUrl);
  const projectStructureImageUrl = getCell(csvRow, headerMap.projectStructureImageUrl);
  const projectFileUrl = getCell(csvRow, headerMap.projectFileUrl);

  const timelines: ProjectTimeline[] = [];
  for (const n of slots) {
    const timeRange = rangeMap[n] != null ? getCell(csvRow, rangeMap[n]) : '';
    const phaseDescription = descMap[n] != null ? getCell(csvRow, descMap[n]) : '';
    if (timeRange || phaseDescription) {
      timelines.push({ timeRange, phaseDescription });
    }
  }

  const concessionPeriod = parseInteger(concessionPeriodRaw);
  const totalCapex = parseNumber(totalCapexRaw);
  const totalOpex = parseNumber(totalOpexRaw);
  const npv = parseNumber(npvRaw);
  const irr = parseNumber(irrRaw);
  const isFeasibilityStudy = parseBoolean(isFeasibilityStudyRaw);

  const dto: BatchUploadProjectRequest = {
    ownerEmail, name, description, sector, location, valueProposition,
    ownerInstitution, contactPersonName, contactPersonEmail, contactPersonPhone,
    cooperationModel, concessionPeriod: concessionPeriod ?? 0, assetReadiness,
    governmentSupport, totalCapex: totalCapex ?? 0, totalOpex: totalOpex ?? 0,
    npv: npv ?? 0, irr: irr ?? 0, revenueStream,
    isFeasibilityStudy: isFeasibilityStudy ?? false, additionalInfo,
    timelines: timelines.length > 0 ? timelines : undefined,
    locationImageUrl, projectStructureImageUrl, projectFileUrl,
  };

  return {
    dto,
    rawFields: { concessionPeriodRaw, totalCapexRaw, totalOpexRaw, npvRaw, irrRaw, isFeasibilityStudyRaw },
    parsedFields: { concessionPeriod, totalCapex, totalOpex, npv, irr, isFeasibilityStudy },
  };
}

/** Re-validate a DTO after inline edits (no raw CSV fields needed). */
export function revalidateDto(dto: BatchUploadProjectRequest): string[] {
  const errors: string[] = [];

  validateEmail(errors, dto.ownerEmail, 'ownerEmail');
  validateRequiredText(errors, dto.name, 'Nama proyek');
  validateRequiredText(errors, dto.description, 'Deskripsi');
  validateRequiredText(errors, dto.sector, 'Sektor');
  validateRequiredText(errors, dto.location, 'Lokasi');
  validateRequiredText(errors, dto.valueProposition, 'Value proposition');
  validateRequiredText(errors, dto.ownerInstitution, 'Owner institution');
  validateRequiredText(errors, dto.contactPersonName, 'Nama kontak');
  validateEmail(errors, dto.contactPersonEmail, 'Email kontak');
  validatePhone(errors, dto.contactPersonPhone);
  validateRequiredText(errors, dto.cooperationModel, 'Model kerjasama');

  if (dto.concessionPeriod == null || dto.concessionPeriod <= 0) errors.push('Periode konsesi harus lebih dari 0.');

  validateRequiredText(errors, dto.assetReadiness, 'Kesiapan aset');
  validateRequiredText(errors, dto.governmentSupport, 'Dukungan pemerintah');
  if (dto.totalCapex != null && dto.totalCapex < 0) errors.push('Total CAPEX tidak boleh negatif.');
  if (dto.totalOpex != null && dto.totalOpex < 0) errors.push('Total OPEX tidak boleh negatif.');
  validateRequiredText(errors, dto.revenueStream, 'Revenue stream');

  if (dto.isFeasibilityStudy == null) errors.push('isFeasibilityStudy wajib diisi (true/false).');

  validateUrl(errors, dto.locationImageUrl ?? '', 'URL gambar lokasi proyek');
  validateUrl(errors, dto.projectStructureImageUrl ?? '', 'URL gambar struktur proyek');
  validateUrl(errors, dto.projectFileUrl ?? '', 'URL dokumen proyek');

  return errors;
}

export function parseAndValidateBulkProjectCsv(csvText: string): ParseResult<ParsedBulkProjectRow> {
  const pre = preValidateCsv(csvText, REQUIRED_FIELDS, headerRow =>
    mapHeadersWithAliases(headerRow, EXPECTED_HEADERS, HEADER_ALIASES)
  );
  if (!pre.ok) return { rows: [], globalErrors: pre.globalErrors };

  const { headerMap, dataRows } = pre;

  const allRows = parseCsvRows(csvText);
  const { rangeMap, descMap, slots } = buildTimelineIndexMaps(allRows[0]);

  const parsed: ParsedBulkProjectRow[] = dataRows.map((csvRow, idx) => {
    const rowNumber = idx + 2;
    const { dto, rawFields, parsedFields } = extractRowFields(csvRow, headerMap, rangeMap, descMap, slots);
    const errors = validateRow(
      dto,
      rawFields as { concessionPeriodRaw: string; totalCapexRaw: string; totalOpexRaw: string; npvRaw: string; irrRaw: string; isFeasibilityStudyRaw: string },
      parsedFields as { concessionPeriod: number | null; totalCapex: number | null; totalOpex: number | null; npv: number | null; irr: number | null; isFeasibilityStudy: boolean | null },
    );
    return { rowNumber, dto, errors };
  });

  // Duplicate name check
  const nameOccurrences = new Map<string, number>();
  parsed.forEach(item => {
    if (!item.dto.name) return;
    const key = item.dto.name.toLowerCase();
    nameOccurrences.set(key, (nameOccurrences.get(key) ?? 0) + 1);
  });
  parsed.forEach(item => {
    if (!item.dto.name) return;
    if ((nameOccurrences.get(item.dto.name.toLowerCase()) ?? 0) > 1) {
      item.errors.push('Nama proyek duplikat pada file CSV.');
    }
  });

  return { rows: parsed, globalErrors: [] };
}

export async function parseAndValidateBulkProjectFile(
  file: File
): Promise<ParseResult<ParsedBulkProjectRow>> {
  return parseFile(file, parseAndValidateBulkProjectCsv);
}

export function saveBulkProjectImportDraft(draft: BulkProjectImportDraft): void {
  saveDraft(STORAGE_KEY, draft);
}

export function getBulkProjectImportDraft(): BulkProjectImportDraft | null {
  return getDraft<BulkProjectImportDraft>(STORAGE_KEY);
}

export function clearBulkProjectImportDraft(): void {
  clearDraft(STORAGE_KEY);
}

export function resolveBackendErrorRow(
  backendRow: number,
  submittedRows: ParsedBulkProjectRow[]
): number | null {
  const fromOneBased = submittedRows[backendRow - 1];
  if (fromOneBased) return fromOneBased.rowNumber;

  const fromZeroBased = submittedRows[backendRow];
  if (fromZeroBased) return fromZeroBased.rowNumber;

  const direct = submittedRows.find(row => row.rowNumber === backendRow);
  if (direct) return direct.rowNumber;

  return null;
}

export function downloadImportLog(
  processedRows: ParsedBulkProjectRow[],
  backendMessagesByRow: Map<number, string[]>,
  unprocessedRows: ParsedBulkProjectRow[],
  sourceFileName: string,
): void {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines: string[] = [
    ['No', 'Nama Proyek', 'Email Pemilik', 'Status', 'Keterangan'].map(escape).join(','),
  ];

  let no = 1;
  for (const row of processedRows) {
    const errors = backendMessagesByRow.get(row.rowNumber);
    const status = errors ? 'Gagal' : 'Berhasil';
    const note = errors ? errors.join('; ') : '';
    lines.push([String(no++), row.dto.name, row.dto.ownerEmail, status, note].map(escape).join(','));
  }
  for (const row of unprocessedRows) {
    lines.push(
      [String(no++), row.dto.name, row.dto.ownerEmail, 'Tidak diproses', 'Koneksi terputus sebelum baris ini dikirim']
        .map(escape)
        .join(',')
    );
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const base = sourceFileName.replace(/\.[^/.]+$/, '');
  a.download = `import-log_${base}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildProjectTemplateCsv(): string {
  return [
    'ownerEmail',
    'name',
    'description',
    'sector',
    'location',
    'valueProposition',
    'ownerInstitution',
    'contactPersonName',
    'contactPersonEmail',
    'contactPersonPhone',
    'cooperationModel',
    'concessionPeriod',
    'assetReadiness',
    'governmentSupport',
    'totalCapex',
    'totalOpex',
    'npv',
    'irr',
    'revenueStream',
    'isFeasibilityStudy',
    'additionalInfo',
    'timeline1_timeRange',
    'timeline1_phaseDescription',
    'timeline2_timeRange',
    'timeline2_phaseDescription',
    'timeline3_timeRange',
    'timeline3_phaseDescription',
    'locationImageUrl',
    'projectStructureImageUrl',
    'projectFileUrl',
  ].join(',');
}
