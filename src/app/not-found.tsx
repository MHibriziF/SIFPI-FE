import Navbar from '@/shared/components/layout/navbar';
import Footer from '@/shared/components/layout/footer';
import ErrorPage from '@/shared/components/error-page';
import { getRole, getRoleHome } from '@/shared/lib/auth-guard';

export default async function NotFound() {
  const role = await getRole();

  return (
    <>
      <Navbar
        variant={role ? 'authenticated' : 'public'}
        dashboardHref={getRoleHome(role)}
      />
      <ErrorPage code={404} />
      <Footer />
    </>
  );
}
