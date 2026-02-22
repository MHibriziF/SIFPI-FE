import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/button';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex items-center overflow-hidden"
      style={{ minHeight: 'calc(100dvh - 60px)' }}
    >
      {/* Background image — sits behind the fixed navbar thanks to z-index */}
      <Image
        src="/png/home-bg-banner.jpeg"
        alt=""
        fill
        priority
        className="object-cover object-top"
        sizes="100vw"
      />

      {/* Dark gradient overlay — heavier on the left where text sits */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/80 via-primary/70 to-primary/30" />

      {/* Content — top padding accounts for the fixed navbar height */}
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <p
            className="text-secondary text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ animation: 'fade-in-up 0.6s ease-out both' }}
          >
            Indonesia Project Facilitation Office
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
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
              className="bg-secondary text-primary hover:bg-secondary/85 focus-visible:ring-secondary/40"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outlined"
              className="border-white/40 text-white hover:bg-white/10 focus-visible:ring-white/30"
            >
              <Link href="/projects">Project Catalogue</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
