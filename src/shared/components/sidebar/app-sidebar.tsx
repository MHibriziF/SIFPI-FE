'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, ChevronRight } from 'lucide-react';
import { Collapsible } from 'radix-ui';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from '@/shared/components/sidebar/sidebar';
import { NAV_CONFIGS, type NavItem, type NavKey } from '@/shared/components/sidebar/config/nav-configs';
import { logout } from '@/features/auth/service';
import { showToast } from '@/shared/components/toast';
import { setFlashToast } from '@/shared/hooks/use-flash-toast';
import { ApiError } from '@/shared/types/api';

interface AppSidebarProps {
  navKey: NavKey;
  user?: { name: string; role: string };
}

function isPathActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  if (pathname === href) return true;
  if (href === '/') return pathname === '/';
  return pathname.startsWith(`${href}/`);
}

function NavItemRow({ item, pathname }: { item: NavItem; pathname: string }) {
  const href = item.href ?? '';
  const isActive = isPathActive(pathname, href) || item.subItems?.some(s => isPathActive(pathname, s.href));

  if (item.subItems) {
    return (
      <Collapsible.Root
        asChild
        defaultOpen={isActive}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <Collapsible.Trigger asChild>
            <SidebarMenuButton isActive={isActive} tooltip={item.title}>
              <item.icon />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <SidebarMenuSub>
              {item.subItems.map(sub => (
                <SidebarMenuSubItem key={sub.href}>
                  <SidebarMenuSubButton asChild isActive={isPathActive(pathname, sub.href)}>
                    <Link href={sub.href}>{sub.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </Collapsible.Content>
        </SidebarMenuItem>
      </Collapsible.Root>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isPathActive(pathname, href)} tooltip={item.title}>
        <Link href={href}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AppSidebar({ navKey, user }: AppSidebarProps) {
  const navGroups = NAV_CONFIGS[navKey];
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      setFlashToast({ type: 'success', title: 'Logout berhasil', description: 'Sampai jumpa lagi!' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      showToast('danger', 'Logout gagal', message);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Sidebar collapsible="icon">
      {/* Logo — stacked */}
      <SidebarHeader className="py-5 px-8">
        <Link href="/" className="flex flex-col items-start gap-2">
          <Image
            src="/png/ipfo-logo.png"
            alt="IPFO"
            width={100}
            height={100}
            className="shrink-0"
          />
          <div className="flex text-center group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-sm leading-tight mr-4">SIFPI</p>
            <p className="text-xs opacity-60 mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </SidebarHeader>

      <div aria-hidden className="h-px bg-sidebar-border mx-2" />

      <SidebarContent>
        {navGroups.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => (
                  <NavItemRow key={item.title} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <SidebarSeparator className="mb-2" />

        {/* User info */}
        {user && (
          <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold leading-tight">{user.name}</p>
            <p className="text-xs opacity-60 mt-0.5">{user.role}</p>
          </div>
        )}

        {/* Logout */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="text-danger hover:bg-danger/15 hover:text-danger"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut />
              <span>{isLoggingOut ? 'Memproses...' : 'Logout'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
