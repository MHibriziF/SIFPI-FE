import Image from 'next/image';
import ForgotPasswordForm from '@/features/auth/components/forgot-password-form';

export const metadata = {
  title: 'Lupa Password | SIFPI',
};

export default function ForgotPasswordPage() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden min-h-[calc(100dvh-134px)] px-6 py-12">
      {/* Background image */}
      <Image
        src="/png/home-bg-banner.jpeg"
        alt=""
        fill
        priority
        className="object-cover object-top"
        sizes="100vw"
      />
      {/* Dark overlay — 70% opacity matching Figma design */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Centered form card */}
      <div className="relative z-10 w-full flex justify-center">
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
