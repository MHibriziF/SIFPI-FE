import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/button';
import BackgroundSection from '@/shared/components/home/background-section';
import AboutSection from '@/shared/components/home/about-section';
import LoginForm from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <>
      {/* Hero with login form */}
      <section className="relative flex items-center overflow-hidden" style={{ minHeight: 'calc(100dvh - 60px)' }}>
        <Image
          src="/png/home-bg-banner.jpeg"
          alt=""
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-linear-to-r from-black/50 to-black/50" />

        <div className="relative mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left — hero text */}
            <div className="flex-1 max-w-lg">
              <p
                className="text-secondary text-sm font-semibold uppercase tracking-widest mb-4"
                style={{ animation: 'fade-in-up 0.6s ease-out both' }}
              >
                Indonesia Project Facilitation Office
              </p>
              <h1
                className="text-4xl md:text-5xl font-bold text-white leading-tight"
                style={{ animation: 'fade-in-up 0.6s ease-out 0.12s both' }}
              >
                Infrastructure Project{' '}
                <span className="text-secondary">Facilitation</span> Office
              </h1>
              <p
                className="mt-6 text-lg text-white/75 leading-relaxed"
                style={{ animation: 'fade-in-up 0.6s ease-out 0.24s both' }}
              >
                Facilitating Indonesia infrastructure project investment to support sustainable and
                equitable growth.
              </p>
              <div
                className="mt-10 flex flex-wrap gap-4"
                style={{ animation: 'fade-in-up 0.6s ease-out 0.36s both' }}
              >
                <Button
                  asChild
                  size="lg"
                  variant="filled"
                  className="bg-primary/90 text-white hover:bg-secondary/85 focus-visible:ring-secondary/40"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outlined"
                  className="bg-primary/90 text-white hover:bg-secondary focus-visible:ring-white/30"
                >
                  <Link href="/projects">Project Catalogue</Link>
                </Button>
              </div>
            </div>

            {/* Right — login form */}
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>

      <BackgroundSection />
      <AboutSection />
    </>
  );
}
