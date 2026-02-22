import Hero from '@/shared/components/home/hero';
import BackgroundSection from '@/shared/components/home/background-section';
import AboutSection from '@/shared/components/home/about-section';
import Footer from '@/shared/components/layout/footer';

export default function Home() {
  return (
    <>
      <Hero />
      <BackgroundSection />
      <AboutSection />
    </>
  );
}
