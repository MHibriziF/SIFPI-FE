'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TextInput } from '@/shared/components/form-fields';
import { Button } from '@/shared/components/button';
import { Notification } from '@/shared/components/info-toast';
import { showToast } from '@/shared/components/toast';
import { forgotPassword } from '@/features/auth/services';
import { ApiError } from '@/shared/types/api';
import { MailCheck } from 'lucide-react';

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email wajib diisi';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid';
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      setEmailTouched(true);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email });
      // Backend always returns 200 — even for unknown emails (prevents enumeration)
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      showToast('danger', 'Gagal mengirim instruksi', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-[681px] rounded-2xl overflow-hidden shadow-lg"
      style={{ animation: 'fade-in-up 0.6s ease-out 0.24s both' }}
    >
      {/* Card header */}
      <div className="bg-primary px-4 py-3 flex items-center justify-center">
        <h2 className="text-lg font-bold text-white">Reset password</h2>
      </div>

      {/* Card body */}
      <div className="bg-white px-10 py-10 flex flex-col gap-5">
        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex items-center justify-center size-14 rounded-full bg-success-light">
              <MailCheck className="size-7 text-success" />
            </div>
            <p className="text-lg font-bold text-primary">Instruksi Terkirim</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Jika email <span className="font-medium text-primary">{email}</span> terdaftar,
              kami telah mengirimkan link reset password. Silakan cek kotak masuk Anda.
            </p>
            <Button asChild variant="filled" size="lg" className="mt-2 w-full">
              <Link href="/login">Kembali ke Login</Link>
            </Button>
          </div>
        ) : (
          /* ── Form state ── */
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextInput
              id="email"
              label="Email Resmi"
              type="email"
              placeholder="nama@instansi.com"
              required
              value={email}
              error={emailTouched ? emailError : undefined}
              onChange={e => {
                const val = e.target.value;
                setEmail(val);
                if (emailTouched) setEmailError(validateEmail(val));
              }}
              onBlur={() => {
                setEmailTouched(true);
                setEmailError(validateEmail(email));
              }}
            />

            <Notification
              variant="info"
              title="Instruksi"
              description="Kami akan mengirimkan instruksi ke email Anda untuk mengatur ulang password Anda."
            />

            <div className="flex gap-2.5">
              <Button
                type="submit"
                variant="filled"
                size="lg"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Mengirim…' : 'Kirim Instruksi'}
              </Button>
              <Button asChild variant="outlined" size="lg" className="flex-1">
                <Link href="/login">Kembali</Link>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
