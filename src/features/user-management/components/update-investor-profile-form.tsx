'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/button';
import { TextInput, Select, type SelectOption } from '@/shared/components/form-fields';
import { showToast } from '@/shared/components/toast';
import { getMyProfile, updateInvestorProfile } from '@/features/user-management/services';
import { updatePassword } from '@/features/auth/services';
import { ApiError } from '@/shared/types/api';
import type { UpdateInvestorProfileRequest } from '@/features/user-management/types';

// ─── Static options ───────────────────────────────────────────────────────────

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

const STAGE_OPTIONS: SelectOption[] = [
  { value: 'Greenfield', label: 'Greenfield' },
  { value: 'Brownfield', label: 'Brownfield' },
  { value: 'Both', label: 'Both' },
];

const RISK_OPTIONS: SelectOption[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

// ─── Form state types ─────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  phone_number: string;
  jabatan: string;
  company_name: string;
  investment_interest_sectors: string[];
  investment_scale: string;
  preferred_investment_instrument: string;
  engagement_model: string;
  stage_preference: string;
  risk_appetite: string;
  esg_standards: string;
  local_presence: string;
  aum_size: string;
  opt_in_email: boolean;
  agree_privacy: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone_number?: string;
  jabatan?: string;
  company_name?: string;
  investment_interest_sectors?: string;
  investment_scale?: string;
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

// ─── Section divider ──────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="border-b border-gray-300 pb-2">
      <span className="text-base font-semibold text-black">{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UpdateInvestorProfileForm() {
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm: FormData = {
    name: '',
    email: '',
    phone_number: '',
    jabatan: '',
    company_name: '',
    investment_interest_sectors: [],
    investment_scale: '',
    preferred_investment_instrument: '',
    engagement_model: '',
    stage_preference: '',
    risk_appetite: '',
    esg_standards: '',
    local_presence: '',
    aum_size: '',
    opt_in_email: false,
    agree_privacy: false,
  };

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

  // Fetch current profile (pre-fill form)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        const d = res.data;

        const populated: FormData = {
          name: d.nama ?? '',
          email: d.email ?? '',
          phone_number: d.phone ?? '',
          jabatan: d.jabatan ?? '',
          company_name: d.organisasi ?? '',
          investment_interest_sectors: d.sector_interest ?? [],
          investment_scale: d.budget_range ?? '',
          preferred_investment_instrument: d.preferred_investment_instrument ?? '',
          engagement_model: d.engagement_model ?? '',
          stage_preference: d.stage_preference ?? '',
          risk_appetite: d.risk_appetite ?? '',
          esg_standards: d.esg_standards ?? '',
          local_presence: d.local_presence ?? '',
          aum_size: d.aum_size ?? '',
          opt_in_email: d.opt_in_email ?? false,
          agree_privacy: d.agree_privacy ?? false,
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

  function handleChange<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  function toggleSector(value: string) {
    const current = formData.investment_interest_sectors;
    const updated = current.includes(value)
      ? current.filter(s => s !== value)
      : [...current, value];
    handleChange('investment_interest_sectors', updated);
    if (errors.investment_interest_sectors) {
      setErrors(prev => ({ ...prev, investment_interest_sectors: undefined }));
    }
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: FormErrors = {};

    if (!formData.name.trim()) next.name = 'Nama wajib diisi';

    const emailError = validateEmail(formData.email);
    if (emailError) next.email = emailError;

    const phoneError = validatePhone(formData.phone_number);
    if (phoneError) next.phone_number = phoneError;

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: UpdateInvestorProfileRequest = {
      // Base — required
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone_number: formData.phone_number.trim(),
      // Optional — all roles
      ...(formData.jabatan.trim() && { jabatan: formData.jabatan.trim() }),
      // Optional — investor extra
      ...(formData.company_name.trim() && { company_name: formData.company_name.trim() }),
      ...(formData.investment_interest_sectors.length > 0 && {
        investment_interest_sectors: formData.investment_interest_sectors,
      }),
      ...(formData.investment_scale && { investment_scale: formData.investment_scale }),
      ...(formData.preferred_investment_instrument.trim() && {
        preferred_investment_instrument: formData.preferred_investment_instrument.trim(),
      }),
      ...(formData.engagement_model.trim() && {
        engagement_model: formData.engagement_model.trim(),
      }),
      ...(formData.stage_preference && { stage_preference: formData.stage_preference }),
      ...(formData.risk_appetite && { risk_appetite: formData.risk_appetite }),
      ...(formData.esg_standards.trim() && { esg_standards: formData.esg_standards.trim() }),
      ...(formData.local_presence.trim() && { local_presence: formData.local_presence.trim() }),
      ...(formData.aum_size.trim() && { aum_size: formData.aum_size.trim() }),
      opt_in_email: formData.opt_in_email,
      agree_privacy: formData.agree_privacy,
    };

    setIsSubmitting(true);
    try {
      await updateInvestorProfile(payload);
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
        <div className="flex-1 bg-white rounded-[20px] border border-grey overflow-hidden animate-pulse">
          <div className="h-12 bg-primary" />
          <div className="p-8 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
        <div className="w-[440px] shrink-0 bg-white rounded-[20px] border border-grey overflow-hidden animate-pulse">
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
    <div className="flex gap-5 items-start">
      {/* ── LEFT: Informasi Profil ── */}
      <div className="flex-1 bg-white rounded-[20px] border border-grey overflow-hidden">
        {/* Card header */}
        <div className="bg-primary px-4 py-3 flex justify-center items-center">
          <span className="font-bold text-xl text-white">Informasi Profil</span>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* ── Section: Data Diri dan Organisasi ── */}
          <SectionDivider label="Data Diri dan Organisasi" />

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

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="email"
              label="Alamat Email"
              type="email"
              placeholder="email@example.com"
              required
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              error={errors.email}
              disabled={isSubmitting}
            />
            <TextInput
              id="phone_number"
              label="Nomor Telepon"
              placeholder="+628123456789"
              required
              value={formData.phone_number}
              onChange={e => handleChange('phone_number', e.target.value)}
              error={errors.phone_number}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="company_name"
              label="Perusahaan / Instansi"
              placeholder="Nama perusahaan"
              value={formData.company_name}
              onChange={e => handleChange('company_name', e.target.value)}
              disabled={isSubmitting}
            />
            <TextInput
              id="jabatan"
              label="Jabatan"
              placeholder="e.g. Direktur Investasi"
              value={formData.jabatan}
              onChange={e => handleChange('jabatan', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* ── Section: Preferensi Investasi ── */}
          <SectionDivider label="Preferensi Investasi" />

          <Select
            id="investment_scale"
            label="Budget Investasi"
            placeholder="Pilih rentang budget"
            options={BUDGET_OPTIONS}
            value={formData.investment_scale}
            onValueChange={v => handleChange('investment_scale', v)}
            error={errors.investment_scale}
            disabled={isSubmitting}
          />

          {/* Sektor Prioritas */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-primary">Sektor Prioritas</label>
            </div>

            <div className="rounded-lg border border-gray-200 p-3">
              <div className="grid grid-cols-3 gap-2">
                {SECTOR_OPTIONS.map(sector => (
                  <label
                    key={sector.value}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-xs',
                      formData.investment_interest_sectors.includes(sector.value)
                        ? 'text-primary font-medium'
                        : 'text-gray-600 hover:text-primary'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.investment_interest_sectors.includes(sector.value)}
                      onChange={() => toggleSector(sector.value)}
                      disabled={isSubmitting}
                      className="rounded border-gray-300 cursor-pointer accent-primary flex-shrink-0"
                    />
                    <span className="leading-tight">{sector.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Pilih minimal 3 sektor
              {formData.investment_interest_sectors.length > 0 && (
                <span className="ml-1 text-primary font-medium">
                  ({formData.investment_interest_sectors.length} dipilih)
                </span>
              )}
            </p>

            {errors.investment_interest_sectors && (
              <p className="text-xs text-danger">{errors.investment_interest_sectors}</p>
            )}
          </div>

          {/* ── Section: Detail Profil Investor (optional extended fields) ── */}
          <SectionDivider label="Detail Profil Investor" />

          <div className="grid grid-cols-2 gap-4">
            <Select
              id="stage_preference"
              label="Stage Preferensi"
              placeholder="Pilih stage"
              options={STAGE_OPTIONS}
              value={formData.stage_preference}
              onValueChange={v => handleChange('stage_preference', v)}
              disabled={isSubmitting}
            />
            <Select
              id="risk_appetite"
              label="Risk Appetite"
              placeholder="Pilih level risiko"
              options={RISK_OPTIONS}
              value={formData.risk_appetite}
              onValueChange={v => handleChange('risk_appetite', v)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="preferred_investment_instrument"
              label="Instrumen Investasi Pilihan"
              placeholder="e.g. Equity, Bonds"
              value={formData.preferred_investment_instrument}
              onChange={e => handleChange('preferred_investment_instrument', e.target.value)}
              disabled={isSubmitting}
            />
            <TextInput
              id="engagement_model"
              label="Model Keterlibatan"
              placeholder="e.g. Direct Investment"
              value={formData.engagement_model}
              onChange={e => handleChange('engagement_model', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="aum_size"
              label="AUM Size"
              placeholder="e.g. 500M USD"
              value={formData.aum_size}
              onChange={e => handleChange('aum_size', e.target.value)}
              disabled={isSubmitting}
            />
            <TextInput
              id="local_presence"
              label="Kehadiran Lokal"
              placeholder="e.g. Jakarta, Surabaya"
              value={formData.local_presence}
              onChange={e => handleChange('local_presence', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <TextInput
            id="esg_standards"
            label="Standar ESG"
            placeholder="e.g. GRI Standards"
            value={formData.esg_standards}
            onChange={e => handleChange('esg_standards', e.target.value)}
            disabled={isSubmitting}
          />

          {/* ── Persetujuan ── */}
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.opt_in_email}
                onChange={e => handleChange('opt_in_email', e.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 rounded border-gray-300 accent-primary flex-shrink-0 cursor-pointer"
              />
              <span className="text-sm text-black leading-snug">
                Saya ingin menerima update berkala mengenai katalog proyek terbaru melalui email.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.agree_privacy}
                onChange={e => handleChange('agree_privacy', e.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 rounded border-gray-300 accent-primary flex-shrink-0 cursor-pointer"
              />
              <span className="text-sm text-black leading-snug">
                Saya menyatakan data yang diisi adalah benar dan menyetujui kebijakan privasi IPFO.
              </span>
            </label>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-action-submit hover:bg-action-submit/85"
            >
              <Save className="size-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
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
        </form>
      </div>

      {/* ── RIGHT: Ubah Password ── */}
      <div className="w-[440px] shrink-0 bg-white rounded-[20px] border border-grey overflow-hidden">
        {/* Card header */}
        <div className="bg-primary px-4 py-3 flex justify-center items-center">
          <span className="font-bold text-xl text-white">Ubah Password</span>
        </div>

        <form onSubmit={handlePasswordSubmit} className="p-8 space-y-5">
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
            placeholder="Minimal 8 karakter"
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
            placeholder="Ulangi password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange('confirmPassword')}
            error={passwordErrors.confirmPassword}
            required
            disabled={isSubmittingPassword}
          />

          <div className="flex gap-4 pt-2">
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
      </div>
    </div>
  );
}
