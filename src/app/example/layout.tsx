import DashboardShell from '@/shared/components/sidebar/dashboard-shell';
import { requireRole } from '@/shared/lib/auth-guard';

export default async function ExampleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('RANDOM');

  return (
    <DashboardShell
      navKey="example"
      user={{ name: session.name, role: session.role }}
      heading="IPFO Admin"
    >
      {children}
    </DashboardShell>
  );
}
