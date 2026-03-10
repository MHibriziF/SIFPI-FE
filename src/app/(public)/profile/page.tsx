import { redirect } from 'next/navigation';
import { getSession } from '@/shared/lib/session';

export const metadata = {
  title: 'Update Profile | SIFPI',
};

/** Maps every known role to its dedicated profile route. */
function getProfileRedirect(role: string): string {
  switch (role) {
    case 'ADMIN':          return '/admin/profile';
    case 'EXECUTIVE':      return '/executive/profile';
    case 'OWNER':          return '/project-owner/profile';
    case 'PROJECT_OWNER':  return '/project-owner/profile';
    case 'INVESTOR':       return '/investor/profile';
    default:               return '/investor/profile';
  }
}

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  redirect(getProfileRedirect(session.role));
}
