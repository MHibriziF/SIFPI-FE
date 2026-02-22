import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import '@/styles/globals.css';
import Navbar from '@/shared/components/layout/navbar';
import Footer from '@/shared/components/layout/footer';

export const metadata: Metadata = {
  title: 'IPFO SIFPI',
  description: 'Sistem Informasi Fasilitasi Proyek Infrastruktur. Facilitating Indonesia infrastructure project investment to support sustainable and equitable growth. Access infrastructure projects and investment opportunities.',
  keywords: ['IPFO', 'SIFPI', 'infrastructure projects', 
    'investment opportunities', 'Indonesia', 'sustainable growth', 
    'equitable growth', 'project facilitation', 'infrastructure development', 
    'investment facilitation', 'project information system', 'infrastructure investment', 
    'project database', 'investment database', 'project listing', 'investment listing',
    'PPP projects', 'government projects', 'private projects', 'infrastructure news',],
  authors: [{ name: 'Propensi Fasilkom UI - Propen A+'}],
  openGraph: {
    title: 'IPFO SIFPI',
    description: 'Sistem Informasi Fasilitasi Proyek Infrastruktur. Facilitating Indonesia infrastructure project investment to support sustainable and equitable growth. Access infrastructure projects and investment opportunities.',
    url: 'https://sifpi.up.railway.app/',
    siteName: 'IPFO SIFPI',

  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Navbar />
        {children}
        <Toaster position="top-center" style={{ '--width': '480px' } as React.CSSProperties} />
        <Footer />
      </body>
    </html>
  );
}
