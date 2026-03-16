'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Download, Share2, MapPin, Building, Clock, Mail, Phone, Info, Layers, CalendarDays, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { SectionCard } from '@/features/project/components/section-card';
import { Button } from '@/shared/components/button';
import { showToast } from '@/shared/components/toast';
import { getCatalogueProjectById, recordProjectView } from '@/features/project/services';
import { ApiError } from '@/shared/types/api';
import type { CatalogueProjectDetailDTO } from '@/features/project/types';

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
  return `${value.toFixed(2)}%`;
}

function formatConcession(years: number | null | undefined): string {
  if (years == null) return '—';
  return `${years} Tahun`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A bordered row with a pin-like icon for Project Information entries */
function InfoRow({ icon: Icon, label, value }: Readonly<{ icon: React.ElementType; label: string; value: React.ReactNode }>) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-200 px-8 py-3.5 last:border-b-0">
      <Icon className="mt-0.5 size-5 flex-shrink-0 text-primary" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        <span className="text-sm text-gray-700">{value || '—'}</span>
      </div>
    </div>
  );
}

/** A bordered row for the Financials card */
function FinancialRow({
  label,
  value,
  sub,
  isLast = false,
}: Readonly<{
  label: string;
  value: string;
  sub?: string;
  isLast?: boolean;
}>) {
  return (
    <div className={`flex flex-col gap-0.5 px-8 py-3.5 ${isLast ? '' : 'border-b border-gray-200'}`}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-base font-bold text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}

/** Timeline item card */
function TimelineChip({ timeRange, phaseDescription }: Readonly<{ timeRange: string; phaseDescription: string }>) {
  return (
    <div className="min-w-[190px] overflow-hidden rounded-xl border-2 border-primary bg-primary-light flex-shrink-0">
      <div className="flex items-center justify-center bg-primary px-4 py-2.5">
        <span className="whitespace-nowrap text-sm font-bold text-white">{timeRange}</span>
      </div>
      <div className="p-4">
        <p className="text-center text-sm text-gray-800">{phaseDescription}</p>
      </div>
    </div>
  );
}

// ─── Portal tooltip button ───────────────────────────────────────────────────
// Renders the tooltip via a portal so it is never clipped by overflow-hidden.

interface TooltipButtonProps {
  tooltip: string;
  children: React.ReactNode;
  className?: string;
}

function TooltipButton({ tooltip, children, className }: Readonly<TooltipButtonProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  function handleEnter() {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setPos(null)}
      onFocus={handleEnter}
      onBlur={() => setPos(null)}
    >
      {children}
      {pos &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y - 10,
              transform: 'translate(-50%, -100%)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="rounded bg-gray-800 px-3 py-1.5 text-xs whitespace-nowrap text-white shadow-lg"
          >
            {tooltip}
            {/* small arrow */}
            <span
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                border: '5px solid transparent',
                borderTopColor: '#1f2937',
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-8">
      <div className="h-8 w-2/3 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_480px]">
        <div className="space-y-4">
          <div className="h-64 rounded-xl bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-200" />
        </div>
        <div className="space-y-4">
          <div className="h-64 rounded-xl bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PublicProjectDetailViewProps {
  projectId: number;
  isLoggedIn: boolean;
}

export default function PublicProjectDetailView({ projectId, isLoggedIn }: Readonly<PublicProjectDetailViewProps>) {
  const [project, setProject] = useState<CatalogueProjectDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getCatalogueProjectById(projectId);
        if (!cancelled) setProject(res.data);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.isNotFound ? 'Proyek tidak ditemukan.' : err.message);
          } else {
            setError('Gagal memuat data proyek.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Record view silently (fire-and-forget). Only when logged in — public visitors don't POST.
    recordProjectView(projectId).catch(() => {});

    load();
    return () => { cancelled = true; };
  }, [projectId]);

  // ── Share handler ──────────────────────────────────────────────────────────
  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: project?.name ?? 'Project Detail', url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showToast('success', 'Link disalin ke clipboard', 'URL halaman ini telah disalin.');
      });
    }
  }

  // ─── Render states ─────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />;

  if (error || !project) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-8 py-16 text-center">
        <Info className="size-12 text-gray-300" />
        <p className="text-lg font-semibold text-gray-600">{error ?? 'Proyek tidak ditemukan.'}</p>
        <Link href="/projects">
          <Button variant="outlined">Kembali ke Katalog</Button>
        </Link>
      </div>
    );
  }

  const locationImageSrc = `/api/catalogue/${projectId}/location-image`;
  const structureImageSrc = `/api/catalogue/${projectId}/structure-image`;
  const fileDownloadHref = `/api/catalogue/${projectId}/file`;

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero / Page Header ─────────────────────────────────────────────── */}
      <div className="w-full border-b border-gray-900 bg-grey px-6 py-8 lg:px-24">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Back + Title */}
          <div className="flex flex-col gap-2">
            <Link
              href="/projects"
              className="flex w-fit items-center gap-2 text-gray-500 transition-colors hover:text-primary"
            >
              <ChevronLeft className="size-4" />
              <span className="text-sm">Projects</span>
            </Link>
            <h1 className="text-2xl font-bold leading-tight text-primary lg:text-3xl">
              {project.name}
            </h1>
            <p className="text-sm text-gray-600">{project.ownerInstitution}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-shrink-0 items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="size-4" />
              Share
            </Button>
            <a href={fileDownloadHref} download>
              <Button variant="outlined" size="sm">
                <Download className="size-4" />
                Download
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* ── Two-Column Main Content ────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-24">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_480px]">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Strategic Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <SectionCard>
                <SectionCard.Header title="Strategic Narrative / Value Proposition" />
                <SectionCard.Body>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    {/* Location image */}
                    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100 sm:h-52 sm:w-52 sm:flex-shrink-0">
                      <Image
                        alt="Location map"
                        src={locationImageSrc}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 208px"
                      />
                    </div>
                    {/* Text */}
                    <div className="flex flex-col gap-3 text-sm leading-relaxed text-gray-700">
                      <p>{project.description}</p>
                      {project.valueProposition && (
                        <p className="text-gray-600">{project.valueProposition}</p>
                      )}
                    </div>
                  </div>
                </SectionCard.Body>
              </SectionCard>
            </motion.div>

            {/* Project Structure */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <SectionCard>
                <SectionCard.Header title="Project Structure" />
                <SectionCard.Body>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      alt="Project structure diagram"
                      src={structureImageSrc}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                </SectionCard.Body>
              </SectionCard>
            </motion.div>

            {/* Additional Information (only if present) */}
            {project.additionalInfo && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <SectionCard>
                  <SectionCard.Header title="Additional Information" />
                  <SectionCard.Body>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                      {project.additionalInfo}
                    </p>
                  </SectionCard.Body>
                </SectionCard>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Project Information */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <SectionCard>
                <SectionCard.Header title="Project Information" />
                <SectionCard.Body className="p-0">
                  <InfoRow icon={Layers} label="Sector" value={project.sector} />
                  <InfoRow icon={MapPin} label="Location" value={project.location} />
                  <InfoRow icon={Building} label="Scope of Investment / Partnership" value={project.cooperationModel} />
                  <InfoRow icon={Clock} label="Length of Concession / Partnership" value={formatConcession(project.concessionPeriod)} />
                  <InfoRow icon={Info} label="Asset Readiness" value={project.assetReadiness} />
                  <InfoRow icon={Building} label="Institution" value={project.ownerInstitution} />
                  <InfoRow icon={Info} label="Feasibility Study" value={project.isFeasibilityStudy ? 'Tersedia' : 'Belum tersedia'} />
                </SectionCard.Body>
              </SectionCard>
            </motion.div>

            {/* Incentives / Government Support */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <SectionCard>
                <SectionCard.Header title="Incentives / Government Support" />
                <SectionCard.Body>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {project.governmentSupport || '—'}
                  </p>
                </SectionCard.Body>
              </SectionCard>
            </motion.div>

            {/* Financials */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionCard>
                <SectionCard.Header title="Financials" />
                <SectionCard.Body className="p-0">
                  <FinancialRow
                    label="Total Investment / Total Capex"
                    value={formatIDR(project.totalCapex)}
                  />
                  <FinancialRow
                    label="Additional Cost / Total Opex"
                    value={formatIDR(project.totalOpex)}
                  />
                  <FinancialRow label="NPV" value={formatIDR(project.npv)} />
                  <FinancialRow
                    label="Return on Investment / Equity IRR"
                    value={formatPercent(project.irr)}
                  />
                  <FinancialRow
                    label="Revenue Stream"
                    value={project.revenueStream || '—'}
                    isLast
                  />
                </SectionCard.Body>
              </SectionCard>
            </motion.div>

            {/* Project Owner / Contact */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <SectionCard>
                <SectionCard.Header title="Project Owner Information" />
                <SectionCard.Body>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Contact Details */}
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900">{project.contactPersonName}</span>
                      <span className="text-sm text-gray-600">{project.ownerInstitution}</span>
                      {isLoggedIn ? (
                        <>
                          <span className="text-sm text-gray-600">{project.contactPersonEmail}</span>
                          <span className="text-sm text-gray-600">{project.contactPersonPhone}</span>
                        </>
                      ) : (
                        <span className="mt-1 text-xs italic text-gray-400">Kontak tersembunyi — login untuk melihat</span>
                      )}
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex flex-col gap-2">
                      {isLoggedIn ? (
                        <>
                          <a
                            href={`https://wa.me/${project.contactPersonPhone?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outlined" size="sm" className="w-full">
                              <Phone className="size-4" />
                              Hubungi via WhatsApp
                            </Button>
                          </a>
                          <a href={`mailto:${project.contactPersonEmail}`}>
                            <Button variant="outlined" size="sm" className="w-full">
                              <Mail className="size-4" />
                              Hubungi via Email
                            </Button>
                          </a>
                        </>
                      ) : (
                        <>
                          <TooltipButton tooltip="Login sebagai Investor untuk menghubungi" className="w-full">
                            <Button variant="outlined" size="sm" disabled className="w-full">
                              <Phone className="size-4" />
                              Hubungi via WhatsApp
                            </Button>
                          </TooltipButton>
                          <TooltipButton tooltip="Login sebagai Investor untuk menghubungi" className="w-full">
                            <Button variant="outlined" size="sm" disabled className="w-full">
                              <Mail className="size-4" />
                              Hubungi via Email
                            </Button>
                          </TooltipButton>
                        </>
                      )}
                    </div>
                  </div>
                </SectionCard.Body>
              </SectionCard>
            </motion.div>
          </div>
        </div>

        {/* ── Timeline Section ────────────────────────────────────────────── */}
        {project.timelines && project.timelines.length > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SectionCard>
              <SectionCard.Header title="Indicative / High-level Timeline" />
              <SectionCard.Body>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {project.timelines.map((tl) => (
                    <TimelineChip
                      key={tl.id}
                      timeRange={tl.timeRange}
                      phaseDescription={tl.phaseDescription}
                    />
                  ))}
                </div>
              </SectionCard.Body>
            </SectionCard>
          </motion.div>
        )}

        {/* ── Metadata ──────────────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-gray-200 pt-5 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            Dibuat: {formatDate(project.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="size-3.5" />
            Diperbarui: {formatDate(project.editedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
