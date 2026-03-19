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

/** Indonesian-format phone: must start with +62 or 0, followed by 9–12 digits. */
export const INDONESIA_PHONE_REGEX = /^(\+62|0)[0-9]{9,12}$/;

export function validateIndonesianPhone(value: string): string | undefined {
  if (!value.trim()) return 'No. Telepon wajib diisi';
  if (!INDONESIA_PHONE_REGEX.test(value.replace(/\s/g, '')))
    return 'No. Telepon tidak valid';
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password wajib diisi';
  if (value.length < 8) return 'Password minimal 8 karakter';
}
