'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { TextInput } from '@/shared/components/form-fields';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { resetPassword } from '@/features/auth/services';
import { ApiError } from '@/shared/types/api';
import { CheckCircle } from 'lucide-react';

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [tokenMissing, setTokenMissing] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      setTokenMissing(true);
    } else {
      setToken(t);
    }
  }, [searchParams]);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!newPassword) {
      next.newPassword = 'Password baru wajib diisi';
    } else if (newPassword.length < 8) {
      next.newPassword = 'Password minimal 8 karakter';
    }

    if (!confirmPassword) {
      next.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword({ token, newPassword, confirmPassword });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      showToast('danger', 'Gagal reset password', message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Invalid / missing token ── */
  if (tokenMissing) {
    return (
      <div
        className="w-full max-w-[681px] rounded-2xl overflow-hidden shadow-lg"
        style={{ animation: 'fade-in-up 0.6s ease-out 0.24s both' }}
      >
        <div className="bg-primary px-4 py-3 flex items-center justify-center">
          <h2 className="text-lg font-bold text-white">Atur Ulang Password</h2>
        </div>
        <div className="bg-white px-10 py-10 flex flex-col items-center gap-4 text-center">
          <p className="font-semibold text-danger">Link tidak valid</p>
          <p className="text-sm text-gray-500">
            Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.
          </p>
          <Button asChild variant="filled" size="lg" className="mt-2">
            <Link href="/forgot-password">Minta Link Baru</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-[681px] rounded-2xl overflow-hidden shadow-lg"
      style={{ animation: 'fade-in-up 0.6s ease-out 0.24s both' }}
    >
      {/* Card header */}
      <div className="bg-primary px-4 py-3 flex items-center justify-center">
        <h2 className="text-lg font-bold text-white">Atur Ulang Password</h2>
      </div>

      {/* Card body */}
      <div className="bg-white px-10 py-10 flex flex-col gap-5">
        {success ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex items-center justify-center size-14 rounded-full bg-success-light">
              <CheckCircle className="size-7 text-success" />
            </div>
            <p className="text-lg font-bold text-primary">Password Berhasil Diubah</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Silakan login menggunakan password baru Anda. Anda akan diarahkan secara otomatis.
            </p>
            <Button asChild variant="filled" size="lg" className="mt-2 w-full">
              <Link href="/login">Ke Halaman Login</Link>
            </Button>
          </div>
        ) : (
          /* ── Form state ── */
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextInput
              id="newPassword"
              label="Password Baru"
              type="password"
              placeholder="Minimal 8 karakter"
              required
              value={newPassword}
              error={errors.newPassword}
              onChange={e => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
              }}
            />

            <TextInput
              id="confirmPassword"
              label="Konfirmasi Password Baru"
              type="password"
              placeholder="Ulangi password"
              required
              value={confirmPassword}
              error={errors.confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
            />

            <Button
              type="submit"
              variant="filled"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Memproses…' : 'Update Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[681px] rounded-2xl overflow-hidden shadow-lg bg-white px-10 py-10 text-center text-sm text-gray-400">
          Memuat…
        </div>
      }
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
