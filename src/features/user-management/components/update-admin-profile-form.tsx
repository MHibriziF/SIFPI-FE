'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { TextInput } from '@/shared/components/form-fields';
import { showToast } from '@/shared/components/toast';
import { getMyProfile, updateAdminProfile } from '@/features/user-management/services';
import { updatePassword } from '@/features/auth/services';
import { ApiError } from '@/shared/types/api';
import type { UpdateAdminProfileRequest } from '@/features/user-management/types';

// ─── Form state types ─────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  jabatan: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

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

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email wajib diisi';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid';
}

const PHONE_REGEX = /^[+]?[0-9][0-9\s\-]{6,18}[0-9]$/;
function validatePhone(value: string): string | undefined {
  if (!value.trim()) return 'Nomor telepon wajib diisi';
  if (value.length > 20) return 'Nomor telepon maksimal 20 karakter';
  if (!PHONE_REGEX.test(value.trim())) return 'Format nomor telepon tidak valid';
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-grey rounded-[20px] overflow-hidden bg-white">
      <div className="bg-primary px-4 py-3 flex justify-center items-center">
        <span className="font-bold text-xl text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UpdateAdminProfileForm() {
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm: FormData = { name: '', email: '', phoneNumber: '', jabatan: '' };
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [originalData, setOriginalData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Password state ───────────────────────────────────────────────────────────
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  // Button is only active when all fields filled and new password matches confirmation
  const isPasswordFormValid =
    passwordData.currentPassword.trim().length > 0 &&
    passwordData.newPassword.trim().length > 0 &&
    passwordData.confirmPassword.trim().length > 0 &&
    passwordData.newPassword === passwordData.confirmPassword;

  // Pre-fill from GET /api/users/profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        const d = res.data;
        const populated: FormData = {
          name: d.nama ?? '',
          email: d.email ?? '',
          phoneNumber: d.phone ?? '',
          jabatan: d.jabatan ?? '',
        };
        setFormData(populated);
        setOriginalData(populated);
      } catch (err) {
        showToast(
          'danger',
          'Gagal memuat profil',
          err instanceof ApiError ? err.message : 'Tidak dapat mengambil data profil Anda.'
        );
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Field helpers ────────────────────────────────────────────────────────────

  function handleChange<K extends keyof FormData>(field: K, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: FormErrors = {};
    if (!formData.name.trim()) next.name = 'Nama wajib diisi';
    const emailError = validateEmail(formData.email);
    if (emailError) next.email = emailError;
    const phoneError = validatePhone(formData.phoneNumber);
    if (phoneError) next.phoneNumber = phoneError;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validate()) return;

    const payload: UpdateAdminProfileRequest = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      ...(formData.jabatan.trim() && { jabatan: formData.jabatan.trim() }),
    };

    setIsSubmitting(true);
    try {
      await updateAdminProfile(payload);
      setOriginalData(formData);
      showToast('success', 'Profil berhasil diperbarui!', 'Data profil Anda telah disimpan.');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrors(prev => ({ ...prev, email: err.message }));
        }
        showToast('danger', 'Gagal memperbarui profil', err.message);
      } else {
        showToast('danger', 'Gagal memperbarui profil', 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Discard changes ──────────────────────────────────────────────────────────

  function handleCancel() {
    setFormData(originalData);
    setErrors({});
  }

  // ── Password field helpers ───────────────────────────────────────────────────

  const handlePasswordChange = (field: keyof PasswordData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Password validation ──────────────────────────────────────────────────────

  function validatePasswordForm(): boolean {
    const newErrors: PasswordErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Password saat ini wajib diisi';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Password baru wajib diisi';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password baru minimal 8 karakter';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak sama dengan password baru';
    }

    if (passwordData.currentPassword && passwordData.newPassword &&
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'Password baru tidak boleh sama dengan password lama';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Password submit ──────────────────────────────────────────────────────────

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsSubmittingPassword(true);
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      showToast('success', 'Password berhasil diubah!', 'Password Anda telah diperbarui.');

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMessage = error.message;

        if (errorMessage.includes('Password saat ini salah')) {
          setPasswordErrors(prev => ({ ...prev, currentPassword: errorMessage }));
        } else if (errorMessage.includes('Password baru tidak boleh sama')) {
          setPasswordErrors(prev => ({ ...prev, newPassword: errorMessage }));
        } else {
          showToast('danger', 'Gagal mengubah password', errorMessage);
        }
      } else {
        showToast('danger', 'Gagal mengubah password', 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmittingPassword(false);
    }
  }

  // ── Password cancel ──────────────────────────────────────────────────────────

  function handleCancelPassword() {
    if (Object.values(passwordData).some((val) => val)) {
      const confirmed = confirm('Perubahan belum disimpan. Yakin ingin membatalkan?');
      if (!confirmed) return;
    }
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordErrors({});
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (isFetching) {
    return (
      <div className="flex gap-5 items-start">
        <div className="flex-1 flex flex-col gap-5">
          <div className="border border-grey rounded-[20px] overflow-hidden animate-pulse">
            <div className="h-12 bg-primary" />
            <div className="p-5 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-gray-100" />
              ))}
            </div>
          </div>
          <div className="flex gap-5">
            <div className="h-10 w-36 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-10 w-52 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="w-[440px] shrink-0 border border-grey rounded-[20px] overflow-hidden animate-pulse">
          <div className="h-12 bg-primary" />
          <div className="p-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="flex gap-5 items-start">
        {/* ── LEFT: Informasi Profil ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          <Card title="Informasi Profil">
            <div className="p-5 flex flex-col gap-5">
              {/* Nama */}
              <TextInput
                id="name"
                label="Nama"
                placeholder="Masukkan nama Anda"
                required
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                error={errors.name}
                disabled={isSubmitting}
              />

              {/* Email + Telepon row */}
              <div className="grid grid-cols-2 gap-5">
                <TextInput
                  id="email"
                  label="Alamat email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  error={errors.email}
                  disabled={isSubmitting}
                />
                <TextInput
                  id="phoneNumber"
                  label="Nomor telepon"
                  placeholder="+628123456789"
                  required
                  value={formData.phoneNumber}
                  onChange={e => handleChange('phoneNumber', e.target.value)}
                  error={errors.phoneNumber}
                  disabled={isSubmitting}
                />
              </div>

              {/* Jabatan (optional) */}
              <TextInput
                id="jabatan"
                label="Jabatan"
                placeholder="e.g. Kepala Divisi"
                value={formData.jabatan}
                onChange={e => handleChange('jabatan', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </Card>

          {/* Action buttons outside/below the card — matching Figma layout */}
          <div className="flex gap-5">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-action-submit hover:bg-action-submit/85"
            >
              <Save className="size-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-danger text-danger hover:bg-danger/8"
            >
              <X className="size-4" />
              Batalkan (buang perubahan)
            </Button>
          </div>
        </div>

        {/* ── RIGHT: Ubah Password ── */}
        <div className="w-[440px] shrink-0">
          <Card title="Ubah Password">
            <form onSubmit={handlePasswordSubmit} className="p-8 flex flex-col gap-5">
              <TextInput
                id="currentPassword"
                label="Password Lama"
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                error={passwordErrors.currentPassword}
                required
                disabled={isSubmittingPassword}
              />
              <TextInput
                id="newPassword"
                label="Password Baru"
                type="password"
                placeholder="Minimal 8 Karakter"
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                error={passwordErrors.newPassword}
                required
                disabled={isSubmittingPassword}
              />
              <TextInput
                id="confirmPassword"
                label="Konfirmasi Password Baru"
                type="password"
                placeholder="Ulangi Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                error={passwordErrors.confirmPassword}
                required
                disabled={isSubmittingPassword}
              />

              <div className="flex gap-5">
                <Button
                  type="submit"
                  disabled={!isPasswordFormValid || isSubmittingPassword}
                  className="bg-action-submit hover:bg-action-submit/85"
                >
                  <Save className="size-4" />
                  {isSubmittingPassword ? 'Mengubah...' : 'Ubah Password'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancelPassword}
                  disabled={isSubmittingPassword}
                  className="border-danger text-danger hover:bg-danger/8"
                >
                  <X className="size-4" />
                  Batalkan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
