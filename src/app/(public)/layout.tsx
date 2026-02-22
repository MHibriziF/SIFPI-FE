import Navbar from '@/shared/components/layout/navbar';
import Footer from '@/shared/components/layout/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
