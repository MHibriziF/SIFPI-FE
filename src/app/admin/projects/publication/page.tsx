'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { showNotification } from '@/shared/components/info-toast';
import { getAllProjects, publishProjects, unpublishProjects } from '@/features/project/services';
import { ApiError } from '@/shared/types/api';
import type { ProjectCardData } from '@/shared/components/project-card';

// ─── Constants ──────────────────────────────────────────────────────────────

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

export default function PublicationManagementPage() {
  const router = useRouter();
  const [allProjects, setAllProjects] = useState<ProjectCardData[]>([]);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    sector: '',
  });

  const [activeTab, setActiveTab] = useState<'unpublished' | 'published'>('unpublished');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // ── Apply Filters ───────────────────────────────────────────────────────

  const applyFilters = (
    projectsList: ProjectCardData[],
    tab: 'unpublished' | 'published',
    filterParams: typeof filters
  ) => {
    let filtered = projectsList;

    if (tab === 'published') {
      filtered = filtered.filter((p) => p.status === 'TERPUBLIKASI');
    } else {
      filtered = filtered.filter((p) => p.status === 'TERVERIFIKASI');
    }

    if (filterParams.search.trim()) {
      const query = filterParams.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.id?.toString().includes(query) ||
          p.name.toLowerCase().includes(query) ||
          p.ownerName?.toLowerCase().includes(query)
      );
    }

    if (filterParams.sector) {
      filtered = filtered.filter((p) => p.sector === filterParams.sector);
    }

    setProjects(filtered);
    setPagination((prev) => ({
      ...prev,
      page: 0,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.size),
    }));
  };

  // ── Fetch ───────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllProjects({
        page: 0,
        size: 1000,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      });

      const data = response.data;
      const allProjectsList = data.content || [];
      setAllProjects(allProjectsList);
      applyFilters(allProjectsList, activeTab, filters);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      const apiError = error as ApiError;
      showNotification('danger', 'Gagal memuat proyek', apiError.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Re-apply filters when search/sector/tab changes ─────────────────────

  useEffect(() => {
    applyFilters(allProjects, activeTab, filters);
    setSelectedProjects(new Set());
  }, [filters, activeTab]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleTabChange = (tab: 'unpublished' | 'published') => {
    setActiveTab(tab);
    setSelectedProjects(new Set());
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleCheckboxChange = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const getPaginatedProjects = () => {
    const start = pagination.page * pagination.size;
    const end = start + pagination.size;
    return projects.slice(start, end);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageProjects = getPaginatedProjects();
      setSelectedProjects(new Set(currentPageProjects.map((p) => p.id.toString())));
    } else {
      setSelectedProjects(new Set());
    }
  };

  const handleBulkAction = useCallback(
    async (action: 'publish' | 'unpublish') => {
      if (selectedProjects.size === 0) {
        showNotification('danger', 'Tidak ada proyek yang dipilih', 'Pilih minimal satu proyek');
        return;
      }

      setIsProcessing(true);
      try {
        const projectIds = Array.from(selectedProjects).map((id) => parseInt(id, 10));

        if (action === 'publish') {
          await publishProjects(projectIds);
        } else {
          await unpublishProjects(projectIds);
        }

        const response = await getAllProjects({
          page: 0,
          size: 1000,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        });

        const data = response.data;
        const allProjectsList = data.content || [];
        setAllProjects(allProjectsList);
        applyFilters(allProjectsList, activeTab, filters);
        setSelectedProjects(new Set());

        const count = selectedProjects.size;
        if (action === 'publish') {
          showNotification(
            'success',
            'Proyek berhasil dipublikasikan',
            `${count} Proyek berhasil dipublikasikan. Proyek dapat dilihat pada katalog dan dapat diekspor menjadi portofolio.`
          );
        } else {
          showNotification(
            'warning',
            'Proyek berhasil di-take down',
            `${count} Proyek berhasil di-take down. Proyek berstatus inactive, tidak dapat dilihat pada katalog dan tidak dapat diekspor menjadi portofolio.`
          );
        }
      } catch (error) {
        console.error(`Failed to ${action} projects:`, error);
        const apiError = error as ApiError;
        showNotification(
          'danger',
          action === 'publish' ? 'Gagal mempublikasikan proyek' : 'Gagal melepas publikasi proyek',
          apiError.message || 'Terjadi kesalahan saat melakukan operasi'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedProjects, activeTab, filters]
  );

  const handleCancel = () => {
    setSelectedProjects(new Set());
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const paginatedProjects = getPaginatedProjects();
  const isAllSelected =
    paginatedProjects.length > 0 &&
    paginatedProjects.every((p) => selectedProjects.has(p.id.toString()));

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-350 mx-auto px-6 py-6">

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">

          {/* Title + Back Link */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Kelola Publikasi Proyek</h2>
            <Link href="/admin/projects" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
              <ChevronLeft size={16} />
              <span>Lihat semua proyek</span>
            </Link>
          </div>

          {/* Search + Sector + Tab Toggle — all in one row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <input
              type="text"
              placeholder="Cari ID Proyek, Nama, atau Owner..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="flex-1 min-w-48 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filters.sector}
              onChange={(e) => setFilters((prev) => ({ ...prev, sector: e.target.value }))}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SECTOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Tab Toggle Buttons */}
            <div className="flex rounded-lg overflow-hidden border-2 border-primary">
              <button
                onClick={() => handleTabChange('published')}
                className={`px-4 py-2.5 text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'published'
                    ? 'bg-primary text-white font-bold'
                    : 'bg-white text-primary font-medium hover:bg-blue-50'
                }`}
              >
                Sudah dipublikasikan
              </button>
              <button
                onClick={() => handleTabChange('unpublished')}
                className={`px-4 py-2.5 text-sm transition-colors whitespace-nowrap border-l-2 border-primary ${
                  activeTab === 'unpublished'
                    ? 'bg-primary text-white font-bold'
                    : 'bg-white text-primary font-medium hover:bg-blue-50'
                }`}
              >
                Belum dipublikasikan
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-sm text-gray-600">Memuat proyek...</p>
            </div>
          ) : paginatedProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeTab === 'published'
                  ? 'Belum ada proyek yang dipublikasikan'
                  : 'Belum ada proyek yang terverifikasi dan siap dipublikasikan'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 pr-4">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 cursor-pointer accent-primary"
                        />
                      </th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Project ID</th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Project Name</th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sector</th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Funding</th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProjects.map((project, index) => (
                      <tr
                        key={project.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="py-4 pr-4">
                          <input
                            type="checkbox"
                            checked={selectedProjects.has(project.id.toString())}
                            onChange={() => handleCheckboxChange(project.id.toString())}
                            className="w-4 h-4 cursor-pointer accent-primary"
                          />
                        </td>
                        <td className="py-4 text-sm text-gray-900 font-medium">
                          PRJ-{String(project.id).padStart(4, '0')}
                        </td>
                        <td className="py-4 text-sm text-gray-900">{project.name}</td>
                        <td className="py-4 text-sm text-gray-600">{project.ownerName || 'N/A'}</td>
                        <td className="py-4 text-sm text-gray-600">
                          {project.sector?.replace(/_/g, ' ') || 'N/A'}
                        </td>
                        <td className="py-4 text-sm text-gray-600">{formatDate(project.createdAt)}</td>
                        <td className="py-4 text-sm text-gray-900 font-medium">{project.budget || 'N/A'}</td>
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
                              onClick={() => router.push(`/admin/projects/PRJ-${String(project.id).padStart(4, '0')}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                              title="View"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Edit">
                              <Edit className="size-4" />
                            </button>
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
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
                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                    disabled={pagination.page === 0}
                    className="border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">
              {selectedProjects.size} Proyek Terpilih
            </p>
            <div className="flex gap-3">
              {activeTab === 'unpublished' ? (
                <Button
                  variant="filled"
                  onClick={() => handleBulkAction('publish')}
                  disabled={selectedProjects.size === 0 || isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing
                    ? 'Processing...'
                    : `Publikasikan${selectedProjects.size > 0 ? ` ${selectedProjects.size}` : ''} Proyek`}
                </Button>
              ) : (
                <Button
                  variant="filled"
                  onClick={() => handleBulkAction('unpublish')}
                  disabled={selectedProjects.size === 0 || isProcessing}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing
                    ? 'Processing...'
                    : `Batalkan publikasi${selectedProjects.size > 0 ? ` ${selectedProjects.size}` : ''} Proyek`}
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={selectedProjects.size === 0}
                className="border-2 border-primary text-primary font-normal hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batalkan (buang perubahan)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}