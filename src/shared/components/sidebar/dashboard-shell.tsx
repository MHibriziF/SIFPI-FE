import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/components/sidebar/sidebar';
import AppSidebar from '@/shared/components/sidebar/app-sidebar';
import type { NavKey } from '@/shared/components/sidebar/config/nav-configs';

interface DashboardShellProps {
  children: React.ReactNode;
  navKey: NavKey;
  user?: { name: string; role: string };
  heading?: string;
  subheading?: string;
}

const SIDEBAR_THEME = {
  '--sidebar': '#002855',
  '--sidebar-foreground': '#ffffff',
  '--sidebar-accent': 'rgba(255,255,255,0.10)',
  '--sidebar-accent-foreground': '#ffffff',
  '--sidebar-border': 'rgba(255,255,255,0.10)',
  '--sidebar-primary': 'rgba(255,255,255,0.15)',
  '--sidebar-primary-foreground': '#ffffff',
  '--sidebar-ring': 'rgba(255,255,255,0.25)',
} as React.CSSProperties;

export default function DashboardShell({
  children,
  navKey,
  user,
  heading = 'IPFO Admin',
  subheading,
}: DashboardShellProps) {
  return (
    <SidebarProvider style={SIDEBAR_THEME}>
      <AppSidebar navKey={navKey} user={user} />
      <SidebarInset className="bg-white">
        <header className="flex h-14 items-center gap-3 border-b px-4 sticky top-0 bg-grey z-10">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          {(heading || subheading) && (
            <div className="flex min-w-0 flex-col justify-center">
              {heading ? <span className="truncate text-sm font-medium text-primary">{heading}</span> : null}
              {subheading ? <span className="truncate text-xs text-gray-600">{subheading}</span> : null}
            </div>
          )}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
