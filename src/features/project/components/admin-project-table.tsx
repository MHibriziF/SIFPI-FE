'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Pagination } from '@/shared/components/pagination';
import { Select, TextInput } from '@/shared/components/form-fields';
import { StatCard } from '@/shared/components/stat-card';
import { showToast } from '@/shared/components/toast';
import { getAllProjects } from '@/features/project/services';
import { ApiError } from '@/shared/types/api';
import type { ProjectCardData } from '@/shared/components/project-card';
import { BulkImportProjectTrigger } from './bulk-import-project-trigger';
import {
  ProjectStatus,
  PROJECT_STATUS_LABELS,
  SECTOR_OPTIONS,
} from '@/shared/enums';

// ─── Constants ──────────────────────────────────────────────────────────────

type AdminStatus = ProjectStatus | '';

/** Radix Select.Item disallows value="" — use a sentinel for "all" options */
const ALL = '__all__';

const SECTOR_FILTER_OPTIONS = [
  { value: ALL, label: 'Semua Sektor' },
  ...SECTOR_OPTIONS,
];

/** Admin doesn't see DRAFT projects — exclude from filter */
const ADMIN_STATUS_OPTIONS = [
  { value: ALL, label: 'Semua Status' },
  ...Object.values(ProjectStatus)
    .filter(s => s !== ProjectStatus.DRAFT)
    .map(s => ({ value: s, label: PROJECT_STATUS_LABELS[s] })),
];

const SORT_OPTIONS = [
  { value: 'desc', label: 'Terbaru' },
  { value: 'asc', label: 'Terlama' },
];

const STATUS_COLORS: Record<string, string> = {
  DIAJUKAN: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  PERBAIKAN_DATA: 'bg-red-100 text-red-800',
  TERVERIFIKASI: 'bg-green-100 text-green-800',
  TERPUBLIKASI: 'bg-purple-100 text-purple-800',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminReadProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    sector: '',
    status: '' as AdminStatus,
    sortDirection: 'desc' as 'asc' | 'desc',
  });

  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingApproval: 0,
    growthPercentage: 0,
  });

  // ── Fetch ───────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllProjects({
        page: pagination.page,
        size: pagination.size,
        sortBy: 'createdAt',
        sortDirection: filters.sortDirection,
        status: filters.status || undefined,
        sector: filters.sector || undefined,
        search: filters.search || undefined,
      });

      const data = response.data;
      setProjects(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      }));

      // Calculate stats
      const total = data.totalElements;
      const pending = (data.content || []).filter(
        (p) => p.status === 'DIAJUKAN' || p.status === 'IN_REVIEW'
      ).length;
      
      setStats({
        totalProjects: total,
        pendingApproval: pending,
        growthPercentage: 12, // Mock data - should come from backend
      });
    } catch (error) {
      console.error('Error fetching admin projects:', error);
      const message = error instanceof ApiError ? error.message : 'Terjadi kesalahan';
      showToast('danger', 'Gagal memuat proyek', message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.size, filters.status, filters.sector, filters.search, filters.sortDirection]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleExportPortfolio = () => {
    router.push('/projects/catalogue');
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-350 mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Proyek</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola verifikasi proyek</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatCard
            icon={stats.growthPercentage >= 0 ? TrendingUp : TrendingDown}
            title="Total Proyek"
            value={stats.totalProjects}
            subtitle={`${stats.growthPercentage}% more than last month`}
            variant="info"
          />
          <StatCard
            icon={stats.growthPercentage >= 0 ? TrendingUp : TrendingDown}
            title="Pending Approval"
            value={stats.pendingApproval}
            subtitle={`${stats.growthPercentage}% more than last month`}
            variant="warning"
          />
        </div>

        {/* Export Portfolio Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Portofolio</h2>
          <p className="text-sm text-gray-600 mb-4">
            Export portofolio proyek yang sudah dipilih di halaman katalog.
          </p>
          <div className="flex items-center">
            <Button onClick={handleExportPortfolio} variant="filled" className="px-6">
              Export Project
            </Button>
          </div>
        </div>

        {/* Manajemen Proyek Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manajemen Proyek</h2>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <TextInput
              label="Cari Proyek"
              placeholder="Cari ID Proyek, Nama, atau Owner..."
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
            />
            <Select
              label="Sektor"
              options={SECTOR_FILTER_OPTIONS}
              value={filters.sector || ALL}
              onValueChange={(val) => {
                setFilters((prev) => ({ ...prev, sector: val === ALL ? '' : val }));
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
            />
            <Select
              label="Status"
              options={ADMIN_STATUS_OPTIONS}
              value={filters.status || ALL}
              onValueChange={(val) => {
                setFilters((prev) => ({ ...prev, status: (val === ALL ? '' : val) as AdminStatus }));
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
            />
            <Select
              label="Urutkan"
              options={SORT_OPTIONS}
              value={filters.sortDirection}
              onValueChange={(val) => {
                setFilters((prev) => ({ ...prev, sortDirection: val as 'asc' | 'desc' }));
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
            />
          </div>

          <div className="mb-4">
            <BulkImportProjectTrigger/>
          </div>

          {/* Table */}
          {(() => {
            if (isLoading) {
              return (
                <div className="text-center py-12">
                  <div className="inline-block size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="mt-4 text-sm text-gray-600">Memuat proyek...</p>
                </div>
              );
            }
            if (projects.length === 0) {
              return (
                <div className="text-center py-12">
                  <p className="text-gray-500">Belum ada proyek yang diajukan</p>
                </div>
              );
            }
            return (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Project ID
                      </th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sector
                      </th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr
                        key={project.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="py-4 text-sm text-gray-900 font-medium">
                          PRJ-{String(project.id).padStart(4, '0')}
                        </td>
                        <td className="py-4 text-sm text-gray-900">{project.name}</td>
                        <td className="py-4 text-sm text-gray-600">{project.ownerName || 'N/A'}</td>
                        <td className="py-4 text-sm text-gray-600">
                          {project.sector?.replaceAll('_', ' ') || 'N/A'}
                        </td>
                        <td className="py-4 text-sm text-gray-600">{formatDate(project.createdAt)}</td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {PROJECT_STATUS_LABELS[project.status] || project.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/projects/PRJ-${String(project.id).padStart(4, '0')}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Tampilkan</span>
                  <select
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={pagination.size}
                    onChange={(e) => setPagination((prev) => ({ ...prev, size: Number(e.target.value), page: 0 }))}
                  >
                    {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span>per halaman</span>
                </div>
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  totalElements={pagination.totalElements}
                  pageSize={pagination.size}
                  onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
                />
              </div>
            </>
            );
          })()}

          {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-gray-200">
            <Link href="/admin/projects/publication">
              <Button variant="outlined" className="border-2 border-primary text-primary bg-white hover:bg-blue-50 font-normal">
                Kelola publikasi proyek
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
