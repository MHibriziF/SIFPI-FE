'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { TextInput } from '@/shared/components/form-fields';
import { showToast } from '@/shared/components/toast';
import { getCurrentUser } from '@/features/user-management/services';
import { updatePassword } from '@/features/auth/services';
import { ApiError } from '@/shared/types/api';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ErrorState {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function UpdateProfilePage() {
  const router = useRouter();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ErrorState>({});

  // Fetch current user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const result = await getCurrentUser();
        const userData = result.data;

        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        showToast(
          'danger',
          'Gagal memuat profil',
          error instanceof ApiError ? error.message : 'Tidak dapat mengambil data profil Anda.'
        );
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileChange = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePasswordChange = (field: keyof PasswordData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateProfileForm = (): boolean => {
    const newErrors: ErrorState = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (profileData.phone && profileData.phone.trim().length < 10) {
      newErrors.phone = 'Nomor telepon minimal 10 digit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: ErrorState = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsLoadingProfile(true);

    try {
      // TODO: Backend endpoint for updating profile not yet available
      // const response = await fetch('/api/users/profile', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify(profileData),
      // });

      // Simulated success for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showToast(
        'warning',
        'Fitur dalam pengembangan',
        'Endpoint update profil belum tersedia di backend.'
      );

      // When backend is ready:
      // if (!response.ok) {
      //   const result = await response.json();
      //   throw new Error(result.message || 'Gagal mengupdate profil');
      // }
      //
      // showToast(
      //   'success',
      //   'Profil berhasil diperbarui!',
      //   'Data profil Anda telah diupdate.'
      // );
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(
        'danger',
        'Gagal mengupdate profil',
        error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsLoadingPassword(true);

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      showToast(
        'success',
        'Password berhasil diubah!',
        'Password Anda telah diperbarui.'
      );

      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      showToast(
        'danger',
        'Gagal mengubah password',
        error instanceof ApiError ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
      );
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleCancelProfile = () => {
    if (Object.values(profileData).some((val) => val.trim())) {
      const confirmed = confirm(
        'Perubahan belum disimpan. Yakin ingin membatalkan?'
      );
      if (!confirmed) return;
    }
    router.back();
  };

  const handleCancelPassword = () => {
    if (Object.values(passwordData).some((val) => val)) {
      const confirmed = confirm(
        'Perubahan belum disimpan. Yakin ingin membatalkan?'
      );
      if (!confirmed) return;
    }
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Update Profile</h2>
          <p className="text-sm text-gray-600 mt-1">Kelola profil Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informasi Profil Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="bg-primary text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">Informasi Profil</h3>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
              <TextInput
                id="name"
                label="Nama"
                placeholder="Masukkan nama Anda"
                value={profileData.name}
                onChange={handleProfileChange('name')}
                error={errors.name}
                required
                disabled={isLoadingProfile}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  id="email"
                  label="Alamat email"
                  type="email"
                  placeholder="email@example.com"
                  value={profileData.email}
                  onChange={handleProfileChange('email')}
                  error={errors.email}
                  required
                  disabled={isLoadingProfile}
                />

                <TextInput
                  id="phone"
                  label="Nomor telepon"
                  placeholder="+628123456789"
                  value={profileData.phone}
                  onChange={handleProfileChange('phone')}
                  error={errors.phone}
                  disabled={isLoadingProfile}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="filled"
                  disabled={isLoadingProfile}
                  className="bg-action-submit hover:bg-action-submit/85"
                >
                  <Save className="size-4" />
                  {isLoadingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancelProfile}
                  disabled={isLoadingProfile}
                  className="border-danger text-danger hover:bg-danger/8"
                >
                  <X className="size-4" />
                  Batalkan (buang perubahan)
                </Button>
              </div>
            </form>
          </div>

          {/* Ubah Password Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="bg-primary text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">Ubah Password</h3>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
              <TextInput
                id="currentPassword"
                label="Password Lama"
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                error={errors.currentPassword}
                required
                disabled={isLoadingPassword}
              />

              <TextInput
                id="newPassword"
                label="Password Baru"
                type="password"
                placeholder="Minimal 8 Karakter"
                value={passwordData.newPassword}
                onChange={handlePasswordChange('newPassword')}
                error={errors.newPassword}
                required
                disabled={isLoadingPassword}
              />

              <TextInput
                id="confirmPassword"
                label="Konfirmasi Password Baru"
                type="password"
                placeholder="Ulangi Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                error={errors.confirmPassword}
                required
                disabled={isLoadingPassword}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="filled"
                  disabled={isLoadingPassword}
                  className="bg-action-submit hover:bg-action-submit/85"
                >
                  <Save className="size-4" />
                  {isLoadingPassword ? 'Mengubah...' : 'Ubah Password'}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancelPassword}
                  disabled={isLoadingPassword}
                  className="border-danger text-danger hover:bg-danger/8"
                >
                  <X className="size-4" />
                  Batalkan
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
