'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TextInput } from '@/shared/components/form-fields';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { setFlashToast } from '@/shared/hooks/use-flash-toast';
import { login } from '@/features/auth/service';
import { ApiError } from '@/shared/types/api';

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  OWNER: '/owner/dashboard',
  INVESTOR: '/catalogue',
  EXECUTIVE: '/admin/insights',
};

function validateEmailValue(value: string): string | undefined {
  if (!value.trim()) return 'Email wajib diisi';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid';
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    const emailError = validateEmailValue(email);
    if (emailError) next.email = emailError;
    if (!password) next.password = 'Password wajib diisi';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data: { role } } = await login({ email, password });
      setFlashToast({ type: 'success', title: 'Login berhasil', description: 'Selamat datang kembali!' });
      router.push(ROLE_REDIRECT[role] ?? '/dashboard');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      showToast('danger', 'Login gagal', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-md rounded-xl overflow-hidden shadow-lg"
      style={{ animation: 'fade-in-up 0.6s ease-out 0.24s both' }}
    >
      {/* Header */}
      <div className="bg-primary px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Masuk ke akun anda</h2>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} className="bg-white px-6 py-8 space-y-5">
        <TextInput
          id="email"
          label="Email"
          type="email"
          placeholder="nama@email.com"
          required
          value={email}
          onChange={e => {
            const val = e.target.value;
            setEmail(val);
            if (emailTouched) {
              setErrors(prev => ({ ...prev, email: validateEmailValue(val) }));
            }
          }}
          onBlur={() => {
            setEmailTouched(true);
            setErrors(prev => ({ ...prev, email: validateEmailValue(email) }));
          }}
          error={errors.email}
        />

        <TextInput
          id="password"
          label="Password"
          type="password"
          placeholder="Masukkan password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={errors.password}
        />

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Memproses...' : 'Login'}
        </Button>

        <div className="space-y-1 text-sm text-center text-gray-600">
          <p>
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Daftar di sini
            </Link>
          </p>
          <p>
            Lupa password?{' '}
            <Link href="/forgot-password" className="text-primary font-medium hover:underline">
              Reset password di sini
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
