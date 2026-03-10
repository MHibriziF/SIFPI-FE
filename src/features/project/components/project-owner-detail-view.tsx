'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Download,
  Mail,
  Phone,
  Info,
  Pencil,
} from 'lucide-react';
import { SectionCard } from '@/features/project/components/section-card';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { getProjectById, getProjectHistory } from '@/features/project/services';
import { ApiError } from '@/shared/types/api';
import type { ProjectDetailDTO, ProjectHistoryItemDTO } from '@/features/project/types';
import { ProjectStatus } from '@/shared/enums/project-status';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIDR(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${(value * 100).toFixed(2)}%`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Approval Timeline ────────────────────────────────────────────────────────

const TIMELINE_STEPS: { status: ProjectStatus; label: string }[] = [
  { status: ProjectStatus.DRAFT,          label: 'Dibuat (Draft)' },
  { status: ProjectStatus.DIAJUKAN,       label: 'Diajukan' },
  { status: ProjectStatus.IN_REVIEW,      label: 'In Review' },
  { status: ProjectStatus.PERBAIKAN_DATA, label: 'Perbaikan Data' },
  { status: ProjectStatus.TERVERIFIKASI,  label: 'Terverifikasi' },
  { status: ProjectStatus.TERPUBLIKASI,   label: 'Terpublikasi' },
];

function getStepDate(
  step: ProjectStatus,
  history: ProjectHistoryItemDTO[],
  createdAt: string
): string | null {
  if (step === ProjectStatus.DRAFT) return createdAt;
  const entry = history.find(h => h.status === step);
  return entry?.changedAt ?? null;
}

interface ApprovalTimelineProps {
  currentStatus: string;
  history: ProjectHistoryItemDTO[];
  createdAt: string;
}

function ApprovalTimeline({ currentStatus, history, createdAt }: ApprovalTimelineProps) {
  const reachedStatuses = new Set<string>([
    ProjectStatus.DRAFT,
    ...history.map(h => h.status),
  ]);

  return (
    <div className="flex flex-col pb-1">
      {TIMELINE_STEPS.map((step, i) => {
        const isActive = reachedStatuses.has(step.status);
        const isCurrent = currentStatus === step.status;
        const date = getStepDate(step.status, history, createdAt);

        return (
          <div key={step.status} className="flex flex-col">
            <div className="flex items-center gap-4">
              {/* Dot */}
              <div
                className={`size-5 rounded-full flex-shrink-0 border-2 ${
                  isCurrent
                    ? 'bg-primary border-primary'
                    : isActive
                      ? 'bg-success border-success'
                      : 'bg-white border-gray-300'
                }`}
              />
              <div className="flex flex-col">
                <span
                  className={`text-sm font-semibold ${
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`text-xs ${isActive ? 'text-gray-600' : 'text-gray-400'}`}
                >
                  {date ? formatDate(date) : 'Menunggu'}
                </span>
              </div>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div
                className={`ml-[9px] w-px h-6 ${isActive ? 'bg-primary' : 'bg-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Financial Row ────────────────────────────────────────────────────────────

function FinancialRow({
  label,
  value,
  border = true,
}: {
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <div className={`px-8 py-3 flex flex-col gap-1 ${border ? 'border-b border-gray-200' : ''}`}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-lg font-bold text-gray-900">{value}</span>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  border = true,
}: {
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <div className={`px-8 py-3 flex gap-4 items-start ${border ? 'border-b border-gray-200' : ''}`}>
      <Info className="size-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        <span className="text-sm text-gray-700">{value}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProjectOwnerDetailViewProps {
  projectId: number;
  canEdit: boolean;
}

export default function ProjectOwnerDetailView({ projectId, canEdit }: ProjectOwnerDetailViewProps) {
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetailDTO | null>(null);
  const [history, setHistory] = useState<ProjectHistoryItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectRes, historyRes] = await Promise.all([
        getProjectById(projectId),
        getProjectHistory(projectId),
      ]);
      setProject(projectRes.data);
      setHistory(historyRes.data ?? []);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          router.replace('/project-owner/projects');
          return;
        }
        showToast('danger', 'Gagal memuat detail proyek', err.message);
      } else {
        showToast('danger', 'Gagal memuat detail proyek', 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Loading skeleton ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        {/* Hero */}
        <div className="bg-grey px-24 py-10">
          <div className="h-10 w-64 bg-gray-300 rounded mb-3" />
          <div className="h-5 w-40 bg-gray-200 rounded" />
        </div>
        {/* Body skeleton */}
        <div className="px-20 flex flex-col gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-40 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) return null;

  // Button is only shown when the user has UPDATE permission AND the project
  // is in PERBAIKAN_DATA state (business rule: revisions only possible then).
  const showEditButton = canEdit && project.status === ProjectStatus.PERBAIKAN_DATA;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-10 pb-10">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-grey px-24 py-10">
        <h1 className="text-4xl font-normal text-primary leading-tight">Manajemen Proyek</h1>
        <p className="mt-2.5 text-lg text-gray-900">Kelola proyek yang diajukan</p>
      </div>

      {/* ── Breadcrumb + Title ────────────────────────────────────────── */}
      <div className="px-20 flex flex-col gap-3">
        <span className="text-lg text-gray-500">
          Projects /{' '}
          <span className="font-semibold text-primary">#{project.id}</span>
        </span>
        <h2 className="text-3xl font-bold text-primary leading-tight">{project.name}</h2>
        <Link
          href="/project-owner/projects"
          className="flex items-center gap-1.5 text-lg text-primary hover:underline w-fit"
        >
          <ChevronLeft className="size-5" />
          Lihat semua riwayat proyek
        </Link>
      </div>

      {/* ── Panel Verifikasi + Metadata Proyek ───────────────────────── */}
      <div className="px-20 flex gap-5 flex-wrap">

        {/* Panel Verifikasi */}
        <div className="flex-1 min-w-72">
          <SectionCard>
            <SectionCard.Header title="Panel Verifikasi" />
            <SectionCard.Body className="flex gap-5 items-start">
              {/* Notes area */}
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-sm text-primary">Catatan Verifikasi Admin</span>
                <div className="border border-gray-300 rounded-lg px-4 py-3 min-h-[136px] bg-white text-sm text-gray-500">
                  {project.rejectionReason ?? 'Tidak ada catatan dari admin.'}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 w-56 flex-shrink-0">
                {showEditButton && (
                  <Button
                    variant="filled"
                    className="w-full bg-success hover:bg-success/85 justify-center gap-2"
                    asChild
                  >
                    <Link href={`/project-owner/projects/${project.id}/edit`}>
                      <Pencil className="size-4" />
                      Revisi (Edit) Proyek
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outlined"
                  className="w-full justify-center"
                  asChild
                >
                  <Link href="/project-owner/projects">Kembali ke semua proyek</Link>
                </Button>
              </div>
            </SectionCard.Body>
          </SectionCard>
        </div>

        {/* Metadata Proyek */}
        <div className="w-80 flex-shrink-0">
          <SectionCard>
            <SectionCard.Header title="Metadata Proyek" />
            <SectionCard.Body className="flex flex-col gap-3">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr>
                    <td className="py-1.5 text-gray-900 font-medium w-36 align-top">ID Proyek</td>
                    <td className="py-1.5 text-gray-600">#{project.id}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-900 font-medium align-middle">Status Proyek</td>
                    <td className="py-1.5">
                      <StatusBadge variant={project.status as Parameters<typeof StatusBadge>[0]['variant']} />
                    </td>
                  </tr>
                  <tr><td className="h-4" colSpan={2} /></tr>
                  <tr>
                    <td className="py-1.5 text-gray-900 font-medium">Terakhir diedit</td>
                    <td className="py-1.5 text-gray-600">{formatDate(project.editedAt)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-900 font-medium">Tanggal dibuat</td>
                    <td className="py-1.5 text-gray-600">{formatDate(project.createdAt)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-900 font-medium" colSpan={2}>
                      <a
                        href={`/api/projects/${projectId}/file`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary underline"
                      >
                        <Download className="size-4" />
                        Unduh Dokumen Proyek
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </SectionCard.Body>
          </SectionCard>
        </div>
      </div>

      {/* ── Two-column body ───────────────────────────────────────────── */}
      <div className="px-24 flex gap-5 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="basis-1/3 min-w-0 flex flex-col gap-5">

          {/* Strategic Narrative / Value Proposition */}
          <SectionCard>
            <SectionCard.Header title="Strategic Narrative / Value Proposition" />
            <SectionCard.Body className="flex gap-8 items-start">
              <div className="w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/projects/${projectId}/location-image`}
                  alt="Location"
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML =
                      '<span class="text-gray-400 text-sm">Gambar belum tersedia</span>';
                  }}
                />
              </div>
              <p className="text-sm leading-relaxed text-gray-800 flex-1">
                {project.valueProposition || '—'}
              </p>
            </SectionCard.Body>
          </SectionCard>

          {/* Project Structure */}
          <SectionCard>
            <SectionCard.Header title="Project Structure" />
            <SectionCard.Body>
              <div className="rounded-xl overflow-hidden aspect-video w-full bg-gray-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/projects/${projectId}/structure-image`}
                  alt="Project Structure"
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML =
                      '<span class="text-gray-400 text-sm">Gambar belum tersedia</span>';
                  }}
                />
              </div>
            </SectionCard.Body>
          </SectionCard>

          {/* Additional Information */}
          {project.additionalInfo && (
            <SectionCard>
              <SectionCard.Header title="Additional Information and Assumption" />
              <SectionCard.Body>
                <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
                  {project.additionalInfo}
                </p>
              </SectionCard.Body>
            </SectionCard>
          )}

          {/* Feasibility Study */}
          <SectionCard>
            <SectionCard.Header title="Feasibility Study" />
            <SectionCard.Body className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.isFeasibilityStudy
                    ? 'bg-success-light text-success'
                    : 'bg-danger-light text-danger'
                }`}
              >
                {project.isFeasibilityStudy ? 'Tersedia' : 'Belum Tersedia'}
              </span>
              <span className="text-sm text-gray-600">
                {project.isFeasibilityStudy
                  ? 'Dokumen studi kelayakan sudah tersedia.'
                  : 'Dokumen studi kelayakan belum tersedia.'}
              </span>
            </SectionCard.Body>
          </SectionCard>

          {/* Financials */}
          <SectionCard>
            <SectionCard.Header title="Financials" />
            <FinancialRow label="Total Investment / Total Capex" value={formatIDR(project.totalCapex)} />
            <FinancialRow label="Additional Cost / Total Opex" value={formatIDR(project.totalOpex)} />
            <FinancialRow label="NPV" value={formatIDR(project.npv)} />
            <FinancialRow label="IRR (Equity IRR)" value={formatPercent(project.irr)} />
            <FinancialRow label="Revenue / Return Stream" value={project.revenueStream || '—'} border={false} />
          </SectionCard>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
        <div className="basis-2/3 min-w-0 flex flex-col gap-5">

          {/* Status Proyek */}
          <SectionCard>
            <SectionCard.Header title="Status Proyek" />
            <SectionCard.Body className="flex gap-6">
              <ApprovalTimeline
                currentStatus={project.status}
                history={history}
                createdAt={project.createdAt}
              />
              <div className="flex-1 flex flex-col gap-3 justify-center border-l border-gray-200 pl-6">
                <p className="text-sm font-semibold text-gray-900 max-w-[200px]">
                  Punya pertanyaan terkait pengajuan proyek? Hubungi admin melalui Whatsapp/email
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://wa.me/6285123332509"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline"
                  >
                    Hubungi via Whatsapp
                  </a>
                  <a
                    href="mailto:sekretariat@ipfo.kemenkoinfra.go.id"
                    className="text-sm text-primary underline"
                  >
                    Hubungi via Email
                  </a>
                </div>
              </div>
            </SectionCard.Body>
          </SectionCard>

          {/* Project Information */}
          <SectionCard>
            <SectionCard.Header title="Project Information" />
            <InfoRow label="Sektor" value={project.sector as string} />
            <InfoRow label="Lokasi" value={project.location} />
            <InfoRow label="Deskripsi" value={project.description} />
            <InfoRow label="Model Kerjasama / Cooperation Model" value={project.cooperationModel} />
            <InfoRow label="Periode Konsesi / Concession Period" value={`${project.concessionPeriod} Tahun`} />
            <InfoRow label="Kesiapan Aset / Asset Readiness" value={project.assetReadiness} border={false} />
          </SectionCard>

          {/* Incentives / Government Support */}
          <SectionCard>
            <SectionCard.Header title="Incentives / Government Support" />
            <SectionCard.Body>
              <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
                {project.governmentSupport || '—'}
              </p>
            </SectionCard.Body>
          </SectionCard>

          {/* Project Owner Information */}
          <SectionCard>
            <SectionCard.Header title="Project Owner Information" />
            <SectionCard.Body className="flex flex-col gap-2">
              <p className="text-base font-semibold text-gray-900">{project.contactPersonName}</p>
              <p className="text-sm text-gray-600">{project.ownerInstitution}</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="size-4 text-primary flex-shrink-0" />
                <a href={`mailto:${project.contactPersonEmail}`} className="underline">
                  {project.contactPersonEmail}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="size-4 text-primary flex-shrink-0" />
                <span>{project.contactPersonPhone}</span>
              </div>
            </SectionCard.Body>
          </SectionCard>
        </div>
      </div>

      {/* ── Indicative Timeline ───────────────────────────────────────── */}
      {project.timelines.length > 0 && (
        <div className="px-24">
          <SectionCard>
            <SectionCard.Header title="Indicative / High-level Timeline" />
            <SectionCard.Body>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {project.timelines.map(tl => (
                  <div
                    key={tl.id}
                    className="border-2 border-primary rounded-xl overflow-hidden flex-shrink-0 w-48 bg-primary-light"
                  >
                    <div className="bg-primary px-3 py-3 text-center">
                      <span className="text-white font-bold text-base whitespace-nowrap">
                        {tl.timeRange}
                      </span>
                    </div>
                    <div className="px-4 py-4">
                      <p className="text-sm text-gray-800 text-center leading-snug">
                        {tl.phaseDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard.Body>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
