import Footer from '@/shared/components/layout/footer';
import DashboardShell from '@/shared/components/sidebar/dashboard-shell';
import { FlashToast } from '@/shared/hooks/use-flash-toast';
import { requireRole } from '@/shared/lib/auth-guard';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('ADMIN');

  return (
    <DashboardShell
      navKey="admin"
      user={{ name: session.name, role: session.role }}
      heading=""
    >
      <FlashToast />
      {children}
      <Footer />
    </DashboardShell>
  );
}
