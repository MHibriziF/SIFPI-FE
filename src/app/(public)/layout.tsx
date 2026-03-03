import Navbar from '@/shared/components/layout/navbar';
import Footer from '@/shared/components/layout/footer';
import { getRole, getRoleHome } from '@/shared/lib/auth-guard';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole();

  return (
    <>
      <Navbar
        variant={role ? 'authenticated' : 'public'}
        dashboardHref={getRoleHome(role)}
      />
      {children}
      <Footer />
    </>
  );
}
