const ROLE_HOME: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  PROJECT_OWNER: '/project-owner/dashboard',
  INVESTOR: '/projects',
  EXECUTIVE: '/admin/insights',
};

/** Maps a role to its home page. Unknown roles fall back to /dashboard. */
export function getRoleHome(role: string | null): string {
  if (!role) return '/login';
  return ROLE_HOME[role] ?? '/dashboard';
}
