import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Infrastructure Project Facilitation Office | IPFO | SIFPI',
  description: 'Sistem Informasi Fasilitasi Proyek Infrastruktur. Facilitating Indonesia infrastructure project investment to support sustainable and equitable growth. Access infrastructure projects and investment opportunities.',
  keywords: ['IPFO', 'SIFPI', 'infrastructure projects',
    'investment opportunities', 'Indonesia', 'sustainable growth',
    'equitable growth', 'project facilitation', 'infrastructure development',
    'investment facilitation', 'project information system', 'infrastructure investment',
    'project database', 'investment database', 'project listing', 'investment listing',
    'PPP projects', 'government projects', 'private projects', 'infrastructure news',],
  authors: [{ name: 'Propensi Fasilkom UI - Propen A+' }],
  openGraph: {
    title: 'Infrastructure Project Facilitation Office | IPFO | SIFPI',
    description: 'Sistem Informasi Fasilitasi Proyek Infrastruktur. Facilitating Indonesia infrastructure project investment to support sustainable and equitable growth. Access infrastructure projects and investment opportunities.',
    url: 'https://sifpi.up.railway.app/',
    siteName: 'IPFO - SIFPI',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
        <Toaster position="top-center" style={{ '--width': '480px' } as React.CSSProperties} />
      </body>
    </html>
  );
}
