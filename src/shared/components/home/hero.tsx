import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/button';
import { cn } from '@/shared/lib/utils';

export default function Hero({
  side = false,
  className,
}: {
  side?: boolean;
  className?: string;
}) {
  return (
    <section
      id="home"
      className={cn(
        'relative flex items-center overflow-hidden',
        side && 'flex-1 self-stretch',
        className
      )}
      style={{ minHeight: side ? '50dvh' : 'calc(100dvh - 60px)' }}
    >
      {/* Background image */}
      <Image
        src="/png/home-bg-banner.jpeg"
        alt=""
        fill
        priority
        className="object-cover object-top"
        sizes={side ? '50vw' : '100vw'}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/40" />

      {/* Content */}
      <div
        className={cn(
          'relative py-16',
          side ? 'hidden lg:block w-full px-6' : 'mx-auto max-w-6xl px-6'
        )}
      >
        <h1
          className={cn(
            'font-bold text-white leading-tight text-center text-[clamp(1rem,3vw,2.5rem)]',
            side && 'lg:text-[clamp(1rem,1.5vw,2rem)]'
          )}
          style={{ animation: 'fade-in-up 0.6s ease-out 0.12s both' }}
        >
          INFRASTRUCTURE PROJECT FACILITATION OFFICE
        </h1>
        <p
          className="mt-6 text-lg text-white/75 leading-relaxed text-center"
          style={{ animation: 'fade-in-up 0.6s ease-out 0.24s both' }}
        >
          Facilitating Indonesia infrastructure project investment to support sustainable and
          equitable growth.
        </p>
        <div
          className="mt-10 flex flex-wrap gap-4 justify-center"
          style={{ animation: 'fade-in-up 0.6s ease-out 0.36s both' }}
        >
          <Button
            asChild
            size="xl"
            variant="filled"
            className="bg-primary/90 text-white hover:bg-secondary/85 focus-visible:ring-secondary/40"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button
            asChild
            size="xl"
            variant="outlined"
            className="bg-primary/90 text-white hover:bg-secondary focus-visible:ring-white/30"
          >
            <Link href="/projects">Project Catalogue</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
