import { cache } from 'react';
import { cookies } from 'next/headers';
import type { AuthResponse } from '@/features/auth/types';

/**
 * Fetches the current user from /api/me.
 * Wrapped in React cache() so multiple server components in the same
 * request share one fetch instead of making duplicate calls.
 *
 * Returns null if unauthenticated or the request fails.
 */
export const getSession = cache(async (): Promise<AuthResponse | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('SIFPI_TOKEN')?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
      headers: { Cookie: `SIFPI_TOKEN=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data as AuthResponse;
  } catch {
    return null;
  }
});
