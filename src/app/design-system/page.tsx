'use client';

import Link from 'next/link';
import { useState, useId } from 'react';
import { Button, SubmitProjectButton, VerifyProjectButton } from '@/shared/components/button';
import { showToast, Toast } from '@/shared/components/toast';
import { TextInput, Textarea, FileInput, Select } from '@/shared/components/form-fields';
import type { ToastVariant } from '@/shared/components/toast';
import StatusBadge from '@/shared/components/status-badge';
import { StatCard } from '@/shared/components/stat-card';
import { ProjectCard } from '@/shared/components/project-card';
import Navbar from '@/shared/components/layout/navbar';
import { FileEdit, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

// ---------------------------------------------------------------------------
// Color / typography data (unchanged)
// ---------------------------------------------------------------------------
const BRAND_COLORS = [
  {
    name: 'Primary',
    variable: '--brand-primary',
    hex: '#002855',
    bg: 'bg-primary',
    text: 'text-white',
  },
  {
    name: 'Secondary',
    variable: '--brand-secondary',
    hex: '#F59E0B',
    bg: 'bg-secondary',
    text: 'text-white',
  },
  {
    name: 'Primary Light',
    variable: '--brand-primary-light',
    hex: '#DBEAFE',
    bg: 'bg-primary-light',
    text: 'text-primary',
  },
  {
    name: 'Secondary Light',
    variable: '--brand-secondary-light',
    hex: '#F59E0B',
    bg: 'bg-secondary-light',
    text: 'text-primary',
  },
];

const STATE_COLORS = [
  {
    name: 'Draft',
    base: { bg: 'bg-draft', hex: '#4B5563' },
    light: { bg: 'bg-draft-light', hex: '#4B5563' },
  },
  {
    name: 'Info',
    base: { bg: 'bg-info', hex: '#2859A9' },
    light: { bg: 'bg-info-light', hex: '#DBEAFE' },
  },
  {
    name: 'Warning',
    base: { bg: 'bg-warning', hex: '#EA580C' },
    light: { bg: 'bg-warning-light', hex: '#FED7AA' },
  },
  {
    name: 'Success',
    base: { bg: 'bg-success', hex: '#16A34A' },
    light: { bg: 'bg-success-light', hex: '#DCFCE7' },
  },
  {
    name: 'Danger',
    base: { bg: 'bg-danger', hex: '#DC2626' },
    light: { bg: 'bg-danger-light', hex: '#FEE2E2' },
  },
];

const TYPE_SCALE = [
  { label: '4xl / 36px', className: 'text-4xl' },
  { label: '3xl / 30px', className: 'text-3xl' },
  { label: '2xl / 24px', className: 'text-2xl' },
  { label: 'xl / 20px', className: 'text-xl' },
  { label: 'lg / 18px', className: 'text-lg' },
  { label: 'base / 16px', className: 'text-base' },
  { label: 'sm / 14px', className: 'text-sm' },
  { label: 'xs / 12px', className: 'text-xs' },
];

const TYPE_WEIGHTS = [
  { label: 'Light 300', className: 'font-light' },
  { label: 'Regular 400', className: 'font-normal' },
  { label: 'Medium 500', className: 'font-medium' },
  { label: 'Semibold 600', className: 'font-semibold' },
  { label: 'Bold 700', className: 'font-bold' },
];

const ALERT_DEMOS: { variant: ToastVariant; label: string; title: string; description: string }[] =
  [
    {
      variant: 'info',
      label: 'Info',
      title: 'Kebijaksanaan Privasi',
      description:
        'Kamu bisa melihat Kebijaksanaan Privasi, Syarat & Ketentuan, dan lainnya di sini.',
    },
    {
      variant: 'warning',
      label: 'Warning',
      title: 'Perhatian',
      description: 'Pastikan semua data yang diisi sudah benar sebelum melanjutkan pengajuan.',
    },
    {
      variant: 'success',
      label: 'Success',
      title: 'Berhasil Disimpan',
      description: 'Data proyek berhasil disimpan dan sedang menunggu verifikasi.',
    },
    {
      variant: 'danger',
      label: 'Danger',
      title: 'Terjadi Kesalahan',
      description: 'Gagal mengirim data. Periksa koneksi internet Anda dan coba lagi.',
    },
  ];

const SELECT_OPTIONS = [
  { value: 'jalan', label: 'Jalan & Jembatan' },
  { value: 'air', label: 'Sumber Daya Air' },
  { value: 'energi', label: 'Energi' },
  { value: 'disabled-opt', label: 'Belum Tersedia', disabled: true },
];

// ---------------------------------------------------------------------------
// Form validation helpers
// ---------------------------------------------------------------------------
interface FormValues {
  name: string;
  email: string;
  description: string;
  category: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) errors.name = 'Nama tidak boleh kosong';
  else if (values.name.trim().length < 3) errors.name = 'Nama minimal 3 karakter';

  if (!values.email.trim()) errors.email = 'Email tidak boleh kosong';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = 'Format email tidak valid';

  if (!values.description.trim()) errors.description = 'Deskripsi tidak boleh kosong';
  else if (values.description.trim().length < 20)
    errors.description = `Minimal 20 karakter (saat ini ${values.description.trim().length})`;

  if (!values.category) errors.category = 'Pilih salah satu kategori';

  return errors;
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-primary whitespace-nowrap">{title}</h2>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</h3>
      {children}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-gray-50 p-6 ${className ?? ''}`}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DesignSystemPage() {
  // ── Form state ───────────────────────────────────────────────────────────
  const uid = useId();
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    description: '',
    category: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

  const handleChange = (field: keyof FormValues, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      const fieldError = validate(next)[field];
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldError = validate(values)[field];
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, description: true, category: true };
    setTouched(allTouched);
    const errs = validate(values);
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      showToast(
        'success',
        'Form valid!',
        'Data proyek berhasil disimpan dan sedang menunggu verifikasi.'
      );
      setValues({ name: '', email: '', description: '', category: '' });
      setTouched({});
      setErrors({});
    } else {
      showToast(
        'danger',
        'Ada kesalahan',
        'Pastikan data telah tersisi dengan benar kemudian submit kembali.'
      );
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-primary px-10 py-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">SIFPI</p>
        <h1 className="text-3xl font-bold text-white">Design System</h1>
        <p className="mt-1 text-sm text-white/70">
          Sistem Informasi Fasilitasi Proyek Infrastruktur — component reference
        </p>
      </div>
      
      <div className="mx-auto max-w-5xl px-10 py-12 flex flex-col gap-16">
        {/* ---------------------------------------------------------------- */}
        {/* NAVBAR (preview)                                                   */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Navbar">
          <SubSection title="Public (unauthenticated)">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <Navbar variant="public" />
            </div>
          </SubSection>
          <SubSection title="Authenticated">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <Navbar variant="authenticated" />
            </div>
          </SubSection>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* SIDEBAR / DASHBOARD LAYOUT                                        */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Sidebar & Dashboard Layout">
          <p className="text-sm text-gray-500 mb-3">
            The sidebar layout is used for authenticated dashboard pages. It cannot be embedded
            inline — open the live page to see it in context.
          </p>
          <Link
            href="/example/dashboard"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            Open /dashboard →
          </Link>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* TYPOGRAPHY                                                        */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Typography">
          <Card>
            <p className="text-xs text-gray-400 mb-5 font-mono">
              font-family: "Segoe UI", "Segoe UI Variable", system-ui, sans-serif
            </p>
            <SubSection title="Type scale">
              <div className="divide-y divide-gray-100">
                {TYPE_SCALE.map(({ label, className }) => (
                  <div key={label} className="flex items-baseline justify-between py-3 gap-6">
                    <span className="text-xs text-gray-400 w-28 shrink-0 font-mono">{label}</span>
                    <span className={`${className} font-normal text-primary flex-1`}>
                      Aa — The quick brown fox
                    </span>
                  </div>
                ))}
              </div>
            </SubSection>
            <div className="mt-6">
              <SubSection title="Weights (base size)">
                <div className="divide-y divide-gray-100">
                  {TYPE_WEIGHTS.map(({ label, className }) => (
                    <div key={label} className="flex items-center justify-between py-3 gap-6">
                      <span className="text-xs text-gray-400 w-28 shrink-0 font-mono">{label}</span>
                      <span className={`${className} text-base text-primary flex-1`}>
                        Sistem Informasi Fasilitasi Proyek Infrastruktur
                      </span>
                    </div>
                  ))}
                </div>
              </SubSection>
            </div>
          </Card>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* COLORS                                                            */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Colors">
          <SubSection title="Brand">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BRAND_COLORS.map(({ name, variable, hex, bg }) => (
                <div
                  key={name}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-100"
                >
                  <div className={`${bg} h-20`} />
                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium text-primary">{name}</p>
                    <p className="text-xs text-gray-400 font-mono">{hex}</p>
                    <p className="text-xs text-gray-300 font-mono mt-0.5">{variable}</p>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>
          <SubSection title="State">
            <div className="grid grid-cols-5 gap-3">
              {STATE_COLORS.map(({ name, base, light }) => (
                <div key={name} className="flex flex-col gap-2">
                  <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100">
                    <div className={`${base.bg} h-14`} />
                    <div className="p-2.5 bg-white">
                      <p className="text-xs font-medium text-primary">{name}</p>
                      <p className="text-xs text-gray-400 font-mono">{base.hex}</p>
                    </div>
                  </div>
                  <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100">
                    <div className={`${light.bg} h-14`} />
                    <div className="p-2.5 bg-white">
                      <p className="text-xs font-medium text-primary">{name} Light</p>
                      <p className="text-xs text-gray-400 font-mono">{light.hex}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        <Section title="Status Badge">
          <div className="flex flex-wrap items-center gap-3 gap-y-4">
            <StatusBadge variant="draft">Draft</StatusBadge>
            <StatusBadge variant="submitted">Submitted</StatusBadge>
            <StatusBadge variant="in-review">In review</StatusBadge>
            <StatusBadge variant="approved">Approved</StatusBadge>
            <StatusBadge variant="rejected">Rejected</StatusBadge>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* STAT CARDS                                                        */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Stat Cards">
          <Card className="flex flex-col gap-8">
            <SubSection title="Variants">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileEdit} title="Draft Proyek" value={5} variant="draft" subtitle="Number" />
                <StatCard icon={Clock} title="Sedang Direview" value={3} variant="info" subtitle="Number" />
                <StatCard icon={CheckCircle} title="Telah Disetujui" value={12} variant="success" subtitle="Number" />
                <StatCard icon={AlertTriangle} title="Butuh Revisi" value={2} variant="warning" subtitle="Number" />
              </div>
            </SubSection>
            <SubSection title="Active State">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileEdit} title="Draft Proyek" value={5} variant="draft" isActive />
                <StatCard icon={Clock} title="Sedang Direview" value={3} variant="info" isActive />
                <StatCard icon={CheckCircle} title="Telah Disetujui" value={12} variant="success" isActive />
                <StatCard icon={AlertTriangle} title="Butuh Revisi" value={2} variant="warning" isActive />
              </div>
            </SubSection>
            <SubSection title="Danger Variant">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard icon={AlertTriangle} title="Ditolak" value={1} variant="danger" />
                <StatCard icon={AlertTriangle} title="Ditolak" value={1} variant="danger" isActive />
              </div>
            </SubSection>
            <SubSection title="Custom Usage">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={TrendingUp} title="Total Proyek" value={22} variant="info" subtitle="Semua proyek" />
                <StatCard icon={CheckCircle} title="Proyek Aktif" value={15} variant="success" subtitle="Berjalan" />
                <StatCard icon={Clock} title="Menunggu" value={7} variant="warning" subtitle="Pending" />
              </div>
            </SubSection>
          </Card>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* PROJECT CARDS                                                     */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Project Cards">
          <Card className="flex flex-col gap-8">
            <SubSection title="With Image">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProjectCard
                  project={{
                    id: 1,
                    name: "Proyek Pembangunan Jalan Tol Jakarta-Bandung",
                    sector: "TOLL_ROAD",
                    status: "DIAJUKAN",
                    location: "Jawa Barat",
                    description: "Proyek pembangunan infrastruktur jalan tol untuk meningkatkan konektivitas antar kota dengan target penyelesaian 2 tahun.",
                    ownerName: "PT Jasa Marga",
                    budget: "Rp 5.000.000.000",
                    locationImageUrl: "https://images.unsplash.com/photo-1569163139394-de4798aa62b0?w=800&q=80"
                  }}
                />
                <ProjectCard
                  project={{
                    id: 2,
                    name: "Proyek MRT Jakarta Fase 3",
                    sector: "PUBLIC_TRANSPORTATION",
                    status: "TERVERIFIKASI",
                    location: "DKI Jakarta",
                    description: "Pengembangan jalur MRT Jakarta untuk melayani koridor Utara-Selatan dengan teknologi modern dan ramah lingkungan.",
                    ownerName: "PT MRT Jakarta",
                    budget: "Rp 15.000.000.000",
                    locationImageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"
                  }}
                />
                <ProjectCard
                  project={{
                    id: 3,
                    name: "Pembangunan Bandara Internasional Baru",
                    sector: "AVIATION",
                    status: "IN_REVIEW",
                    location: "Jawa Tengah",
                    description: "Proyek pembangunan bandara internasional untuk mendukung pertumbuhan ekonomi dan pariwisata di Jawa Tengah.",
                    ownerName: "Kementerian Perhubungan",
                    budget: "Rp 25.000.000.000",
                    locationImageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80"
                  }}
                />
              </div>
            </SubSection>
            <SubSection title="Without Image (Placeholder)">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProjectCard
                  project={{
                    id: 4,
                    name: "Proyek Perumahan Rakyat Subsidi",
                    sector: "AFFORDABLE_HOUSING_AND_TRANSIT_ORIENTED_DEVELOPMENT",
                    status: "DRAFT",
                    location: "Banten",
                    description: "Pembangunan perumahan subsidi untuk masyarakat berpenghasilan rendah dengan fasilitas lengkap dan akses transportasi mudah.",
                    ownerName: "Kementerian PUPR",
                    budget: "Rp 3.500.000.000"
                  }}
                />
                <ProjectCard
                  project={{
                    id: 5,
                    name: "Proyek Pembangkit Listrik Tenaga Surya",
                    sector: "OIL_GAS_AND_ENERGY",
                    status: "PERBAIKAN_DATA",
                    location: "Nusa Tenggara Timur",
                    description: "Pembangunan pembangkit listrik tenaga surya untuk meningkatkan akses listrik di daerah terpencil dengan energi terbarukan.",
                    ownerName: "PT PLN",
                    budget: "Rp 8.000.000.000"
                  }}
                />
                <ProjectCard
                  project={{
                    id: 6,
                    name: "Modernisasi Pelabuhan Tanjung Priok",
                    sector: "MARITIME",
                    status: "TERPUBLIKASI",
                    location: "DKI Jakarta",
                    description: "Modernisasi fasilitas pelabuhan untuk meningkatkan kapasitas bongkar muat dan efisiensi logistik nasional.",
                    ownerName: "PT Pelindo",
                    budget: "Rp 12.000.000.000"
                  }}
                />
              </div>
            </SubSection>
            <SubSection title="All Status Variants">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProjectCard
                  project={{
                    id: 7,
                    name: "Draft Project Example",
                    sector: "WASTE_MANAGEMENT",
                    status: "DRAFT",
                    location: "Surabaya",
                    description: "Example of a draft project card with all standard information displayed.",
                    ownerName: "Example Owner",
                    budget: "Rp 1.000.000.000"
                  }}
                />
                <ProjectCard
                  project={{
                    id: 8,
                    name: "Submitted Project Example",
                    sector: "WATER_RESOURCE_DRINKING_WATER_AND_IRRIGATION",
                    status: "DIAJUKAN",
                    location: "Medan",
                    description: "Example of a submitted project awaiting review from authorities.",
                    ownerName: "Example Owner",
                    budget: "Rp 2.000.000.000"
                  }}
                />
                <ProjectCard
                  project={{
                    id: 9,
                    name: "In Review Project Example",
                    sector: "HEALTH",
                    status: "IN_REVIEW",
                    location: "Makassar",
                    description: "Example of a project currently under review by the review team.",
                    ownerName: "Example Owner",
                    budget: "Rp 3.000.000.000"
                  }}
                />
                <ProjectCard
                  project={{
                    id: 10,
                    name: "Revision Needed Example",
                    sector: "EDUCATION_RESEARCH_AND_DEVELOPMENT",
                    status: "PERBAIKAN_DATA",
                    location: "Yogyakarta",
                    description: "Example of a project that needs data revision before approval.",
                    ownerName: "Example Owner",
                    budget: "Rp 4.000.000.000"
                  }}
                />
                <ProjectCard
                  project={{
                    id: 11,
                    name: "Verified Project Example",
                    sector: "DIGITAL_AND_TELECOMMUNICATIONS",
                    status: "TERVERIFIKASI",
                    location: "Bandung",
                    description: "Example of a verified project ready for publication.",
                    ownerName: "Example Owner",
                    budget: "Rp 5.000.000.000"
                  }}
                />
                <ProjectCard
                  project={{
                    id: 12,
                    name: "Published Project Example",
                    sector: "LAND_BASED_TRANSPORT",
                    status: "TERPUBLIKASI",
                    location: "Semarang",
                    description: "Example of a published project visible to all stakeholders.",
                    ownerName: "Example Owner",
                    budget: "Rp 6.000.000.000"
                  }}
                />
              </div>
            </SubSection>
          </Card>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* BUTTONS                                                           */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Buttons">
          <Card className="flex flex-col gap-8">
            <SubSection title="Variants">
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="filled">Filled</Button>
                <Button variant="outlined">Outlined</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </SubSection>
            <SubSection title="Disabled">
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="filled" disabled>
                  Filled
                </Button>
                <Button variant="outlined" disabled>
                  Outlined
                </Button>
                <Button variant="ghost" disabled>
                  Ghost
                </Button>
              </div>
            </SubSection>
            <SubSection title="Sizes (filled)">
              <div className="flex flex-wrap gap-3 items-end">
                <Button variant="filled" size="xs">
                  Extra Small
                </Button>
                <Button variant="filled" size="sm">
                  Small
                </Button>
                <Button variant="filled" size="default">
                  Default
                </Button>
                <Button variant="filled" size="lg">
                  Large
                </Button>
              </div>
            </SubSection>
            <SubSection title="Special Actions">
              <div className="flex flex-wrap gap-3 items-center">
                <SubmitProjectButton />
                <VerifyProjectButton />
                <SubmitProjectButton disabled />
                <VerifyProjectButton disabled />
              </div>
            </SubSection>
          </Card>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* ALERTS                                                            */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Alerts">
          <p className="text-sm text-gray-500 -mt-2">
            Click a button to see the toast appear live in the top-right corner.
          </p>
          <div className="flex flex-col gap-3">
            {ALERT_DEMOS.map(({ variant, label, title, description }) => (
              <div key={variant} className="flex gap-3 items-start">
                {/* static preview */}
                <Toast
                  variant={variant}
                  title={title}
                  description={description}
                  className="flex-1"
                />
                {/* live trigger */}
                <Button
                  variant="outlined"
                  size="sm"
                  className="shrink-0 mt-1"
                  onClick={() => showToast(variant, title, description)}
                >
                  Try {label}
                </Button>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* FORM FIELDS                                                       */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Form Fields">
          <Card className="flex flex-col gap-8">
            <SubSection title="Static states reference">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput id="ref-default" label="Default" placeholder="Type something..." />
                <TextInput
                  id="ref-hint"
                  label="With hint"
                  placeholder="Type something..."
                  hint="This is a helper hint below the field"
                  required
                />
                <TextInput
                  id="ref-error"
                  label="Error state"
                  defaultValue="wrong value"
                  error="This field has an error"
                />
                <TextInput
                  id="ref-disabled"
                  label="Disabled"
                  value="Read-only value"
                  disabled
                  readOnly
                />
              </div>
            </SubSection>

            <div className="h-px bg-gray-200" />

            {/* Live form demo */}
            <SubSection title="Live validation demo — try submitting with empty or invalid fields">
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    id={`${uid}-name`}
                    label="Nama Lengkap"
                    placeholder="Min. 3 karakter"
                    required
                    hint="Gunakan nama sesuai identitas resmi"
                    value={values.name}
                    error={errors.name}
                    onChange={e => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                  />
                  <TextInput
                    id={`${uid}-email`}
                    label="Email PIC"
                    placeholder="nama@email.com"
                    type="email"
                    required
                    value={values.email}
                    error={errors.email}
                    onChange={e => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                  />
                </div>

                <Textarea
                  id={`${uid}-desc`}
                  label="Deskripsi Proyek"
                  placeholder="Jelaskan proyek secara singkat... (min. 20 karakter)"
                  required
                  hint={`${values.description.trim().length} / 20 karakter minimum`}
                  value={values.description}
                  error={errors.description}
                  onChange={e => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    id={`${uid}-cat`}
                    label="Kategori Proyek"
                    placeholder="Pilih kategori"
                    required
                    options={SELECT_OPTIONS}
                    hint="Pilih kategori yang paling sesuai"
                    value={values.category}
                    error={errors.category}
                    onValueChange={v => {
                      handleChange('category', v);
                      handleBlur('category');
                    }}
                  />
                  <FileInput
                    id={`${uid}-file`}
                    label="Dokumen Pendukung"
                    hint="PDF, DOC, DOCX — maks. 10 MB"
                    accept=".pdf,.doc,.docx"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" variant="filled">
                    Validasi & Kirim
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setValues({ name: '', email: '', description: '', category: '' });
                      setErrors({});
                      setTouched({});
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </SubSection>
          </Card>
        </Section>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-10 py-6 mt-8">
        <p className="text-xs text-gray-400 text-center">
          SIFPI Design System · Semester 6 · Propensi
        </p>
      </div>
    </div>
  );
}
