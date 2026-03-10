'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/shared/components/button';
import { logout } from '@/features/auth/services';
import { ApiError } from '@/shared/types/api';
import { showToast } from '@/shared/components/toast';

export type NavbarVariant = 'public' | 'authenticated';

interface NavbarProps {
  variant?: NavbarVariant;
  dashboardHref?: string;
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/news', label: 'News' },
  { href: '/resources', label: 'Resources' },
];

export default function Navbar({ variant = 'public', dashboardHref }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinkClass = (href: string) =>
    `text-sm font-medium px-2 py-1 rounded-md transition-colors duration-200 ${
      pathname === href
        ? 'text-secondary underline underline-offset-4'
        : 'text-white hover:text-secondary-light'
    }`;

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      showToast('success', 'Logout berhasil', 'Sampai jumpa lagi!');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.log('Logging out...', err);
      const message =
        err instanceof ApiError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      showToast('danger', 'Logout gagal', message);
    } finally {
      setIsLoggingOut(false);
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-primary/85 backdrop-blur-md px-6 py-3">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="block shrink-0">
          <Image src="/png/ipfo-logo.png" alt="IPFO Logo" width={120} height={36} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link href={link.href} className={navLinkClass(link.href)}>
                  {link.label}
                </Link>
              </li>
            ))}

            {variant === 'public' ? (
              <>
                <li>
                  <Link href="/login" className={navLinkClass('/login')}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className={navLinkClass('/register')}>
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/inquiries" className={navLinkClass('/inquiries')}>
                    Inquiries
                  </Link>
                </li>
                <li>
                  {dashboardHref && (
                    <Link href={dashboardHref} className={navLinkClass(dashboardHref)}>
                      Dashboard
                    </Link> 
                  )}
                </li>
                <li>
                  <Link href="/profile" className={navLinkClass('/profile')}>
                    Update Profile
                  </Link>
                </li>
                <li>
                  <Button
                    type="button"
                    className="bg-danger text-white border-none"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? 'Memproses...' : 'Logout'}
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden mt-3 border-t border-white/20 pt-3">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block w-full ${navLinkClass(link.href)}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="border-t border-white/20 mt-2 pt-2" />

            {variant === 'public' ? (
              <>
                <li>
                  <Link
                    href="/login"
                    className={`block ${navLinkClass('/login')}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <span className={`block ${navLinkClass('/register')}`}>Register</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/inquiries"
                    className={`block ${navLinkClass('/inquiries')}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Inquiries
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className={`block ${navLinkClass('/profile')}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Update Profile
                  </Link>
                </li>
                <li>
                  <Button
                    type="button"
                    className="bg-danger text-white border-none w-full mt-1"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? 'Memproses...' : 'Logout'}
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
