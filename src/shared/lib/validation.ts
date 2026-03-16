// ─── Shared form validation helpers ──────────────────────────────────────────
// Used across profile update forms and auth forms.

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email wajib diisi';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid';
}

export const PHONE_REGEX = /^[+]?\d[\d\s-]{6,18}\d$/;

export function validatePhone(value: string): string | undefined {
  if (!value.trim()) return 'Nomor telepon wajib diisi';
  if (value.length > 20) return 'Nomor telepon maksimal 20 karakter';
  if (!PHONE_REGEX.test(value.trim())) return 'Format nomor telepon tidak valid';
}
