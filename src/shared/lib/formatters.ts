export function formatIDR(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatConcession(years: number | null | undefined): string {
  if (years == null) return '—';
  return `${years} Tahun`;
}

export function safeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('/')) return url;
  return '#';
}
