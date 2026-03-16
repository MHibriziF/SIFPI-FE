'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { TextInput } from '@/shared/components/form-fields';
import { showToast } from '@/shared/components/toast';
import { updatePassword } from '@/features/auth/services';
import { ApiError } from '@/shared/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validatePasswordForm(data: PasswordData): PasswordErrors {
  const errors: PasswordErrors = {};

  if (!data.currentPassword) {
    errors.currentPassword = 'Password saat ini wajib diisi';
  }

  if (!data.newPassword) {
    errors.newPassword = 'Password baru wajib diisi';
  } else if (data.newPassword.length < 8) {
    errors.newPassword = 'Password baru minimal 8 karakter';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi';
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak sama dengan password baru';
  }

  if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
    errors.newPassword = 'Password baru tidak boleh sama dengan password lama';
  }

  return errors;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_PASSWORD: PasswordData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ChangePasswordCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>(EMPTY_PASSWORD);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  const isFormValid =
    passwordData.currentPassword.trim().length > 0 &&
    passwordData.newPassword.trim().length > 0 &&
    passwordData.confirmPassword.trim().length > 0 &&
    passwordData.newPassword === passwordData.confirmPassword;

  const handleChange =
    (field: keyof PasswordData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordData(prev => ({ ...prev, [field]: e.target.value }));
      setPasswordErrors(prev => ({ ...prev, [field]: undefined }));
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validatePasswordForm(passwordData);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      showToast('success', 'Password berhasil diubah!', 'Password Anda telah diperbarui.');
      setPasswordData(EMPTY_PASSWORD);
      setPasswordErrors({});
    } catch (error) {
      if (error instanceof ApiError) {
        const msg = error.message;
        if (msg.includes('Password saat ini salah')) {
          setPasswordErrors(prev => ({ ...prev, currentPassword: msg }));
        } else if (msg.includes('Password baru tidak boleh sama')) {
          setPasswordErrors(prev => ({ ...prev, newPassword: msg }));
        } else {
          showToast('danger', 'Gagal mengubah password', msg);
        }
      } else {
        showToast('danger', 'Gagal mengubah password', 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (Object.values(passwordData).some(val => val)) {
      const confirmed = confirm('Perubahan belum disimpan. Yakin ingin membatalkan?');
      if (!confirmed) return;
    }
    setPasswordData(EMPTY_PASSWORD);
    setPasswordErrors({});
  }

  return (
    <div className="w-[440px] shrink-0 border border-grey rounded-[20px] overflow-hidden bg-white">
      <div className="bg-primary px-4 py-3 flex justify-center items-center">
        <span className="font-bold text-xl text-white">Ubah Password</span>
      </div>
      <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
        <TextInput
          id="currentPassword"
          label="Password Lama"
          type="password"
          placeholder="••••••••"
          value={passwordData.currentPassword}
          onChange={handleChange('currentPassword')}
          error={passwordErrors.currentPassword}
          required
          disabled={isSubmitting}
        />
        <TextInput
          id="newPassword"
          label="Password Baru"
          type="password"
          placeholder="Minimal 8 karakter"
          value={passwordData.newPassword}
          onChange={handleChange('newPassword')}
          error={passwordErrors.newPassword}
          required
          disabled={isSubmitting}
        />
        <TextInput
          id="confirmPassword"
          label="Konfirmasi Password Baru"
          type="password"
          placeholder="Ulangi password"
          value={passwordData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={passwordErrors.confirmPassword}
          required
          disabled={isSubmitting}
        />

        <div className="flex gap-5">
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="bg-action-submit hover:bg-action-submit/85"
          >
            <Save className="size-4" />
            {isSubmitting ? 'Mengubah...' : 'Ubah Password'}
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="border-danger text-danger hover:bg-danger/8"
          >
            <X className="size-4" />
            Batalkan
          </Button>
        </div>
      </form>
    </div>
  );
}
