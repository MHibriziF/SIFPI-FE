'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, Pencil, ShieldOff } from 'lucide-react';

import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/button';
import type { AdminUserDetail } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRole(role: string) {
  const map: Record<string, string> = {
    PROJECT_OWNER: 'Project Owner',
    INVESTOR: 'Investor',
    EXECUTIVE: 'Executive',
    ADMIN: 'Admin',
  };
  return map[role] ?? role.replaceAll('_', ' ');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-gray-200 rounded-2xl overflow-hidden bg-white ${className}`}>
      <div className="bg-primary px-4 py-3 flex justify-center">
        <span className="text-white font-bold text-lg">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="border border-gray-400 rounded-xl px-3 py-2 text-sm font-semibold text-black whitespace-nowrap">
        {value}
      </div>
    </div>
  );
}

function TextField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <span className="text-sm text-primary">{label}</span>
      <div className="bg-gray-100 border border-gray-400 rounded-lg px-4 py-2 text-sm text-black truncate">
        {value}
      </div>
    </div>
  );
}

function AksiCard({
  isVerified,
  canUpdate,
  canDelete,
  className = '',
}: {
  isVerified: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  className?: string;
}) {
  return (
    <Card title="Aksi Manajemen Akun" className={className}>
      <div className="flex flex-col gap-3">
        {canUpdate && !isVerified && (
          <Button className="w-full bg-success hover:bg-success/85 text-white">
            <CheckCircle className="size-4" />
            Verifikasi Akun
          </Button>
        )}
        {canUpdate && (
          <Button className="w-full">
            <Pencil className="size-4" />
            Edit Informasi
          </Button>
        )}
        {canDelete && (
          <Button className="w-full bg-danger hover:bg-danger/85 text-white">
            <ShieldOff className="size-4" />
            Nonaktifkan Akses
          </Button>
        )}
      </div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface UserDetailViewProps {
  user: AdminUserDetail;
  canUpdate: boolean;
  canDelete: boolean;
}

export function UserDetailView({ user, canUpdate, canDelete }: UserDetailViewProps) {
  const isVerified = user.email_verified;
  const isProjectOwner = user.role === 'PROJECT_OWNER';
  const isInvestor = user.role === 'INVESTOR';

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Breadcrumb + title + back */}
      <div className="px-6 pt-5 flex flex-col gap-2">
        <p className="text-base text-gray-400">
          User Management /{' '}
          <span className="font-semibold text-primary">{user.email}</span>
        </p>
        <h2 className="text-3xl font-bold text-primary leading-tight">
          Manajemen Profil Pengguna
        </h2>
        <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 text-primary">
          <Link href="/admin/access">
            <ChevronLeft className="size-4" />
            Lihat semua pengguna terdaftar
          </Link>
        </Button>
      </div>

      {/* Cards content */}
      <div className="px-6 flex flex-col gap-5">

        {/* ── Row 1 ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Informasi Pengguna */}
          <Card title="Informasi Pengguna" className="lg:w-[55%]">
            <div className="flex flex-col gap-4">
              {/* Name + verification badge */}
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-lg text-black">{user.nama}</span>
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <StatusBadge variant={isVerified ? 'approved' : 'in-review'}>
                  {isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                </StatusBadge>
              </div>

              {/* Info chips */}
              <div className="flex flex-wrap gap-3">
                <InfoChip label="Role" value={formatRole(user.role)} />
                {user.phone && <InfoChip label="Phone" value={user.phone} />}
                <InfoChip label="Joined Date" value={formatDate(user.created_at)} />
                {user.last_login && (
                  <InfoChip label="Last Login" value={formatDateTime(user.last_login)} />
                )}
              </div>
            </div>
          </Card>

          {/* Statistik Pengguna — PROJECT_OWNER only */}
          {isProjectOwner && (
            <Card title="Statistik Pengguna" className="flex-1">
              <table className="w-full">
                <tbody>
                  {[
                    { label: 'Proyek diunggah', count: user.jumlah_proyek ?? 0 },
                    { label: 'Inquiry masuk', count: user.inquiry_masuk ?? 0 },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-3 text-sm text-gray-800">{row.label}</td>
                      <td className="py-3 px-3 text-sm text-gray-600 font-semibold">{row.count}</td>
                      <td className="py-3 px-3">
                        <Button size="xs">
                          Lihat Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Statistik Pengguna — INVESTOR only */}
          {isInvestor && (
            <Card title="Statistik Pengguna" className="flex-1">
              <div className="flex flex-col gap-4">
                {/* Budget Range */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-primary">Budget Range</span>
                    <span className="text-xs font-medium text-warning bg-warning-light px-2 py-0.5 rounded-full">
                      Confidential
                    </span>
                  </div>
                  <div className="bg-gray-100 border border-gray-400 rounded-lg px-4 py-2 text-sm text-black">
                    {user.budget_range ?? '-'}
                  </div>
                </div>

                {/* Preferensi Investasi */}
                {user.sector_interest && user.sector_interest.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primary">Preferensi Investasi</span>
                      <span className="text-xs font-medium text-warning bg-warning-light px-2 py-0.5 rounded-full">
                        Confidential
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.sector_interest.map((s) => (
                        <span
                          key={s}
                          className="bg-primary-light text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Jabatan — EXECUTIVE only (shown in row 1 alongside Informasi Pengguna) */}
          {user.role === 'EXECUTIVE' && user.jabatan && (
            <Card title="Informasi Jabatan" className="flex-1">
              <TextField label="Jabatan" value={user.jabatan} />
            </Card>
          )}

          {/* Aksi Manajemen Akun — in row 1 only for roles without a row 2 */}
          {!isProjectOwner && !isInvestor && (
            <AksiCard isVerified={isVerified} canUpdate={canUpdate} canDelete={canDelete} className="lg:w-64 shrink-0" />
          )}
        </div>

        {/* ── Row 2 — PROJECT_OWNER ──────────────────────────────────────── */}
        {isProjectOwner && (
          <div className="flex flex-col lg:flex-row gap-5">
            <Card title="Informasi Organisasi" className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="flex gap-5">
                  <TextField label="Nama organisasi" value={user.organisasi ?? '-'} />
                  <TextField label="Posisi pada organisasi" value={user.jabatan ?? '-'} />
                </div>
              </div>
            </Card>
            <AksiCard isVerified={isVerified} canUpdate={canUpdate} canDelete={canDelete} className="lg:w-64 shrink-0" />
          </div>
        )}

        {/* ── Row 2 — INVESTOR ──────────────────────────────────────────── */}
        {isInvestor && (
          <div className="flex flex-col lg:flex-row gap-5">
            <Card title="Informasi Organisasi" className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="flex gap-5">
                  <TextField label="Nama Perusahaan" value={user.company_info?.name ?? '-'} />
                  <TextField label="Sektor" value={user.company_info?.sector ?? '-'} />
                </div>
                {user.company_info?.industry_type && (
                  <TextField label="Tipe Industri" value={user.company_info.industry_type} />
                )}
              </div>
            </Card>
            <AksiCard isVerified={isVerified} canUpdate={canUpdate} canDelete={canDelete} className="lg:w-64 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
