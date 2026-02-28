import { cookies } from 'next/headers';
import Navbar from '@/shared/components/layout/navbar';
import Footer from '@/shared/components/layout/footer';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has('SIFPI_TOKEN');

  return (
    <>
      <Navbar variant={hasToken ? 'authenticated' : 'public'} />
      {children}
      <Footer />
    </>
  );
}
