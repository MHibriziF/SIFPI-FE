export enum ProjectStatus {
  DRAFT = 'DRAFT',
  DIAJUKAN = 'DIAJUKAN',
  IN_REVIEW = 'IN_REVIEW',
  PERBAIKAN_DATA = 'PERBAIKAN_DATA',
  TERVERIFIKASI = 'TERVERIFIKASI',
  TERPUBLIKASI = 'TERPUBLIKASI',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Dibuat',
  [ProjectStatus.DIAJUKAN]: 'Diajukan',
  [ProjectStatus.IN_REVIEW]: 'In review',
  [ProjectStatus.PERBAIKAN_DATA]: 'Perbaikan data',
  [ProjectStatus.TERVERIFIKASI]: 'Terverifikasi',
  [ProjectStatus.TERPUBLIKASI]: 'Terpublikasi',
};

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

export const PROJECT_STATUS_OPTIONS = Object.values(ProjectStatus).map(value => ({
  value,
  label: toTitleCase(PROJECT_STATUS_LABELS[value]),
}));

export function parseProjectStatus(value: unknown): ProjectStatus | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const normalized = value.trim().toUpperCase().replaceAll('-', '_').replaceAll(' ', '_');
  const matched = Object.values(ProjectStatus).find(status => status === normalized);
  return matched ?? null;
}

export function projectStatusLabel(value: unknown): string {
  const parsed = parseProjectStatus(value);
  if (parsed) return toTitleCase(PROJECT_STATUS_LABELS[parsed]);
  if (typeof value !== 'string' || value.trim().length === 0) return '-';
  return toTitleCase(value.trim());
}
