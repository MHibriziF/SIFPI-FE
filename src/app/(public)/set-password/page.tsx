'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/components/button';
import { TextInput } from '@/shared/components/form-fields';
import { showToast } from '@/shared/components/toast';
import { LockKeyhole } from 'lucide-react';

interface PasswordData {
  newPassword: string;
  confirmPassword: string;
}

interface ErrorState {
  newPassword?: string;
  confirmPassword?: string;
  token?: string;
}

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ErrorState>({});

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      showToast('danger', 'Token tidak valid', 'Link set password tidak valid atau sudah kadaluarsa');
      setErrors({ token: 'Token tidak ditemukan' });
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handlePasswordChange = (field: keyof PasswordData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ErrorState = {};

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Password baru wajib diisi';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password minimal 8 karakter';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak sama dengan password baru';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast('danger', 'Token tidak valid', 'Token tidak ditemukan');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          password: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengatur password');
      }

      showToast(
        'success',
        'Password berhasil diatur!',
        'Anda akan diarahkan ke halaman login.'
      );

      // Clear form
      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Error setting password:', error);
      showToast(
        'danger',
        'Gagal mengatur password',
        error instanceof Error ? error.message : 'Terjadi kesalahan, silakan coba lagi'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <LockKeyhole className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set Password</h1>
          <p className="text-sm text-gray-600 mt-2">
            Buat password baru untuk akun Anda
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {errors.token ? (
            <div className="text-center py-8">
              <p className="text-red-600 font-medium">Token tidak valid</p>
              <p className="text-sm text-gray-600 mt-2">
                Link set password tidak valid atau sudah kadaluarsa
              </p>
              <Button
                type="button"
                variant="outlined"
                className="mt-4"
                onClick={() => router.push('/login')}
              >
                Kembali ke Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextInput
                label="Password Baru"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                error={errors.newPassword}
                placeholder="Minimal 8 karakter"
                required
              />

              <TextInput
                label="Konfirmasi Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                error={errors.confirmPassword}
                placeholder="Ketik ulang password baru"
                required
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="filled"
                  className="w-full"
                  disabled={isLoading || !!errors.token}
                >
                  {isLoading ? 'Memproses...' : 'Set Password'}
                </Button>
              </div>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-primary hover:underline"
                >
                  Kembali ke Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}
