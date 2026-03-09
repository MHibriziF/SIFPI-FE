'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eye, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/button';
import { Select, TextInput } from '@/shared/components/form-fields';
import StatusBadge from '@/shared/components/status-badge';
import { showToast } from '@/shared/components/toast';
import {
  parseProjectStatus,
  parseSector,
  PROJECT_STATUS_OPTIONS,
  ProjectStatus,
  projectStatusLabel,
  sectorLabel,
  SECTOR_OPTIONS,
} from '@/shared/enums';
import { ApiError } from '@/shared/types/api';
import { exportProjectCatalogue, getProjects } from '@/features/project/services';
import type {
  CatalogueQuarter,
  ProjectListItemDTO,
  ProjectListItemLegacyDTO,
} from '@/features/project/types';

const QUARTER_OPTIONS: { value: CatalogueQuarter; label: CatalogueQuarter }[] = [
  { value: 'Q1', label: 'Q1' },
  { value: 'Q2', label: 'Q2' },
  { value: 'Q3', label: 'Q3' },
  { value: 'Q4', label: 'Q4' },
];

type BadgeVariant = 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected';

function mapStatusToBadge(status: unknown): BadgeVariant {
  const parsed = parseProjectStatus(status);
  if (parsed === ProjectStatus.DIAJUKAN) return 'submitted';
  if (parsed === ProjectStatus.IN_REVIEW || parsed === ProjectStatus.PERBAIKAN_DATA) return 'in-review';
  if (parsed === ProjectStatus.TERVERIFIKASI || parsed === ProjectStatus.TERPUBLIKASI)
    return 'approved';
  return 'draft';
}

function formatCurrency(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toISOString().split('T')[0];
}

function projectCode(project: ProjectListItemDTO): string {
  const maybeLegacy = project as ProjectListItemLegacyDTO;
  if (maybeLegacy.projectCode) return maybeLegacy.projectCode;
  return `PRJ-${project.id}`;
}

function ownerLabel(project: ProjectListItemDTO): string {
  const maybeLegacy = project as ProjectListItemLegacyDTO;
  return project.ownerOrganization || project.ownerName || maybeLegacy.ownerInstitution || '-';
}

function extractProjects(payload: unknown): ProjectListItemDTO[] {
  if (Array.isArray(payload)) return payload as ProjectListItemDTO[];
  if (!payload || typeof payload !== 'object') return [];

  const nested = payload as {
    content?: unknown;
    items?: unknown;
  };

  if (Array.isArray(nested.content)) return nested.content as ProjectListItemDTO[];
  if (Array.isArray(nested.items)) return nested.items as ProjectListItemDTO[];
  return [];
}

function downloadPdf(blob: Blob, filename = 'project-catalogue.pdf') {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectListItemDTO[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [quarter, setQuarter] = useState<CatalogueQuarter>('Q1');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      setLoadingProjects(true);
      try {
        const response = await getProjects();
        const list = extractProjects(response.data);
        if (mounted) {
          setProjects(list);
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Gagal mengambil data proyek.';
        showToast('danger', 'Gagal memuat proyek', message);
      } finally {
        if (mounted) {
          setLoadingProjects(false);
        }
      }
    }

    void loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const sectorOptions = useMemo(() => {
    return [{ value: 'ALL', label: 'Semua Sektor' }, ...SECTOR_OPTIONS];
  }, []);

  const statusOptions = useMemo(() => {
    return [{ value: 'ALL', label: 'Semua Status' }, ...PROJECT_STATUS_OPTIONS];
  }, []);

  const filteredProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return projects.filter(project => {
      const matchName = keyword.length === 0 || project.name.toLowerCase().includes(keyword);
      const parsedSector = parseSector(project.sector);
      const matchSector = sector === 'ALL' || parsedSector === sector;
      const parsedStatus = parseProjectStatus(project.status);
      const matchStatus = status === 'ALL' || parsedStatus === status;
      return matchName && matchSector && matchStatus;
    });
  }, [projects, search, sector, status]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedVisibleCount = filteredProjects.filter(project => selectedSet.has(project.id)).length;
  const allVisibleSelected =
    filteredProjects.length > 0 && selectedVisibleCount === filteredProjects.length;

  function toggleProject(id: number) {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]));
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredProjects.map(project => project.id));
      setSelectedIds(prev => prev.filter(id => !visibleIds.has(id)));
      return;
    }

    const merged = new Set(selectedIds);
    filteredProjects.forEach(project => merged.add(project.id));
    setSelectedIds(Array.from(merged));
  }

  async function handleExport() {
    if (selectedIds.length === 0) {
      showToast('warning', 'Pilih proyek', 'Pilih minimal satu proyek untuk diekspor.');
      return;
    }
    if (!/^\d{4}$/.test(year.trim())) {
      showToast('warning', 'Tahun tidak valid', 'Masukkan tahun dalam format 4 digit, contoh: 2026.');
      return;
    }

    setExporting(true);
    try {
      const file = await exportProjectCatalogue({
        projectIds: selectedIds,
        quarter,
        year: Number(year),
      });

      downloadPdf(file.blob, file.filename);
      showToast('success', 'Download berhasil', 'Dokumen catalogue proyek sudah terunduh.');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat export katalog.';
      showToast('danger', 'Export gagal', message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="bg-white">
      <section className="bg-grey px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-[44px] font-medium leading-tight text-primary">Manajemen Proyek</h1>
          <p className="mt-2 text-xl text-gray-700">Kelola verifikasi proyek</p>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6 rounded-xl bg-white">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 text-xl text-primary hover:underline"
          >
            <ArrowLeft className="size-5" />
            Lihat semua proyek
          </Link>

          <div className="space-y-4">
            <h2 className="text-[40px] font-semibold leading-tight text-primary">
              Export Selected Projects
            </h2>

            <div className="grid grid-cols-1 gap-4 md:max-w-sm md:grid-cols-2">
              <Select
                id="quarter"
                label="Kuartal"
                required
                value={quarter}
                onValueChange={value => setQuarter(value as CatalogueQuarter)}
                options={QUARTER_OPTIONS}
              />
              <TextInput
                id="year"
                label="Tahun (YYYY)"
                required
                value={year}
                onChange={event => setYear(event.target.value)}
                placeholder="Contoh: 2026"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.8fr_0.8fr_0.8fr]">
              <TextInput
                id="search-project"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Cari nama proyek..."
              />
              <Select value={sector} onValueChange={setSector} options={sectorOptions} />
              <Select value={status} onValueChange={setStatus} options={statusOptions} />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr className="text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAllVisible}
                        className="size-4 accent-primary"
                        aria-label="Pilih semua proyek yang terlihat"
                      />
                    </th>
                    <th className="px-3 py-3">Project ID</th>
                    <th className="px-3 py-3">Project Name</th>
                    <th className="px-3 py-3">Owner</th>
                    <th className="px-3 py-3">Sector</th>
                    <th className="px-3 py-3">Submitted</th>
                    <th className="px-3 py-3">Funding</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
                  {loadingProjects ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                        Memuat proyek...
                      </td>
                    </tr>
                  ) : filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                        Tidak ada proyek ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map(project => (
                      <tr key={project.id}>
                        <td className="px-3 py-3 align-top">
                          <input
                            type="checkbox"
                            checked={selectedSet.has(project.id)}
                            onChange={() => toggleProject(project.id)}
                            className="mt-1 size-4 accent-primary"
                            aria-label={`Pilih proyek ${project.name}`}
                          />
                        </td>
                        <td className="px-3 py-3 align-top text-gray-500">{projectCode(project)}</td>
                        <td className="px-3 py-3 align-top font-medium text-gray-800">{project.name}</td>
                        <td className="px-3 py-3 align-top">{ownerLabel(project)}</td>
                        <td className="px-3 py-3 align-top">{sectorLabel(project.sector)}</td>
                        <td className="px-3 py-3 align-top">
                          {formatDate(project.updatedAt ?? project.createdAt)}
                        </td>
                        <td className="px-3 py-3 align-top text-primary">
                          {formatCurrency(project.totalCapex)}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <StatusBadge variant={mapStatusToBadge(project.status)}>
                            {projectStatusLabel(project.status)}
                          </StatusBadge>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex items-center justify-center gap-1 text-gray-500">
                            <button type="button" className="rounded p-1.5 hover:bg-gray-100" aria-label="Lihat detail">
                              <Eye className="size-4" />
                            </button>
                            <button type="button" className="rounded p-1.5 hover:bg-gray-100" aria-label="Edit proyek">
                              <Pencil className="size-4" />
                            </button>
                            <button type="button" className="rounded p-1.5 hover:bg-gray-100" aria-label="Hapus proyek">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">{selectedIds.length} proyek terpilih</p>
            <Button onClick={() => void handleExport()} disabled={exporting || selectedIds.length === 0}>
              {exporting ? 'Memproses export...' : 'Export Selected Projects'}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
