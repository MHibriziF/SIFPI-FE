import DashboardShell from '@/shared/components/sidebar/dashboard-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navKey="example"
      user={{ name: 'Admin', role: 'Admin' }}
      heading="IPFO Admin"
    >
      {children}
    </DashboardShell>
  );
}
