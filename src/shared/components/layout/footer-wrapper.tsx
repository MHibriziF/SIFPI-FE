'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

const HIDE_ON = ['/dashboard', '/admin'];

export default function FooterWrapper() {
  const pathname = usePathname() ?? '/';
  if (HIDE_ON.some(r => pathname.startsWith(r))) return null;
  return <Footer />;
}
