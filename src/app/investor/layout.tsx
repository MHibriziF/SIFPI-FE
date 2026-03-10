import Navbar from '@/shared/components/layout/navbar';
import Footer from '@/shared/components/layout/footer';
import { FlashToast } from '@/shared/hooks/use-flash-toast';
import { requireRole } from '@/shared/lib/auth-guard';
import { getRoleHome } from '@/shared/lib/auth-guard';

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('INVESTOR');

  return (
    <>
      <Navbar
        variant="authenticated"
        dashboardHref={getRoleHome(session.role)}
      />
      <FlashToast />
      {children}
      <Footer />
    </>
  );
}
