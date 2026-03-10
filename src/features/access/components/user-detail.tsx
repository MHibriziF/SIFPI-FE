'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FolderCheck, Pencil } from 'lucide-react';

import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/button';
import SuccessModal from '@/shared/components/success-modal';
import { verifyProjectOwner, updateUserStatus } from '../services';
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
  email,
  role,
  isVerified,
  isActive,
  canUpdate,
  canDelete,
  className = '',
}: {
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  className?: string;
}) {
  const router = useRouter();
  const isProjectOwner = role === 'PROJECT_OWNER';
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });

  function closeModal() {
    setModal((m) => ({ ...m, open: false }));
    router.refresh();
  }

  async function handleVerify() {
    setVerifyLoading(true);
    try {
      await verifyProjectOwner(email);
      setModal({
        open: true,
        title: 'Persetujuan akun berhasil disetujui!',
        message:
          'Persetujuan akun berhasil disetujui! Pengguna akan mendapatkan bahwa pengajuan akun sudah disetujui dan dapat mengakses fitur-fitur yang ditentukan.',
      });
    } catch {
      setModal({
        open: true,
        title: 'Verifikasi Gagal',
        message: 'Gagal memverifikasi akun. Silakan coba lagi.',
      });
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleDeactivate() {
    if (!confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    setDeactivateLoading(true);
    try {
      await updateUserStatus(email, false);
      setModal({
        open: true,
        title: 'Pembekuan akun berhasil!',
        message:
          'Akun berhasil dibekukan. Status akun bersifat tidak aktif dan pengguna tidak dapat login ke akun IPFO',
      });
    } catch {
      setModal({
        open: true,
        title: 'Nonaktifkan Gagal',
        message: 'Gagal menonaktifkan akses. Silakan coba lagi.',
      });
    } finally {
      setDeactivateLoading(false);
      setConfirmDeactivate(false);
    }
  }

  async function handleReactivate() {
    setDeactivateLoading(true);
    try {
      await updateUserStatus(email, true);
      setModal({
        open: true,
        title: 'Akun berhasil diaktifkan!',
        message:
          'Akun pengguna telah diaktifkan kembali. Pengguna dapat login dan mengakses fitur IPFO.',
      });
    } catch {
      setModal({
        open: true,
        title: 'Aktivasi Gagal',
        message: 'Gagal mengaktifkan akses. Silakan coba lagi.',
      });
    } finally {
      setDeactivateLoading(false);
    }
  }

  return (
    <>
      <SuccessModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        actionText="OK"
        actionHref="#"
        onClose={closeModal}
      />

      <Card title="Aksi Manajemen Akun" className={className}>
        <div className="flex flex-col gap-3">
          {/* Verifikasi Akun — hanya untuk Project Owner yang belum terverifikasi dan masih aktif */}
          {canUpdate && isProjectOwner && !isVerified && isActive && (
            <Button
              className="w-full bg-success hover:bg-success/85 text-white font-semibold"
              onClick={handleVerify}
              disabled={verifyLoading}
            >
              <FolderCheck className="size-4 shrink-0" />
              {verifyLoading ? 'Memverifikasi...' : 'Verifikasi Akun'}
            </Button>
          )}

          {/* Edit Informasi */}
          {canUpdate && (
            <Button className="w-full font-semibold" asChild>
              <Link
                href={`/admin/access/users/${encodeURIComponent(email)}/edit`}
                className="flex items-center gap-2"
              >
                <Pencil className="size-4 shrink-0" />
                Edit Informasi
              </Link>
            </Button>
          )}

          {/* Nonaktifkan Akses — tanpa icon */}
          {canDelete && isActive && (
            <Button
              className="w-full bg-danger hover:bg-danger/85 text-white font-semibold"
              onClick={handleDeactivate}
              disabled={deactivateLoading}
            >
              {deactivateLoading
                ? 'Menonaktifkan...'
                : confirmDeactivate
                  ? 'Konfirmasi Nonaktifkan?'
                  : 'Nonaktifkan Akses'}
            </Button>
          )}

          {/* Aktifkan kembali — tanpa icon */}
          {canDelete && !isActive && (
            <Button
              className="w-full bg-success hover:bg-success/85 text-white font-semibold"
              onClick={handleReactivate}
              disabled={deactivateLoading}
            >
              {deactivateLoading ? 'Mengaktifkan...' : 'Aktifkan Akses'}
            </Button>
          )}

          {/* Cancel konfirmasi nonaktifkan */}
          {confirmDeactivate && (
            <Button
              variant="outlined"
              className="w-full"
              onClick={() => setConfirmDeactivate(false)}
            >
              Batal
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface UserDetailViewProps {
  user: AdminUserDetail;
  canUpdate: boolean;
  canDelete: boolean;
}

export function UserDetailView({ user, canUpdate, canDelete }: UserDetailViewProps) {
  const isProjectOwner = user.role === 'PROJECT_OWNER';
  const isInvestor = user.role === 'INVESTOR';

  const isVerified = isProjectOwner
    ? (user.owner_verified ?? false)
    : user.email_verified;

  const isActive = user.is_active ?? true;

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
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-lg text-black">{user.nama}</span>
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <StatusBadge variant={isVerified ? 'approved' : 'in-review'}>
                  {isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                </StatusBadge>
              </div>

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
                        <Button size="xs">Lihat Detail</Button>
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

                {/* AUM Size */}
                {user.aum_size && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primary">AUM Size</span>
                      <span className="text-xs font-medium text-warning bg-warning-light px-2 py-0.5 rounded-full">
                        Confidential
                      </span>
                    </div>
                    <div className="bg-gray-100 border border-gray-400 rounded-lg px-4 py-2 text-sm text-black">
                      {user.aum_size}
                    </div>
                  </div>
                )}

                {/* Sektor Minat */}
                {user.sector_interest && user.sector_interest.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primary">Sektor Minat</span>
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

          {/* Jabatan — EXECUTIVE only */}
          {user.role === 'EXECUTIVE' && user.jabatan && (
            <Card title="Informasi Jabatan" className="flex-1">
              <TextField label="Jabatan" value={user.jabatan} />
            </Card>
          )}

          {/* Aksi Manajemen Akun — row 1 untuk non PROJECT_OWNER & non INVESTOR */}
          {!isProjectOwner && !isInvestor && (
            <AksiCard
              email={user.email}
              role={user.role}
              isVerified={isVerified}
              isActive={isActive}
              canUpdate={canUpdate}
              canDelete={canDelete}
              className="lg:w-64 shrink-0"
            />
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
            <AksiCard
              email={user.email}
              role={user.role}
              isVerified={isVerified}
              isActive={isActive}
              canUpdate={canUpdate}
              canDelete={canDelete}
              className="lg:w-64 shrink-0"
            />
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
            <AksiCard
              email={user.email}
              role={user.role}
              isVerified={isVerified}
              isActive={isActive}
              canUpdate={canUpdate}
              canDelete={canDelete}
              className="lg:w-64 shrink-0"
            />
          </div>
        )}

        {/* ── Row 3 — INVESTOR: Preferensi Investasi ────────────────────── */}
        {isInvestor && (
          <Card title="Preferensi Investasi">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.preferred_investment_instrument && (
                  <TextField label="Instrumen Investasi" value={user.preferred_investment_instrument} />
                )}
                {user.engagement_model && (
                  <TextField label="Model Keterlibatan" value={user.engagement_model} />
                )}
                {user.stage_preference && (
                  <TextField label="Preferensi Tahap" value={user.stage_preference} />
                )}
                {user.risk_appetite && (
                  <TextField label="Tingkat Risiko" value={user.risk_appetite} />
                )}
                {user.esg_standards && (
                  <TextField label="Standar ESG" value={user.esg_standards} />
                )}
                {user.local_presence && (
                  <TextField label="Kehadiran Lokal" value={user.local_presence} />
                )}
              </div>

              {/* Consent flags */}
              {(user.opt_in_email !== undefined || user.agree_privacy !== undefined) && (
                <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-100">
                  {user.opt_in_email !== undefined && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      user.opt_in_email
                        ? 'bg-success-light text-success'
                        : 'bg-draft-light text-draft'
                    }`}>
                      <span className="size-1.5 rounded-full bg-current" />
                      {user.opt_in_email ? 'Opt-in Email' : 'Tidak Opt-in Email'}
                    </span>
                  )}
                  {user.agree_privacy !== undefined && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      user.agree_privacy
                        ? 'bg-success-light text-success'
                        : 'bg-danger-light text-danger'
                    }`}>
                      <span className="size-1.5 rounded-full bg-current" />
                      {user.agree_privacy ? 'Menyetujui Kebijakan Privasi' : 'Belum Menyetujui Kebijakan Privasi'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}