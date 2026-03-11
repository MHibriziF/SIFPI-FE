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
const PHONE_REGEX = /^\+?[0-9\-]{8,20}$/;
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

export function parseAndValidateBulkProjectCsv(csvText: string): ParseResult<ParsedBulkProjectRow> {
  const pre = preValidateCsv(csvText, REQUIRED_FIELDS, headerRow =>
    mapHeadersWithAliases(headerRow, EXPECTED_HEADERS, HEADER_ALIASES)
  );
  if (!pre.ok) return { rows: [], globalErrors: pre.globalErrors };

  const { headerMap, dataRows } = pre;

  // Build timeline column index maps from the raw header row
  const allRows = parseCsvRows(csvText);
  const { rangeMap, descMap, slots } = buildTimelineIndexMaps(allRows[0]);

  const parsed: ParsedBulkProjectRow[] = dataRows.map((csvRow, idx) => {
    const rowNumber = idx + 2;
    const errors: string[] = [];

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

    // Parse timeline entries (all slots detected in the header)
    const timelines: ProjectTimeline[] = [];
    for (const n of slots) {
      const timeRange = rangeMap[n] != null ? getCell(csvRow, rangeMap[n]) : '';
      const phaseDescription = descMap[n] != null ? getCell(csvRow, descMap[n]) : '';
      if (timeRange || phaseDescription) {
        timelines.push({ timeRange, phaseDescription });
      }
    }

    // Parse numbers
    const concessionPeriod = parseInteger(concessionPeriodRaw);
    const totalCapex = parseNumber(totalCapexRaw);
    const totalOpex = parseNumber(totalOpexRaw);
    const npv = parseNumber(npvRaw);
    const irr = parseNumber(irrRaw);
    const isFeasibilityStudy = parseBoolean(isFeasibilityStudyRaw);

    const dto: BatchUploadProjectRequest = {
      ownerEmail,
      name,
      description,
      sector,
      location,
      valueProposition,
      ownerInstitution,
      contactPersonName,
      contactPersonEmail,
      contactPersonPhone,
      cooperationModel,
      concessionPeriod: concessionPeriod ?? 0,
      assetReadiness,
      governmentSupport,
      totalCapex: totalCapex ?? 0,
      totalOpex: totalOpex ?? 0,
      npv: npv ?? 0,
      irr: irr ?? 0,
      revenueStream,
      isFeasibilityStudy: isFeasibilityStudy ?? false,
      additionalInfo,
      timelines: timelines.length > 0 ? timelines : undefined,
      locationImageUrl,
      projectStructureImageUrl,
      projectFileUrl,
    };

    // Validation
    if (!ownerEmail) errors.push('ownerEmail wajib diisi.');
    else if (!EMAIL_REGEX.test(ownerEmail)) errors.push('Format ownerEmail tidak valid.');

    if (!name) errors.push('Nama proyek wajib diisi.');
    if (!description) errors.push('Deskripsi wajib diisi.');
    if (!sector) errors.push('Sektor wajib diisi.');
    if (!location) errors.push('Lokasi wajib diisi.');
    if (!valueProposition) errors.push('Value proposition wajib diisi.');
    if (!ownerInstitution) errors.push('Owner institution wajib diisi.');
    if (!contactPersonName) errors.push('Nama kontak wajib diisi.');

    if (!contactPersonEmail) errors.push('Email kontak wajib diisi.');
    else if (!EMAIL_REGEX.test(contactPersonEmail)) errors.push('Format email kontak tidak valid.');

    if (!contactPersonPhone) errors.push('Telepon kontak wajib diisi.');
    else if (!PHONE_REGEX.test(contactPersonPhone.replace(/[\s()-]/g, '')))
      errors.push('Format telepon kontak tidak valid.');

    if (!cooperationModel) errors.push('Model kerjasama wajib diisi.');

    if (!concessionPeriodRaw) errors.push('Periode konsesi wajib diisi.');
    else if (concessionPeriod === null)
      errors.push('Format periode konsesi tidak valid (harus angka).');
    else if (concessionPeriod <= 0) errors.push('Periode konsesi harus lebih dari 0.');

    if (!assetReadiness) errors.push('Kesiapan aset wajib diisi.');
    if (!governmentSupport) errors.push('Dukungan pemerintah wajib diisi.');

    if (!totalCapexRaw) errors.push('Total CAPEX wajib diisi.');
    else if (totalCapex === null) errors.push('Format total CAPEX tidak valid.');
    else if (totalCapex < 0) errors.push('Total CAPEX tidak boleh negatif.');

    if (!totalOpexRaw) errors.push('Total OPEX wajib diisi.');
    else if (totalOpex === null) errors.push('Format total OPEX tidak valid.');
    else if (totalOpex < 0) errors.push('Total OPEX tidak boleh negatif.');

    if (!npvRaw) errors.push('NPV wajib diisi.');
    else if (npv === null) errors.push('Format NPV tidak valid.');

    if (!irrRaw) errors.push('IRR wajib diisi.');
    else if (irr === null) errors.push('Format IRR tidak valid.');

    if (!revenueStream) errors.push('Revenue stream wajib diisi.');

    if (!isFeasibilityStudyRaw) errors.push('isFeasibilityStudy wajib diisi (true/false).');
    else if (isFeasibilityStudy === null)
      errors.push('isFeasibilityStudy harus bernilai true/false.');

    if (!locationImageUrl) errors.push('URL gambar lokasi proyek wajib diisi.');
    else if (!URL_REGEX.test(locationImageUrl)) errors.push('Format locationImageUrl tidak valid.');

    if (!projectStructureImageUrl) errors.push('URL gambar struktur proyek wajib diisi.');
    else if (!URL_REGEX.test(projectStructureImageUrl))
      errors.push('Format projectStructureImageUrl tidak valid.');

    if (!projectFileUrl) errors.push('URL dokumen proyek wajib diisi.');
    else if (!URL_REGEX.test(projectFileUrl)) errors.push('Format projectFileUrl tidak valid.');

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
