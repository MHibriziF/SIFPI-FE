'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TextInput, Select, type SelectOption } from '@/shared/components/form-fields';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { setFlashToast } from '@/shared/hooks/use-flash-toast';
import { registerInvestor } from '@/features/auth/services';
import { OrganizationAutocomplete } from './organization-autocomplete';
import { ApiError } from '@/shared/types/api';
import type { CreateInvestorRequest, OrganizationDTO } from '@/features/auth/types';
import { cn } from '@/shared/lib/utils';

const SECTOR_OPTIONS = [
  { value: 'PUBLIC_TRANSPORTATION', label: 'Public Transportation' },
  { value: 'LAND_BASED_TRANSPORT', label: 'Land Based Transport' },
  { value: 'WASTE_MANAGEMENT', label: 'Waste Management' },
  { value: 'TOLL_ROAD', label: 'Toll Road' },
  { value: 'AFFORDABLE_HOUSING_AND_TRANSIT_ORIENTED_DEVELOPMENT', label: 'Affordable Housing' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'WATER_RESOURCE_DRINKING_WATER_AND_IRRIGATION', label: 'Water Resource' },
  { value: 'MARITIME', label: 'Maritime' },
  { value: 'OIL_GAS_AND_ENERGY', label: 'Oil & Gas, Energy' },
  { value: 'AVIATION', label: 'Aviation' },
  { value: 'DIGITAL_AND_TELECOMMUNICATIONS', label: 'Digital & Telecom' },
  { value: 'EDUCATION_RESEARCH_AND_DEVELOPMENT', label: 'Education, R&D' },
  { value: 'URBAN_ECONOMICS_INFRASTRUCTURE_FACILITIES', label: 'Urban Economics' },
];

const BUDGET_OPTIONS: SelectOption[] = [
  { value: '<1', label: '< 1 Miliar' },
  { value: '1-5', label: '1-5 Miliar' },
  { value: '5-10', label: '5-10 Miliar' },
  { value: '>10', label: '> 10 Miliar' },
];

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
  budgetInvestasi?: string;
  sectorInterest?: string;
  agreePrivacy?: string;
}

interface TouchedFields {
  [key: string]: boolean;
}

export default function RegisterInvestorForm({
  onSuccess,
}: {
  onSuccess?: (email: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<CreateInvestorRequest>({
    nama: '',
    email: '',
    organisasi: '',
    jabatan: '',
    phone: '',
    password: '',
    confirmPassword: '',
    budgetInvestasi: '',
    sectorInterest: [],
    optInEmail: false,
    agreePrivacy: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [loading, setLoading] = useState(false);
  // selectedOrganization is set by OrganizationAutocomplete for potential future use
  const [, setSelectedOrganization] = useState<OrganizationDTO | null>(null);

  function validateStep1(): boolean {
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

  function validateStep2(): boolean {
    const next: FormErrors = {};

    if (!formData.budgetInvestasi) next.budgetInvestasi = 'Budget investasi wajib diisi';
    if (!formData.sectorInterest || formData.sectorInterest.length < 3)
      next.sectorInterest = 'Pilih minimal 3 sektor interest';
    if (!formData.agreePrivacy) next.agreePrivacy = 'Anda harus menyetujui kebijakan privasi';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNextStep() {
    if (validateStep1()) {
      setStep(2);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Register investor - backend akan handle organisasi creation dalam transaksi
      await registerInvestor(formData);
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
    field: keyof CreateInvestorRequest,
    value: any,
    currentErrors: FormErrors,
    currentFormData: CreateInvestorRequest,
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
      case 'budgetInvestasi':
        next.budgetInvestasi = value ? undefined : 'Budget investasi wajib diisi';
        break;
      case 'sectorInterest':
        next.sectorInterest =
          (value as string[]).length >= 3 ? undefined : 'Pilih minimal 3 sektor';
        break;
    }

    return next;
  }

  function handleChange(field: keyof CreateInvestorRequest, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched[field]) {
      setErrors(validateFieldInline(field, value, errors, formData, touched));
    }
  }

  function handleBlur(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }));
  }

  function toggleSector(sector: string) {
    const current = formData.sectorInterest || [];
    const updated = current.includes(sector)
      ? current.filter(s => s !== sector)
      : [...current, sector];
    handleChange('sectorInterest', updated);
  }

  /* ─── STEP 1 ─── */
  if (step === 1) {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          handleNextStep();
        }}
        className="bg-white px-8 pt-4 pb-8 space-y-4"
      >
        {/* Section title */}
        <div className="pb-1">
          <h3 className="text-sm font-semibold text-primary mb-2">Data Diri dan Organisasi</h3>
          <div className="h-px bg-gray-200" />
        </div>

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
            placeholder="e.g. Direktur Investasi"
            required
            value={formData.jabatan}
            onChange={e => handleChange('jabatan', e.target.value)}
            onBlur={() => handleBlur('jabatan')}
            error={errors.jabatan}
          />
          <TextInput
            id="phone"
            label="No. Telepon"
            placeholder="+62812xxxxxxx"
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
          placeholder="Ulangi Password"
          required
          value={formData.confirmPassword}
          onChange={e => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          error={errors.confirmPassword}
        />

        {/* Next */}
        <Button type="submit" className="w-full mt-2" size="lg">
          Lanjutkan
        </Button>

        <p className="text-center text-sm text-gray-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Login di sini
          </Link>
        </p>
      </form>
    );
  }

  /* ─── STEP 2 ─── */
  return (
    <form onSubmit={handleSubmit} className="bg-white px-8 pt-4 pb-8 space-y-4">
      {/* Section title */}
      <div className="pb-1">
        <h3 className="text-sm font-semibold text-primary mb-2">
          Preferensi Investasi &amp; Komunikasi
        </h3>
        <div className="h-px bg-gray-200" />
      </div>

      {/* Budget Investasi */}
      <Select
        id="budgetInvestasi"
        label="Budget Investasi"
        placeholder="Pilih rentang budget"
        required
        options={BUDGET_OPTIONS}
        value={formData.budgetInvestasi}
        onValueChange={value => handleChange('budgetInvestasi', value)}
        error={errors.budgetInvestasi}
      />

      {/* Sektor Prioritas */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          <label className="text-sm font-medium text-primary">Sektor Prioritas</label>
          <span className="text-danger text-sm">*</span>
        </div>

        <div className="rounded-lg border border-gray-200 p-3">
          <div className="grid grid-cols-3 gap-2">
            {SECTOR_OPTIONS.map(sector => (
              <label
                key={sector.value}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-xs',
                  formData.sectorInterest?.includes(sector.value)
                    ? 'text-primary font-medium'
                    : 'text-gray-600 hover:text-primary'
                )}
              >
                <input
                  type="checkbox"
                  checked={formData.sectorInterest?.includes(sector.value) || false}
                  onChange={() => toggleSector(sector.value)}
                  className="rounded border-gray-300 cursor-pointer accent-primary flex-shrink-0"
                />
                <span className="leading-tight">{sector.label}</span>
              </label>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Pilih minimal 3 sektor
          {formData.sectorInterest?.length > 0 && (
            <span className="ml-1 text-primary font-medium">
              ({formData.sectorInterest.length} dipilih)
            </span>
          )}
        </p>

        {errors.sectorInterest && (
          <p className="text-xs text-danger">{errors.sectorInterest}</p>
        )}
      </div>

      {/* Email Opt-in */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={formData.optInEmail || false}
          onChange={e => handleChange('optInEmail', e.target.checked)}
          className="mt-0.5 rounded border-gray-300 cursor-pointer accent-primary flex-shrink-0"
        />
        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors leading-snug">
          Saya ingin menerima update berkala mengenai katalog proyek terbaru melalui email.
        </span>
      </label>

      {/* Privacy Agreement */}
      <label
        className={cn(
          'flex items-start gap-3 cursor-pointer group',
          errors.agreePrivacy && 'text-danger'
        )}
      >
        <input
          type="checkbox"
          checked={formData.agreePrivacy || false}
          onChange={e => handleChange('agreePrivacy', e.target.checked)}
          onBlur={() => handleBlur('agreePrivacy')}
          className="mt-0.5 rounded border-gray-300 cursor-pointer accent-primary flex-shrink-0"
          required
        />
        <span
          className={cn(
            'text-sm leading-snug transition-colors',
            errors.agreePrivacy
              ? 'text-danger'
              : 'text-gray-600 group-hover:text-gray-800'
          )}
        >
          Saya menyatakan data yang diisi adalah benar dan menyetujui kebijakan privasi IPFO
        </span>
      </label>
      {errors.agreePrivacy && (
        <p className="text-xs text-danger -mt-2">{errors.agreePrivacy}</p>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <Button
          type="button"
          variant="outlined"
          size="lg"
          onClick={() => setStep(1)}
        >
          Kembali
        </Button>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Memproses...' : 'Daftar Akun'}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Login di sini
        </Link>
      </p>
    </form>
  );
}