import Hero from '@/shared/components/home/hero';
import BackgroundSection from '@/shared/components/home/background-section';
import AboutSection from '@/shared/components/home/about-section';
import LoginForm from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <>
      <div
        className="relative lg:flex"
        style={{ minHeight: 'calc(100dvh - 60px)' }}
      >
        {/* Mobile: full background. Desktop: side panel */}
        <Hero side className="absolute inset-0 lg:relative lg:inset-auto" />

        {/* Mobile: overlaid centered on hero. Desktop: white right panel */}
        <div className="relative z-10 w-full min-h-[calc(100dvh-60px)] flex items-center justify-center px-6 py-16 lg:min-h-0 lg:w-auto lg:flex-[0.75] lg:bg-white lg:px-12">
          <LoginForm />
        </div>
      </div>

      <BackgroundSection />
      <AboutSection />
    </>
  );
}
