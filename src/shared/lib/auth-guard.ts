import 'server-only';
import { redirect, notFound } from 'next/navigation';
import { getSession } from './session';
import type { AuthResponse } from '@/features/auth/types';
import { cache } from 'react';
import type { ReactNode } from 'react';

export type Resource = 'PROJECT' | 'NEWS' | 'INQUIRY' | 'USER' | 'VERIFICATION';
export type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
const KNOWN_ROLES = new Set(['ADMIN', 'OWNER', 'INVESTOR', 'EXECUTIVE']);

const ROLE_HOME: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  OWNER: '/project-owner/dashboard',
  INVESTOR: '/catalogue',
  EXECUTIVE: '/admin/insights',
};

/** Maps a role to its home page. Custom roles fall back to /dashboard. */
export function getRoleHome(role: string | null): string {
  if (!role) return '/login';
  return ROLE_HOME[role] ?? '/dashboard';
}

/**
 * Server-side route guard for known roles.
 * Redirects to /login if unauthenticated.
 * Redirects to the user's own home if their role is not in the allowed list.
 * Returns the session on success.
 */
export async function requireRole(...allowed: string[]): Promise<AuthResponse> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!allowed.includes(session.role)) redirect(getRoleHome(session.role));
  return session;
}

/**
 * Server-side route guard for custom (non-standard) roles.
 * Redirects to /login if unauthenticated.
 * Redirects known roles (ADMIN, OWNER, INVESTOR, EXECUTIVE) to their own home.
 * Returns the session on success.
 */
export async function requireCustomRole(): Promise<AuthResponse> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (KNOWN_ROLES.has(session.role)) redirect(getRoleHome(session.role));
  return session;
}

export const getRole = cache(async (): Promise<string | null> => {
  const session = await getSession();
  return session?.role || null;
});

export function hasPermission(
  session: AuthResponse | null | undefined,
  resource: Resource,
  action: Action
): boolean {
  return session?.permissions[resource]?.includes(action) ?? false;
}

/**
 * Wraps a server page component with a permission check — the Next.js equivalent
 * of Spring Boot's @PreAuthorize.
 *
 * Redirects to /login if unauthenticated.
 * Returns 404 if the user lacks the required permission.
 * Injects `session` as the second argument to the page on success.
 *
 * @example
 * export default withPermission('PROJECT', 'READ')(async (props, session) => {
 *   return <ProjectList />;
 * });
 */
export function withPermission(resource: Resource, action: Action) {
  return function <P extends object>(
    Page: (props: P, session: AuthResponse) => Promise<ReactNode>
  ) {
    return async function (props: P): Promise<ReactNode> {
      const session = await getSession();
      if (!session) redirect('/login');
      if (!hasPermission(session, resource, action)) notFound();
      return Page(props, session);
    };
  };
}
