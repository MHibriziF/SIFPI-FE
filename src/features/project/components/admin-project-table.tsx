'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { StatCard } from '@/shared/components/stat-card';
import { showToast } from '@/shared/components/toast';
import { getAllProjects } from '@/features/project/services';
import { ApiError } from '@/shared/types/api';
import type { ProjectCardData } from '@/shared/components/project-card';

// ─── Constants ──────────────────────────────────────────────────────────────

type AdminStatus = 'DIAJUKAN' | 'IN_REVIEW' | 'PERBAIKAN_DATA' | 'TERVERIFIKASI' | 'TERPUBLIKASI' | '';

const SECTOR_OPTIONS = [
  { value: '', label: 'Semua Sektor' },
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
  { value: 'EDUCATION_RESEARCH_AND_DEVELOPMENT', label: 'Education & R&D' },
  { value: 'URBAN_ECONOMICS_INFRASTRUCTURE_FACILITIES', label: 'Urban Economics' },
];

const STATUS_LABELS: Record<string, string> = {
  DIAJUKAN: 'Diajukan',
  IN_REVIEW: 'In Review',
  PERBAIKAN_DATA: 'Perbaikan Data',
  TERVERIFIKASI: 'Terverifikasi',
  TERPUBLIKASI: 'Terpublikasi',
};

const STATUS_COLORS: Record<string, string> = {
  DIAJUKAN: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  PERBAIKAN_DATA: 'bg-red-100 text-red-800',
  TERVERIFIKASI: 'bg-green-100 text-green-800',
  TERPUBLIKASI: 'bg-purple-100 text-purple-800',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminReadProjects() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    sector: '',
    status: '' as AdminStatus,
  });

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingApproval: 0,
    growthPercentage: 0,
  });

  const [exportParams, setExportParams] = useState({
    quarter: 'Q1',
    year: new Date().getFullYear().toString(),
  });

  // ── Fetch ───────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllProjects({
        page: pagination.page,
        size: pagination.size,
        sortBy: 'createdAt',
        sortDirection: 'desc',
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
      console.error('❌ Error fetching admin projects:', error);
      const apiError = error as ApiError;
      showToast(
        'danger',
        'Gagal memuat proyek',
        apiError.message || 'Terjadi kesalahan'
      );
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.size, filters.status, filters.sector, filters.search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchProjects();
  };

  const handleExportPortfolio = () => {
    showToast('info', 'Export Portfolio', `Exporting ${exportParams.quarter} ${exportParams.year}...`);
    // TODO: Implement actual export logic
  };

  const handleBulkInsertCSV = () => {
    showToast('info', 'Bulk Insert CSV', 'Feature coming soon...');
    // TODO: Implement CSV upload
  };

  const handleArchiveProjects = () => {
    showToast('info', 'Archive Projects', 'Feature coming soon...');
    // TODO: Implement archive
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
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
            Pilih kuarter yang ingin diekspor. Proyek yang dipublish pada kuarter ini akan dikompilasi dalam format pdf.
          </p>
          <div className="flex items-center gap-3">
            <select
              value={exportParams.quarter}
              onChange={(e) => setExportParams((prev) => ({ ...prev, quarter: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
            <select
              value={exportParams.year}
              onChange={(e) => setExportParams((prev) => ({ ...prev, year: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Button onClick={handleExportPortfolio} variant="filled" className="px-6">
              Export Project
            </Button>
          </div>
        </div>

        {/* Manajemen Proyek Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manajemen Proyek</h2>

          {/* Search & Filters */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari ID Proyek, Nama, atau Owner..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <select
              value={filters.sector}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, sector: e.target.value }));
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SECTOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, status: e.target.value as AdminStatus }));
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Semua Status</option>
              <option value="DIAJUKAN">Diajukan</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="PERBAIKAN_DATA">Perbaikan Data</option>
              <option value="TERVERIFIKASI">Terverifikasi</option>
              <option value="TERPUBLIKASI">Terpublikasi</option>
            </select>

            <Button onClick={handleBulkInsertCSV} variant="outlined" className="border-primary text-primary">
              Bulk Insert (CSV)
            </Button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-sm text-gray-600">Memuat proyek...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada proyek yang diajukan</p>
            </div>
          ) : (
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
                        Funding
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
                          {project.sector?.replace(/_/g, ' ') || 'N/A'}
                        </td>
                        <td className="py-4 text-sm text-gray-600">{formatDate(project.createdAt)}</td>
                        <td className="py-4 text-sm text-gray-900 font-medium">
                          {project.budget || 'N/A'}
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {STATUS_LABELS[project.status] || project.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="size-4" />
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
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {pagination.page * pagination.size + 1}-
                  {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
                  {pagination.totalElements} projects
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }))
                    }
                    disabled={pagination.page === 0}
                    className="border-primary text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page + 1} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.totalPages - 1, prev.page + 1),
                      }))
                    }
                    disabled={pagination.page >= pagination.totalPages - 1}
                    className="border-primary text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
            <Button onClick={handleArchiveProjects} variant="outlined" className="text-red-600 border-red-300">
              Archive projects
            </Button>
            <Button variant="outlined" className="border-primary text-primary">
              Kelola publikasi proyek
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
