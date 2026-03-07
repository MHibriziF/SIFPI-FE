'use client';

import SharedSuccessModal from '@/shared/components/success-modal';

interface SuccessModalProps {
  isOpen: boolean;
  userType: 'owner' | 'investor';
  email: string;
}

export default function SuccessModal({ isOpen, userType, email }: SuccessModalProps) {
  const userLabel = userType === 'owner' ? 'Project Owner' : 'Investor';

  return (
    <SharedSuccessModal
      isOpen={isOpen}
      title="Akun berhasil dibuat!"
      message={`Akun ${userLabel} berhasil dibuat! Silahkan cek email anda untuk verifikasi akun.`}
      actionText="OK"
      actionHref="/login"
    />
  );
}