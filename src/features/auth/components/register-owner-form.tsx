'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TextInput } from '@/shared/components/form-fields';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { setFlashToast } from '@/shared/hooks/use-flash-toast';
import { registerOwner } from '@/features/auth/services';
import { OrganizationAutocomplete } from './organization-autocomplete';
import { ApiError } from '@/shared/types/api';
import type { CreateOwnerRequest, OrganizationDTO } from '@/features/auth/types';

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email wajib diisi';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid';
}

function validatePassword(value: string): string | undefined {
  if (!value) return 'Password wajib diisi';
  if (value.length < 8) return 'Password minimal 8 karakter';
}

function validatePhone(value: string): string | undefined {
  if (!value.trim()) return 'No. Telepon wajib diisi';
  if (!/^(\+62|0)[0-9]{9,12}$/.test(value.replace(/\s/g, '')))
    return 'No. Telepon tidak valid';
}

interface FormErrors {
  nama?: string;
  email?: string;
  organisasi?: string;
  jabatan?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

interface TouchedFields {
  [key: string]: boolean;
}

export default function RegisterOwnerForm({
  onSuccess,
}: {
  onSuccess?: (email: string) => void;
}) {
  const [formData, setFormData] = useState<CreateOwnerRequest>({
    nama: '',
    email: '',
    organisasi: '',
    jabatan: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [loading, setLoading] = useState(false);
  // selectedOrganization is set by OrganizationAutocomplete for potential future use
  const [, setSelectedOrganization] = useState<OrganizationDTO | null>(null);

  function validate(): boolean {
    const next: FormErrors = {};

    if (!formData.nama.trim()) next.nama = 'Nama lengkap wajib diisi';
    if (formData.nama.length > 255) next.nama = 'Nama lengkap maksimal 255 karakter';

    const emailError = validateEmail(formData.email);
    if (emailError) next.email = emailError;

    if (!formData.organisasi.trim()) next.organisasi = 'Organisasi/Instansi wajib diisi';
    if (formData.organisasi.length > 255) next.organisasi = 'Organisasi maksimal 255 karakter';

    if (!formData.jabatan.trim()) next.jabatan = 'Jabatan wajib diisi';
    if (formData.jabatan.length > 100) next.jabatan = 'Jabatan maksimal 100 karakter';

    const phoneError = validatePhone(formData.phone);
    if (phoneError) next.phone = phoneError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) next.password = passwordError;

    if (!formData.confirmPassword) {
      next.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      next.confirmPassword = 'Password tidak cocok';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Register owner - backend akan handle organisasi creation dalam transaksi
      await registerOwner(formData);
      setFlashToast({
        type: 'success',
        title: 'Akun berhasil dibuat!',
        description: 'Silahkan cek email Anda untuk verifikasi akun.',
      });
      onSuccess?.(formData.email);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      showToast('danger', 'Pendaftaran gagal', message);
    } finally {
      setLoading(false);
    }
  }

  function validateFieldInline(
    field: keyof CreateOwnerRequest,
    value: string,
    currentErrors: FormErrors,
    currentFormData: CreateOwnerRequest,
    currentTouched: TouchedFields
  ): FormErrors {
    const next = { ...currentErrors };

    switch (field) {
      case 'email':
        next.email = validateEmail(value);
        break;
      case 'password':
        next.password = validatePassword(value);
        if (currentTouched.confirmPassword && currentFormData.confirmPassword) {
          next.confirmPassword =
            value !== currentFormData.confirmPassword ? 'Password tidak cocok' : undefined;
        }
        break;
      case 'confirmPassword':
        next.confirmPassword =
          value !== currentFormData.password ? 'Password tidak cocok' : undefined;
        break;
      case 'phone':
        next.phone = validatePhone(value);
        break;
      case 'nama':
        next.nama = value.trim() ? undefined : 'Nama lengkap wajib diisi';
        break;
      case 'organisasi':
        next.organisasi = value.trim() ? undefined : 'Organisasi/Instansi wajib diisi';
        break;
      case 'jabatan':
        next.jabatan = value.trim() ? undefined : 'Jabatan wajib diisi';
        break;
    }

    return next;
  }

  function handleChange(field: keyof CreateOwnerRequest, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched[field]) {
      setErrors(validateFieldInline(field, value, errors, formData, touched));
    }
  }

  function handleBlur(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }));
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white px-8 pt-4 pb-8 space-y-4">
      {/* Nama Lengkap */}
      <TextInput
        id="nama"
        label="Nama Lengkap"
        placeholder="Masukkan nama sesuai identitas"
        required
        value={formData.nama}
        onChange={e => handleChange('nama', e.target.value)}
        onBlur={() => handleBlur('nama')}
        error={errors.nama}
      />

      {/* Email & Organisasi */}
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          id="email"
          label="Email Resmi"
          type="email"
          placeholder="nama@instansi.com"
          required
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={errors.email}
        />
        <OrganizationAutocomplete
          id="organisasi"
          label="Organisasi / Instansi"
          placeholder="Cari atau tambah organisasi..."
          required
          value={formData.organisasi}
          onChange={value => handleChange('organisasi', value)}
          onOrganizationSelect={setSelectedOrganization}
          onBlur={() => handleBlur('organisasi')}
          error={errors.organisasi}
        />
      </div>

      {/* Jabatan & Telepon */}
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          id="jabatan"
          label="Jabatan"
          placeholder="e.g. Direktur"
          required
          value={formData.jabatan}
          onChange={e => handleChange('jabatan', e.target.value)}
          onBlur={() => handleBlur('jabatan')}
          error={errors.jabatan}
        />
        <TextInput
          id="phone"
          label="No. Telepon"
          placeholder="+6281xxxxxxxx"
          required
          value={formData.phone}
          onChange={e => handleChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          error={errors.phone}
        />
      </div>

      {/* Password */}
      <TextInput
        id="password"
        label="Password"
        type="password"
        placeholder="Minimal 8 karakter"
        required
        value={formData.password}
        onChange={e => handleChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
        error={errors.password}
      />

      {/* Confirm Password */}
      <TextInput
        id="confirmPassword"
        label="Konfirmasi Password"
        type="password"
        placeholder="Ulangi password"
        required
        value={formData.confirmPassword}
        onChange={e => handleChange('confirmPassword', e.target.value)}
        onBlur={() => handleBlur('confirmPassword')}
        error={errors.confirmPassword}
      />

      {/* Submit */}
      <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
        {loading ? 'Memproses...' : 'Daftar Akun'}
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Login di sini
        </Link>
      </p>
    </form>
  );
}