import Image from 'next/image';
import ResetPasswordForm from '@/features/auth/components/reset-password-form';

export const metadata = {
  title: 'Reset Password | SIFPI',
};

export default function ResetPasswordPage() {
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
        <ResetPasswordForm />
      </div>
    </section>
  );
}
