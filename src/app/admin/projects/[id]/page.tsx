'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Download,
  MapPin,
  ChevronLeft,
  FolderCheck,
} from 'lucide-react';
import { getProjectDetail, approveProject, rejectProject } from '@/features/project/services';
import type {
  AdminProjectDetailDTO,
} from '@/features/project/types/admin-detail';
import { showNotification } from '@/shared/components/info-toast';
import { ApiError } from '@/shared/types/api';

/* ─────────────────────────────────────────
   Small reusable pieces
───────────────────────────────────────── */

function SectionHeader({ title }: Readonly<{ title: string }>) {
  return (
    <div className="bg-[#0f2d5e] text-white px-5 py-3 rounded-md mb-4">
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}

/* Shared card header — used by every card for consistent styling */
function CardHeader({ title }: Readonly<{ title: string }>) {
  return (
    <div className="bg-[#0f2d5e] text-white px-6 py-4 text-center">
      <h2 className="text-base font-semibold tracking-wide">{title}</h2>
    </div>
  );
}

function InfoCard({ label, value }: Readonly<{ label: string; value?: string | null }>) {
  return (
    <div className="border-b border-gray-100 px-1 py-3 last:border-b-0">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value ?? '-'}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */

function parseProjectId(id: string | string[] | undefined): number {
  if (typeof id !== 'string') return 0;
  return id.startsWith('PRJ-')
    ? parseInt(id.substring(4))
    : parseInt(id);
}

function applyCacheBusting(data: AdminProjectDetailDTO): void {
  const timestamp = `?t=${Date.now()}`;
  if (data.locationImageUrl) {
    data.locationImageUrl += timestamp;
  }
  if (data.projectStructureImageUrl) {
    data.projectStructureImageUrl += timestamp;
  }
  if (data.projectFileDownloadUrl) {
    data.projectFileDownloadUrl += timestamp;
  }
}

async function refreshProjectWithCacheBusting(id: number): Promise<AdminProjectDetailDTO | null> {
  const updatedRes = await getProjectDetail(id);
  if (updatedRes.data) {
    applyCacheBusting(updatedRes.data);
  }
  return updatedRes.data;
}

function formatNpvDisplay(npv: number | null | undefined): string {
  if (npv == null) return '-';
  if (npv === 0) return 'Under Calculation';
  return `USD ${npv.toLocaleString('en-US')} Million`;
}

function formatIrrDisplay(irr: number | null | undefined): string {
  if (irr == null) return '-';
  if (irr === 0) return 'User Charge / Under Calculation';
  return `${irr}%`;
}

function formatFeasibilityStudy(isFeasibilityStudy: boolean | null | undefined): string {
  if (isFeasibilityStudy === undefined || isFeasibilityStudy === null) return '-';
  return isFeasibilityStudy ? 'With Feasibility Study' : 'Under Preparation';
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = parseProjectId(params.id);

  const [project, setProject] = useState<AdminProjectDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');

  useEffect(() => {
    if (projectId <= 0) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getProjectDetail(projectId);
        if (res.data) {
          applyCacheBusting(res.data);
          setProject(res.data);
        } else {
          setError(res.message ?? 'Gagal memuat detail proyek');
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const handleApprove = useCallback(async () => {
    if (!project) return;
    try {
      setIsVerifying(true);
      const res = await approveProject(projectId);
      if (res.data) {
        const refreshedProject = await refreshProjectWithCacheBusting(projectId);
        setProject(refreshedProject);
        showNotification('success', 'Berhasil', 'Proyek telah diverifikasi');
        setTimeout(() => router.push('/admin/projects'), 1500);
      } else {
        showNotification('danger', 'Gagal', res.message ?? 'Gagal memverifikasi proyek');
      }
    } catch (err) {
      showNotification('danger', 'Gagal', err instanceof ApiError ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsVerifying(false);
    }
  }, [projectId, router, project]);

  const handleReject = useCallback(async () => {
    if (!project) return;
    if (!rejectionNotes.trim()) return showNotification('warning', 'Perhatian', 'Catatan penolakan wajib diisi');
    if (rejectionNotes.length < 10) return showNotification('warning', 'Perhatian', 'Catatan minimal 10 karakter');
    if (rejectionNotes.length > 500) return showNotification('warning', 'Perhatian', 'Catatan maksimal 500 karakter');
    try {
      setIsRejecting(true);
      const res = await rejectProject(projectId, rejectionNotes);
      if (res.data) {
        const refreshedProject = await refreshProjectWithCacheBusting(projectId);
        setProject(refreshedProject);
        showNotification('success', 'Berhasil', 'Proyek telah ditolak');
        setTimeout(() => router.push('/admin/projects'), 1500);
      } else {
        showNotification('danger', 'Gagal', res.message ?? 'Gagal menolak proyek');
      }
    } catch (err) {
      showNotification('danger', 'Gagal', err instanceof ApiError ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsRejecting(false);
      setRejectionNotes('');
    }
  }, [projectId, rejectionNotes, router, project]);

  /* ── Status badge ── */
  const statusStyle: Record<string, string> = {
    DIAJUKAN: 'bg-blue-100 text-blue-800',
    IN_REVIEW: 'bg-yellow-100 text-yellow-800',
    PERBAIKAN_DATA: 'bg-orange-100 text-orange-800',
    TERVERIFIKASI: 'bg-green-100 text-green-800',
    TERPUBLIKASI: 'bg-purple-100 text-purple-800',
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-40 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/admin/projects" className="flex items-center gap-2 text-[#0f2d5e] hover:underline mb-8">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{error || 'Project not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const showVerificationPanel =
    project.status === 'TERVERIFIKASI' || project.status === 'IN_REVIEW' || project.status === 'DIAJUKAN';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <p className="text-xs text-gray-400 mb-1">
            Projects /{' '}
            <span className="text-[#0f2d5e] font-semibold">
              PRJ-{String(projectId).padStart(4, '0')}
            </span>
          </p>

          {/* Title row */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                statusStyle[project.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {project.status}
            </span>
          </div>

          {/* Back link */}
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1 text-[#0f2d5e] text-sm hover:underline mt-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Lihat semua riwayat proyek
          </Link>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ══ Catatan Perbaikan Banner (hanya muncul jika status PERBAIKAN_DATA) ══ */}
          {project.status === 'PERBAIKAN_DATA' && (() => {
            const lastRejection = [...(project.verifications ?? [])]
              .reverse()
              .find((v) => v.action === 'REJECTED');
            return lastRejection ? (
              <div className="bg-orange-50 border border-orange-300 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800">Catatan Perbaikan Data</p>
                    <p className="text-sm text-orange-700 mt-1 whitespace-pre-wrap">{lastRejection.notes}</p>
                    <p className="text-xs text-orange-500 mt-1">
                      Ditolak oleh: {lastRejection.verifiedByName} &bull;{' '}
                      {new Date(lastRejection.verifiedAt).toLocaleDateString('id-ID', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* ══ ROW 1: Strategic Narrative + Project Information ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Strategic Narrative (2/3) */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <CardHeader title="Strategic Narrative / Value Proposition" />
              <div className="p-6">
                {/* Location image above, then text below */}
                {project.locationImageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={project.locationImageUrl}
                      alt="Location Map"
                      className="w-full h-auto object-contain max-h-72"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div className="hidden h-28 items-center justify-center text-xs text-gray-400 text-center px-2">
                      📍 Peta lokasi tidak tersedia
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.valueProposition?.trim() ?? '-'}
                </p>
              </div>
            </div>

            {/* Project Information (1/3) */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CardHeader title="Project Information" />
                <div className="divide-y divide-gray-100">
                  <div className="px-5 py-3 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Location</p>
                      <p className="text-sm font-medium text-gray-800">{project.location ?? '-'}</p>
                    </div>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Scope of Investment / Partnership</p>
                    <p className="text-sm font-medium text-gray-800">{project.cooperationModel ?? '-'}</p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Project Details</p>
                    <p className="text-sm font-medium text-gray-800">{project.assetReadiness ?? '-'}</p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Length of Concession / Partnership</p>
                    <p className="text-sm font-medium text-gray-800">
                      {project.concessionPeriod != null ? `${project.concessionPeriod} Years` : '-'}
                    </p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Project / Asset Status</p>
                    <p className="text-sm font-medium text-gray-800">
                      {formatFeasibilityStudy(project.isFeasibilityStudy)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Incentives / Government Support (right side small card) */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CardHeader title="Incentives / Government Support" />
                <div className="p-5">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.governmentSupport?.trim() ?? '-'}</p>
                </div>
              </div>

            </div>
          </div>

          {/* ══ ROW 2: Project Structure + Revenue Stream / Additional Info / Timeline + Financials / Contact ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Project Structure */}
              {project.projectStructureImageUrl && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <CardHeader title="Project Structure" />
                  <div className="p-6">
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={project.projectStructureImageUrl}
                        alt="Project Structure"
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                      <div className="hidden h-40 items-center justify-center text-xs text-gray-400 text-center px-2">
                        🏗️ Gambar struktur proyek tidak tersedia
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Stream */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CardHeader title="Revenue Stream" />
                <div className="p-6">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.revenueStream?.trim() ?? '-'}</p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CardHeader title="Additional Information" />
                <div className="p-6">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {project.additionalInfo?.trim() ?? '-'}
                  </p>
                </div>
              </div>

              {/* Timeline — updated to match photo style */}
              {project.timelines && project.timelines.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <CardHeader title="Indicative / High-level Timeline" />
                  <div className="p-6 overflow-x-auto">
                    <div className="flex items-stretch gap-4 min-w-max">
                      {project.timelines.map((tl, idx) => {
                        const isActive = idx < 3; // first 3 are "active" (dark), rest are grayed out like the photo
                        return (
                          <div key={tl.id} className="flex items-stretch">
                            <div
                              className={`w-44 rounded-2xl overflow-hidden flex flex-col border-2 border-[#0f2d5e] ${
                                isActive ? '' : 'opacity-50'
                              }`}
                            >
                              {/* Card header portion */}
                              <div
                                className={`px-4 py-3 text-center ${
                                  isActive ? 'bg-[#0f2d5e]' : 'bg-gray-300'
                                }`}
                              >
                                <p className={`font-bold text-sm leading-tight ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                  {tl.timeRange}
                                </p>
                              </div>
                              {/* Card body portion */}
                              <div
                                className={`flex-1 px-4 py-4 text-center ${
                                  isActive ? 'bg-[#dce8f7]' : 'bg-gray-100'
                                }`}
                              >
                                <p className={`text-xs leading-snug ${isActive ? 'text-[#0f2d5e]' : 'text-gray-500'}`}>
                                  {tl.phaseDescription}
                                </p>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Status History */}
              {((project.statusHistory && project.statusHistory.length > 0) || (project.verifications && project.verifications.length > 0)) && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <CardHeader title="Status History" />
                  <div className="p-6">
                    <div className="relative">
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
                      <div className="space-y-6">
                        {(project.statusHistory ?? []).map((sh) => {
                          const statusLabel: Record<string, { label: string; color: string; dot: string }> = {
                            DRAFT: { label: 'Draft', color: 'text-[#0f2d5e]', dot: 'bg-[#0f2d5e]' },
                            DIAJUKAN: { label: 'Diajukan', color: 'text-[#0f2d5e]', dot: 'bg-[#0f2d5e]' },
                            IN_REVIEW: { label: 'In Review', color: 'text-[#0f2d5e]', dot: 'bg-[#0f2d5e]' },
                            PERBAIKAN_DATA: { label: 'Perbaikan Data', color: 'text-[#0f2d5e]', dot: 'bg-[#0f2d5e]' },
                            TERVERIFIKASI: { label: 'Terverifikasi', color: 'text-[#0f2d5e]', dot: 'bg-[#0f2d5e]' },
                            TERPUBLIKASI: { label: 'Terpublikasi', color: 'text-[#0f2d5e]', dot: 'bg-[#0f2d5e]' },
                          };
                          const s = statusLabel[sh.status] ?? { label: sh.status, color: 'text-[#0f2d5e]', dot: 'bg-[#0f2d5e]' };
                          return (
                            <div key={`sh-${sh.id}`} className="flex gap-4 relative">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${s.dot} flex items-center justify-center z-10`}>
                                <div className="w-3 h-3 rounded-full bg-white" />
                              </div>
                              <div className="flex-1 pt-1">
                                <p className={`text-sm font-semibold ${s.color}`}>{s.label}</p>
                                {sh.notes && <p className="text-xs text-gray-600 mt-0.5">{sh.notes}</p>}
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {sh.changedByName ?? 'System'} &bull;{' '}
                                  {new Date(sh.changedAt).toLocaleDateString('id-ID', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {(project.verifications ?? []).map((v) => {
                          const verifStyle: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
                            VERIFIED:    { label: 'Diverifikasi oleh admin', color: 'text-[#0f2d5e]', bg: 'bg-[#0f2d5e]', icon: <CheckCircle className="w-4 h-4 text-white" /> },
                            REJECTED:    { label: 'Ditolak & Revisi',         color: 'text-[#0f2d5e]', bg: 'bg-[#0f2d5e]', icon: <XCircle className="w-4 h-4 text-white" /> },
                            PUBLISHED:   { label: 'Dipublikasikan',           color: 'text-[#0f2d5e]', bg: 'bg-[#0f2d5e]', icon: <CheckCircle className="w-4 h-4 text-white" /> },
                            UNPUBLISHED: { label: 'Di-unpublish',             color: 'text-[#0f2d5e]', bg: 'bg-[#0f2d5e]', icon: <XCircle className="w-4 h-4 text-white" /> },
                          };
                          const s = verifStyle[v.action] ?? { label: v.action, color: 'text-[#0f2d5e]', bg: 'bg-[#0f2d5e]', icon: <CheckCircle className="w-4 h-4 text-white" /> };
                          return (
                            <div key={`v-${v.id}`} className="flex gap-4 relative">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${s.bg}`}>
                                {s.icon}
                              </div>
                              <div className="flex-1 pt-1">
                                <p className={`text-sm font-semibold ${s.color}`}>{s.label}</p>
                                {v.notes && <p className="text-xs text-gray-600 mt-0.5">{v.notes}</p>}
                                <p className="text-xs text-gray-400 mt-0.5">
                                  By: {v.verifiedByName} &bull;{' '}
                                  {new Date(v.verifiedAt).toLocaleDateString('id-ID', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">

              {/* Financials */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CardHeader title="Financials" />
                <div className="divide-y divide-gray-100">
                  <div className="px-5 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Total Investment / Total Capex</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {project.totalCapex != null ? `USD ${project.totalCapex.toLocaleString('en-US')} Billion` : '-'}
                    </p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Additional Cost / Total Opex</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {project.totalOpex != null ? `USD ${project.totalOpex.toLocaleString('en-US')} Million` : '-'}
                    </p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">NPV</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatNpvDisplay(project.npv)}
                    </p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Return on Investment / Equity IRR</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatIrrDisplay(project.irr)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CardHeader title="Contact Person" />
                <div className="divide-y divide-gray-100">
                  <div className="px-5 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Name</p>
                    <p className="text-sm font-medium text-gray-800">{project.contactPersonName ?? '-'}</p>
                  </div>
                  <div className="px-5 py-3">
                    {project.contactPersonEmail ? (
                      <a
                        href={`mailto:${project.contactPersonEmail}`}
                        className="flex items-center gap-2 text-sm text-[#0f2d5e] hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        {project.contactPersonEmail}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-800">-</p>
                    )}
                  </div>
                  <div className="px-5 py-3">
                    {project.contactPersonPhone ? (
                      <a
                        href={`https://wa.me/${project.contactPersonPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0f2d5e] hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        {project.contactPersonPhone}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-800">-</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Documents */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CardHeader title="Project Documents" />
                <div className="p-5">
                  {project.projectFileDownloadUrl ? (
                    <a
                      href={project.projectFileDownloadUrl ?? ''}
                      download={`project-${projectId}-document`}
                      className="flex items-center gap-2 text-sm text-[#0f2d5e] font-medium hover:underline"
                    >
                      <Download className="w-4 h-4 flex-shrink-0" />
                      Download Project File
                    </a>
                  ) : (
                    <p className="text-sm text-gray-800">-</p>
                  )}
                </div>
              </div>

              {/* Project Owner Information */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <CardHeader title="Project Owner Information" />
                <div className="p-4 space-y-2">
                  <div className="border border-gray-200 rounded-md px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">{project.ownerName ?? '-'}</p>
                    {project.ownerOrganization && (
                      <p className="text-xs text-gray-500">{project.ownerOrganization}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {project.ownerEmail && (
                      <a
                        href={`mailto:${project.ownerEmail}`}
                        className="flex-1 flex items-center gap-2 text-xs text-[#0f2d5e] font-medium hover:underline border border-gray-200 rounded-md px-3 py-2"
                      >
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        Hubungi via Email
                      </a>
                    )}
                    {project.ownerPhone && (
                      <a
                        href={`https://wa.me/${project.ownerPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center gap-2 text-xs text-[#0f2d5e] font-medium hover:underline border border-gray-200 rounded-md px-3 py-2"
                      >
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        Hubungi via Whatsapp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ ROW 3: Verification Panel ══ */}
          {showVerificationPanel && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <CardHeader title="Panel Verifikasi" />
              <div className="p-6">
                <div className="flex gap-6 items-start">
                  {/* Left: label + textarea + hint */}
                  <div className="flex-1 space-y-1.5">
                    <label htmlFor="rejection-notes" className="block text-sm font-semibold text-gray-800">
                      Catatan Verifikasi Admin
                    </label>
                    <textarea
                      id="rejection-notes"
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      placeholder="Provide a detailed description..."
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#0f2d5e] h-32"
                    />
                    <p className="text-xs text-gray-500">
                      *Catatan wajib diisi jika Anda melakukan Reject.
                    </p>
                  </div>

                  {/* Right: 3 buttons stacked */}
                  <div className="flex flex-col gap-2 w-52 flex-shrink-0 pt-6">
                    <button
                      onClick={handleApprove}
                      disabled={isVerifying}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FolderCheck className="w-4 h-4" />
                      {isVerifying ? 'Verifying...' : 'Verify Project'}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isRejecting}
                      className={`text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        rejectionNotes.trim().length >= 10
                          ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
                          : 'bg-red-300 cursor-not-allowed'
                      }`}
                    >
                      <FolderCheck className="w-4 h-4" />
                      {isRejecting ? 'Rejecting...' : 'Reject & Revision'}
                    </button>
                    <button
                      onClick={() => router.push('/admin/projects')}
                      className="border-2 border-[#0f2d5e] text-[#0f2d5e] bg-white text-sm font-normal py-2.5 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Kembali ke semua proyek
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}