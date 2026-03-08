'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { TextInput } from '@/shared/components/form-fields';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { createExecutive } from '@/features/user-management/service';
import { ApiError } from '@/shared/types/api';

interface ExecutiveAccountFormData {
  nama: string;
  jabatan: string;
  email: string;
  phone: string;
}

export default function CreateExecutiveAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ExecutiveAccountFormData>({
    nama: '',
    jabatan: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExecutiveAccountFormData, string>>>({});

  const handleChange = (field: keyof ExecutiveAccountFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExecutiveAccountFormData, string>> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi';
    } else if (formData.nama.trim().length < 2) {
      newErrors.nama = 'Nama minimal 2 karakter';
    }

    if (!formData.jabatan.trim()) {
      newErrors.jabatan = 'Posisi wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = 'Nomor telepon minimal 10 digit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await createExecutive(formData);

      showToast(
        'success',
        'Akun eksekutif berhasil dibuat!',
        `Akun untuk ${formData.nama} telah ditambahkan. Email undangan telah dikirim.`
      );

      // Redirect after success
      setTimeout(() => {
        router.push('/admin/access');
      }, 2000);
    } catch (error) {
      console.error('Error creating executive account:', error);
      showToast(
        'danger',
        'Gagal membuat akun eksekutif',
        error instanceof ApiError ? error.message : 'Terjadi kesalahan saat membuat akun'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (Object.values(formData).some(val => val.trim())) {
      const confirmed = confirm('Perubahan belum disimpan. Yakin ingin membatalkan?');
      if (!confirmed) return;
    }
    router.back();
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Title and Back Link */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-3">Buat Akun Eksekutif</h2>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ChevronLeft className="size-4" />
            Lihat semua pengguna terdaftar
          </button>
        </div>

        {/* Form Container - No Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nama */}
                <TextInput
                  id="nama"
                  label="Nama"
                  placeholder="Masukkan nama pengguna..."
                  value={formData.nama}
                  onChange={handleChange('nama')}
                  error={errors.nama}
                  required
                  disabled={isLoading}
                />

                {/* Posisi pada organisasi */}
                <TextInput
                  id="jabatan"
                  label="Posisi pada organisasi"
                  placeholder="e.g. Direktur"
                  value={formData.jabatan}
                  onChange={handleChange('jabatan')}
                  error={errors.jabatan}
                  required
                  disabled={isLoading}
                />

                {/* Email and Phone in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    id="email"
                    type="email"
                    label="Alamat email"
                    placeholder="e.g. example@instansi.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={errors.email}
                    required
                    disabled={isLoading}
                  />

                  <TextInput
                    id="phone"
                    type="tel"
                    label="Nomor telepon"
                    placeholder="e.g. +6281xxxxxxxxx"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    error={errors.phone}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    variant="filled"
                    disabled={isLoading}
                    className="bg-action-submit hover:bg-action-submit/85"
                  >
                    <Plus className="size-4" />
                    {isLoading ? 'Memproses...' : 'Tambahkan Akun'}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="border-danger text-danger hover:bg-danger/8"
                  >
                    <X className="size-4" />
                    Batalkan (buang perubahan)
                  </Button>
                </div>
              </form>
            </div>
        </div>
      </div>
  );
}
