import Footer from '@/shared/components/layout/footer';
import DashboardShell from '@/shared/components/sidebar/dashboard-shell';
import { FlashToast } from '@/shared/hooks/use-flash-toast';
import { requireRole } from '@/shared/lib/auth-guard';

export default async function ProjectOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('PROJECT_OWNER');

  return (
    <DashboardShell
      navKey="owner"
      user={{ name: session.name, role: session.role }}
      heading=""
      subheading=""
    >
      <FlashToast />
      {children}
      <Footer />
    </DashboardShell>
  );
}
