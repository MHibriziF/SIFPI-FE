'use client';

import { useState } from 'react';
import Hero from '@/shared/components/home/hero';
import BackgroundSection from '@/shared/components/home/background-section';
import AboutSection from '@/shared/components/home/about-section';
import { FlashToast } from '@/shared/hooks/use-flash-toast';
import RegisterOwnerForm from '@/features/auth/components/register-owner-form';
import RegisterInvestorForm from '@/features/auth/components/register-investor-form';
import SuccessModal from '@/features/auth/components/register-succes-modal';

type RegisterType = 'owner' | 'investor';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<RegisterType>('owner');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  function handleSuccess(email: string) {
    setSuccessEmail(email);
    setShowSuccess(true);
  }

  return (
    <>
      <FlashToast />
      <SuccessModal isOpen={showSuccess} userType={selectedRole} email={successEmail} />

      <div
        className="relative flex items-start justify-center py-12 px-4"
        style={{ minHeight: 'calc(100dvh - 60px)' }}
      >
        {/* Full background Hero without content */}
        <Hero hideContent className="absolute inset-0" />

        {/* Register Card */}
        <div
          className="relative z-10 w-full max-w-xl rounded-xl overflow-hidden shadow-2xl bg-white"
          style={{ animation: 'fade-in-up 0.6s ease-out 0.2s both' }}
        >
          {/* Header */}
          <div className="bg-primary px-8 py-5">
            <h2 className="text-lg font-semibold text-white text-center">Register</h2>
          </div>

          {/* Role Toggle — inside white area */}
          <div className="bg-white px-8 pt-6 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole('owner')}
                className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 border-2 leading-snug
                  ${selectedRole === 'owner'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-primary border-primary/30 hover:border-primary/60'
                  }`}
              >
                Daftar sebagai<br />Project Owner
              </button>
              <button
                onClick={() => setSelectedRole('investor')}
                className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 border-2 leading-snug
                  ${selectedRole === 'investor'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-primary border-primary/30 hover:border-primary/60'
                  }`}
              >
                Daftar sebagai<br />Investor
              </button>
            </div>
          </div>

          {/* Form Content */}
          {selectedRole === 'owner' && (
            <RegisterOwnerForm onSuccess={handleSuccess} />
          )}
          {selectedRole === 'investor' && (
            <RegisterInvestorForm onSuccess={handleSuccess} />
          )}
        </div>
      </div>

      <BackgroundSection />
      <AboutSection />
    </>
  );
}