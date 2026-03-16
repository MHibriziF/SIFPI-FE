'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/button';
import { TextInput, Select } from '@/shared/components/form-fields';
import { showToast } from '@/shared/components/toast';
import { getMyProfile, updateInvestorProfile } from '@/features/user-management/services';
import { getOrCreateOrganization } from '@/features/auth/services';
import { OrganizationAutocomplete } from '@/features/auth/components/organization-autocomplete';
import { ApiError } from '@/shared/types/api';
import { validateEmail, validatePhone } from '@/shared/lib/validation';
import {
  INVESTOR_SECTOR_OPTIONS,
  BUDGET_OPTIONS,
  STAGE_OPTIONS,
  RISK_OPTIONS,
} from '@/shared/enums/investment-options';
import { ChangePasswordCard } from './change-password-card';
import type { UpdateInvestorProfileRequest } from '@/features/user-management/types';

// ─── Form state types ─────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  jabatan: string;
  companyName: string;
  investmentInterestSectors: string[];
  investmentScale: string;
  preferredInvestmentInstrument: string;
  engagementModel: string;
  stagePreference: string;
  riskAppetite: string;
  esgStandards: string;
  localPresence: string;
  aumSize: string;
  optInEmail: boolean;
  agreePrivacy: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
  jabatan?: string;
  companyName?: string;
  investmentInterestSectors?: string;
  investmentScale?: string;
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
    phoneNumber: '',
    jabatan: '',
    companyName: '',
    investmentInterestSectors: [],
    investmentScale: '',
    preferredInvestmentInstrument: '',
    engagementModel: '',
    stagePreference: '',
    riskAppetite: '',
    esgStandards: '',
    localPresence: '',
    aumSize: '',
    optInEmail: false,
    agreePrivacy: false,
  };

  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [originalData, setOriginalData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch current profile (pre-fill form)
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
          companyName: d.organisasi ?? '',
          investmentInterestSectors: d.sectorInterest ?? [],
          investmentScale: d.budgetRange ?? '',
          preferredInvestmentInstrument: d.preferredInvestmentInstrument ?? '',
          engagementModel: d.engagementModel ?? '',
          stagePreference: d.stagePreference ?? '',
          riskAppetite: d.riskAppetite ?? '',
          esgStandards: d.esgStandards ?? '',
          localPresence: d.localPresence ?? '',
          aumSize: d.aumSize ?? '',
          optInEmail: d.optInEmail ?? false,
          agreePrivacy: d.agreePrivacy ?? false,
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
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  function toggleSector(value: string) {
    const current = formData.investmentInterestSectors;
    const updated = current.includes(value)
      ? current.filter(s => s !== value)
      : [...current, value];
    handleChange('investmentInterestSectors', updated);
    if (errors.investmentInterestSectors) {
      setErrors(prev => ({ ...prev, investmentInterestSectors: undefined }));
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

  // ── Payload builder ──────────────────────────────────────────────────────────

  function buildPayload(): UpdateInvestorProfileRequest {
    return {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      ...(formData.jabatan.trim() && { jabatan: formData.jabatan.trim() }),
      ...(formData.companyName.trim() && { companyName: formData.companyName.trim() }),
      ...(formData.investmentInterestSectors.length > 0 && {
        investmentInterestSectors: formData.investmentInterestSectors,
      }),
      ...(formData.investmentScale && { investmentScale: formData.investmentScale }),
      ...(formData.preferredInvestmentInstrument.trim() && {
        preferredInvestmentInstrument: formData.preferredInvestmentInstrument.trim(),
      }),
      ...(formData.engagementModel.trim() && {
        engagementModel: formData.engagementModel.trim(),
      }),
      ...(formData.stagePreference && { stagePreference: formData.stagePreference }),
      ...(formData.riskAppetite && { riskAppetite: formData.riskAppetite }),
      ...(formData.esgStandards.trim() && { esgStandards: formData.esgStandards.trim() }),
      ...(formData.localPresence.trim() && { localPresence: formData.localPresence.trim() }),
      ...(formData.aumSize.trim() && { aumSize: formData.aumSize.trim() }),
      optInEmail: formData.optInEmail,
      agreePrivacy: formData.agreePrivacy,
    };
  }

  // ── Resolve organisation name via get-or-create ─────────────────────────────

  async function resolveOrganization(payload: UpdateInvestorProfileRequest): Promise<void> {
    const companyName = formData.companyName.trim();
    if (!companyName) return;

    const orgResponse = await getOrCreateOrganization(companyName);
    if (orgResponse.status !== 200) {
      throw new Error(orgResponse.message || 'Gagal membuat/mengambil organisasi');
    }
    payload.companyName = orgResponse.data?.name || companyName;
  }

  // ── Handle profile update error ─────────────────────────────────────────────

  function handleProfileUpdateError(err: unknown): void {
    if (err instanceof ApiError) {
      if (err.status === 409) {
        setErrors(prev => ({ ...prev, email: err.message }));
      }
      showToast('danger', 'Gagal memperbarui profil', err.message);
    } else {
      showToast('danger', 'Gagal memperbarui profil', 'Terjadi kesalahan. Silakan coba lagi.');
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = buildPayload();

    setIsSubmitting(true);
    try {
      await resolveOrganization(payload);
      await updateInvestorProfile(payload);
      setOriginalData(formData);
      showToast('success', 'Profil berhasil diperbarui!', 'Data profil Anda telah disimpan.');
    } catch (err) {
      handleProfileUpdateError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Discard changes ──────────────────────────────────────────────────────────

  function handleCancel() {
    setFormData(originalData);
    setErrors({});
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (isFetching) {
    return (
      <div className="flex gap-5 items-start">
        <div className="flex-1 bg-white rounded-[20px] border border-grey overflow-hidden animate-pulse">
          <div className="h-12 bg-primary" />
          <div className="p-8 space-y-4">
            {['skeleton-profile-1', 'skeleton-profile-2', 'skeleton-profile-3', 'skeleton-profile-4', 'skeleton-profile-5', 'skeleton-profile-6'].map((id) => (
              <div key={id} className="h-10 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
        <div className="w-[440px] shrink-0 bg-white rounded-[20px] border border-grey overflow-hidden animate-pulse">
          <div className="h-12 bg-primary" />
          <div className="p-8 space-y-4">
            {['skeleton-password-1', 'skeleton-password-2', 'skeleton-password-3'].map((id) => (
              <div key={id} className="h-10 rounded-lg bg-gray-100" />
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
      <div className="flex-1 bg-white rounded-[20px] border border-grey">
        {/* Card header */}
        <div className="bg-primary px-4 py-3 flex justify-center items-center rounded-t-[20px]">
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
              id="phoneNumber"
              label="Nomor Telepon"
              placeholder="+628123456789"
              required
              value={formData.phoneNumber}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              error={errors.phoneNumber}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <OrganizationAutocomplete
              id="companyName"
              label="Organisasi / Instansi"
              placeholder="Cari atau tambah organisasi..."
              value={formData.companyName}
              onChange={v => handleChange('companyName', v)}
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
            id="investmentScale"
            label="Budget Investasi"
            placeholder="Pilih rentang budget"
            options={BUDGET_OPTIONS}
            value={formData.investmentScale}
            onValueChange={v => handleChange('investmentScale', v)}
            error={errors.investmentScale}
            disabled={isSubmitting}
          />

          {/* Sektor Prioritas */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium text-primary">Sektor Prioritas</label>
            </div>

            <div className="rounded-lg border border-gray-200 p-3">
              <div className="grid grid-cols-3 gap-2">
                {INVESTOR_SECTOR_OPTIONS.map(sector => (
                  <label
                    key={sector.value}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-xs',
                      formData.investmentInterestSectors.includes(sector.value)
                        ? 'text-primary font-medium'
                        : 'text-gray-600 hover:text-primary'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.investmentInterestSectors.includes(sector.value)}
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
              {formData.investmentInterestSectors.length > 0 && (
                <span className="ml-1 text-primary font-medium">
                  ({formData.investmentInterestSectors.length} dipilih)
                </span>
              )}
            </p>

            {errors.investmentInterestSectors && (
              <p className="text-xs text-danger">{errors.investmentInterestSectors}</p>
            )}
          </div>

          {/* ── Section: Detail Profil Investor (optional extended fields) ── */}
          <SectionDivider label="Detail Profil Investor" />

          <div className="grid grid-cols-2 gap-4">
            <Select
              id="stagePreference"
              label="Stage Preferensi"
              placeholder="Pilih stage"
              options={STAGE_OPTIONS}
              value={formData.stagePreference}
              onValueChange={v => handleChange('stagePreference', v)}
              disabled={isSubmitting}
            />
            <Select
              id="riskAppetite"
              label="Risk Appetite"
              placeholder="Pilih level risiko"
              options={RISK_OPTIONS}
              value={formData.riskAppetite}
              onValueChange={v => handleChange('riskAppetite', v)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="preferredInvestmentInstrument"
              label="Instrumen Investasi Pilihan"
              placeholder="e.g. Equity, Bonds"
              value={formData.preferredInvestmentInstrument}
              onChange={e => handleChange('preferredInvestmentInstrument', e.target.value)}
              disabled={isSubmitting}
            />
            <TextInput
              id="engagementModel"
              label="Model Keterlibatan"
              placeholder="e.g. Direct Investment"
              value={formData.engagementModel}
              onChange={e => handleChange('engagementModel', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="aumSize"
              label="AUM Size"
              placeholder="e.g. 500M USD"
              value={formData.aumSize}
              onChange={e => handleChange('aumSize', e.target.value)}
              disabled={isSubmitting}
            />
            <TextInput
              id="localPresence"
              label="Kehadiran Lokal"
              placeholder="e.g. Jakarta, Surabaya"
              value={formData.localPresence}
              onChange={e => handleChange('localPresence', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <TextInput
            id="esgStandards"
            label="Standar ESG"
            placeholder="e.g. GRI Standards"
            value={formData.esgStandards}
            onChange={e => handleChange('esgStandards', e.target.value)}
            disabled={isSubmitting}
          />

          {/* ── Persetujuan ── */}
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.optInEmail}
                onChange={e => handleChange('optInEmail', e.target.checked)}
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
                checked={formData.agreePrivacy}
                onChange={e => handleChange('agreePrivacy', e.target.checked)}
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
      <ChangePasswordCard />
    </div>
  );
}
