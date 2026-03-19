import Footer from '@/shared/components/layout/footer';
import DashboardShell from '@/shared/components/sidebar/dashboard-shell';
import { FlashToast } from '@/shared/hooks/use-flash-toast';
import { requireRole } from '@/shared/lib/auth-guard';

export default async function ExecutiveLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireRole('EXECUTIVE');

  return (
    <DashboardShell
      navKey="executive"
      user={{ name: session.name, role: session.role }}
      heading=""
    >
      <FlashToast />
      {children}
      <Footer />
    </DashboardShell>
  );
}
