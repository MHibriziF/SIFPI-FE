import { cookies } from 'next/headers';
import Navbar from '@/shared/components/layout/navbar';
import Footer from '@/shared/components/layout/footer';
import ErrorPage from '@/shared/components/error-page';

export default async function NotFound() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has('SIFPI_TOKEN');

  return (
    <>
      <Navbar variant={hasToken ? 'authenticated' : 'public'} />
      <ErrorPage code={404} />
      <Footer />
    </>
  );
}
