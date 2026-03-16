import DashboardShell from '@/shared/components/sidebar/dashboard-shell';
import { FlashToast } from '@/shared/hooks/use-flash-toast';
import { requireCustomRole } from '@/shared/lib/auth-guard';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomRole();

  return (
    <DashboardShell
      navKey="dashboard"
      user={{ name: session.name, role: session.role }}
      heading="Dashboard"
    >
      <FlashToast />
      {children}
    </DashboardShell>
  );
}
