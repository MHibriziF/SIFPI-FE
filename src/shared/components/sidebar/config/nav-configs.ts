import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Settings,
  BarChart3,
  ClipboardList,
  Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavSubItem {
  title: string;
  href: string;
}

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  subItems?: NavSubItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Trailing slash is absolute path, while non-trailing slash is relative to current path.
// For example, href: 'projects' will resolve to '/dashboard/projects' if current path is '/dashboard'.
// Add to consideration when defining hrefs in nav configs.
// Absolute paths are recommended

export const EXAMPLE_NAV: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { title: 'Dashboard', href: '/example/dashboard', icon: LayoutDashboard },
      {
        title: 'Projects',
        icon: FolderKanban,
        subItems: [
          { title: 'All Projects', href: '/example/dashboard/projects' },
          { title: 'Pending Review', href: '/example/dashboard/projects/pending' },
          { title: 'Approved', href: '/example/dashboard/projects/approved' },
          { title: 'Rejected', href: '/example/dashboard/projects/rejected' },
        ],
      },
      { title: 'Users', href: '/example/dashboard/users', icon: Users },
      { title: 'Reports', href: '/example/dashboard/reports', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [{ title: 'Settings', href: '/example/dashboard/settings', icon: Settings }],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      {
        title: 'Projects',
        href: '/dashboard/projects',
        icon: FolderKanban,
        subItems: [
          { title: 'All Projects', href: '/dashboard/projects' },
          { title: 'Pending Review', href: '/dashboard/projects/pending' },
          { title: 'Approved', href: '/dashboard/projects/approved' },
          { title: 'Rejected', href: '/dashboard/projects/rejected' },
        ],
      },
      { title: 'Users', href: '/dashboard/users', icon: Users },
      { title: 'Reports', href: '/dashboard/reports', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [{ title: 'Settings', href: '/dashboard/settings', icon: Settings }],
  },
];

export const OWNER_NAV: NavGroup[] = [
  {
    label: 'My Projects',
    items: [
      { title: 'Overview', href: '/owner/dashboard', icon: LayoutDashboard },
      { title: 'My Projects', href: '/owner/projects', icon: Building2 },
      { title: 'Submissions', href: '/owner/submissions', icon: ClipboardList },
    ],
  },
];

export const EXECUTIVE_NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/executive/dashboard', icon: LayoutDashboard },
      { title: 'Analytics', href: '/executive/analytics', icon: BarChart3 },
      { title: 'Reports', href: '/executive/reports', icon: FileText },
    ],
  },
];

export type NavKey = 'admin' | 'owner' | 'executive' | 'example';

export const NAV_CONFIGS: Record<NavKey, NavGroup[]> = {
  admin: ADMIN_NAV,
  owner: OWNER_NAV,
  executive: EXECUTIVE_NAV,
  example: EXAMPLE_NAV,
};
