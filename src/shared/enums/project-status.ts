export enum ProjectStatus {
  DRAFT = 'DRAFT',
  DIAJUKAN = 'DIAJUKAN',
  IN_REVIEW = 'IN_REVIEW',
  PERBAIKAN_DATA = 'PERBAIKAN_DATA',
  TERVERIFIKASI = 'TERVERIFIKASI',
  TERPUBLIKASI = 'TERPUBLIKASI',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'dibuat',
  [ProjectStatus.DIAJUKAN]: 'diajukan',
  [ProjectStatus.IN_REVIEW]: 'in review',
  [ProjectStatus.PERBAIKAN_DATA]: 'perbaikan data',
  [ProjectStatus.TERVERIFIKASI]: 'terverifikasi',
  [ProjectStatus.TERPUBLIKASI]: 'terpublikasi',
};

export const PROJECT_STATUS_OPTIONS = Object.values(ProjectStatus).map(value => ({
  value,
  label: PROJECT_STATUS_LABELS[value],
}));

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

export function parseProjectStatus(value: unknown): ProjectStatus | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const normalized = value.trim().toUpperCase().replaceAll('-', '_').replaceAll(' ', '_');
  const matched = Object.values(ProjectStatus).find(status => status === normalized);
  return matched ?? null;
}

export function projectStatusLabel(value: unknown): string {
  const parsed = parseProjectStatus(value);
  if (parsed) return PROJECT_STATUS_LABELS[parsed];
  if (typeof value !== 'string' || value.trim().length === 0) return '-';
  return titleCase(value.trim().toUpperCase().replaceAll('-', '_').replaceAll(' ', '_'));
}
