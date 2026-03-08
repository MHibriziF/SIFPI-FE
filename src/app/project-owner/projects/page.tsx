'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, FileEdit, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { ProjectCard, ProjectCardData } from '@/shared/components/project-card';
import { StatCard } from '@/shared/components/stat-card';
import { showToast } from '@/shared/components/toast';
import { getMyProjects } from '@/features/project/service';
import { ApiError } from '@/shared/types/api';

type ProjectStatus = 'DRAFT' | 'DIAJUKAN' | 'IN_REVIEW' | 'PERBAIKAN_DATA' | 'TERVERIFIKASI' | 'TERPUBLIKASI' | '';

interface ProjectFilters {
  status: ProjectStatus;
  sector: string;
  location: string;
  keyword: string;
}

interface PaginationData {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export default function ProjectOwnerProjectsPage() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    status: '',
    sector: 'All Sectors',
    location: 'All Locations',
    keyword: '',
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    draft: 0,
    submitted: 0,
    approved: 0,
    needsRevision: 0,
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await getMyProjects({
        page: pagination.page,
        size: pagination.size,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        status: filters.status || undefined,
      });

      const data = response.data;

      setProjects(data.content || []);
      setPagination({
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      });

      // Calculate status counts (would be better from a separate endpoint)
      calculateStatusCounts(data.content || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      const apiError = error as ApiError;
      showToast(
        'danger',
        'Gagal memuat proyek',
        apiError.message || 'Terjadi kesalahan'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStatusCounts = (projectList: ProjectCardData[]) => {
    const counts = {
      draft: 0,
      submitted: 0,
      approved: 0,
      needsRevision: 0,
    };

    projectList.forEach((project) => {
      switch (project.status) {
        case 'DRAFT':
          counts.draft++;
          break;
        case 'DIAJUKAN':
        case 'IN_REVIEW':
          counts.submitted++;
          break;
        case 'TERVERIFIKASI':
        case 'TERPUBLIKASI':
          counts.approved++;
          break;
        case 'PERBAIKAN_DATA':
          counts.needsRevision++;
          break;
      }
    });

    setStatusCounts(counts);
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status]);

  const handleStatusFilter = (status: ProjectStatus) => {
    setFilters((prev) => ({ ...prev, status }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleSearch = () => {
    // Implement keyword search when backend supports it
    showToast('info', 'Coming Soon', 'Fitur pencarian akan segera tersedia');
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Proyek</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola proyek yang diajukan</p>
        </div>

        {/* Status Filter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={FileEdit}
            title="Draft Proyek"
            value={statusCounts.draft}
            variant="draft"
            isActive={filters.status === 'DRAFT'}
            onClick={() => handleStatusFilter('DRAFT')}
          />
          <StatCard
            icon={Clock}
            title="Sedang Direview"
            value={statusCounts.submitted}
            variant="info"
            isActive={filters.status === 'IN_REVIEW' || filters.status === 'DIAJUKAN'}
            onClick={() => handleStatusFilter('IN_REVIEW')}
          />
          <StatCard
            icon={CheckCircle}
            title="Telah Disetujui"
            value={statusCounts.approved}
            variant="success"
            isActive={filters.status === 'TERVERIFIKASI' || filters.status === 'TERPUBLIKASI'}
            onClick={() => handleStatusFilter('TERVERIFIKASI')}
          />
          <StatCard
            icon={AlertTriangle}
            title="Butuh Revisi"
            value={statusCounts.needsRevision}
            variant="warning"
            isActive={filters.status === 'PERBAIKAN_DATA'}
            onClick={() => handleStatusFilter('PERBAIKAN_DATA')}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Keyword</label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Masukkan nama proyek..."
                value={filters.keyword}
                onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button
                onClick={handleSearch}
                variant="filled"
                className="bg-primary hover:bg-primary/90 px-6"
              >
                <Search className="size-4" />
                Search Project
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={filters.sector}
                onChange={(e) => setFilters((prev) => ({ ...prev, sector: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All Sectors">All Sectors</option>
                <option value="PUBLIC_TRANSPORTATION">Public Transportation</option>
                <option value="LAND_BASED_TRANSPORT">Land Based Transport (Rails and Road Transport)</option>
                <option value="WASTE_MANAGEMENT">Waste Management</option>
                <option value="TOLL_ROAD">Toll Road</option>
                <option value="AFFORDABLE_HOUSING_AND_TRANSIT_ORIENTED_DEVELOPMENT">Affordable Housing and Transit-oriented Development</option>
                <option value="HEALTH">Health</option>
                <option value="WATER_RESOURCE_DRINKING_WATER_AND_IRRIGATION">Water Resource, Drinking Water, and Irrigation</option>
                <option value="MARITIME">Maritime</option>
                <option value="OIL_GAS_AND_ENERGY">Oil & Gas, and Energy</option>
                <option value="AVIATION">Aviation</option>
                <option value="DIGITAL_AND_TELECOMMUNICATIONS">Digital & Telecommunications</option>
                <option value="EDUCATION_RESEARCH_AND_DEVELOPMENT">Education, Research, and Development</option>
                <option value="URBAN_ECONOMICS_INFRASTRUCTURE_FACILITIES">Urban Economics Infrastructure Facilities</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>All Locations</option>
                <option>Jakarta</option>
                <option>Bandung</option>
                <option>Surabaya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusFilter(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="DIAJUKAN">Diajukan</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="PERBAIKAN_DATA">Perbaikan Data</option>
                <option value="TERVERIFIKASI">Terverifikasi</option>
                <option value="TERPUBLIKASI">Terpublikasi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-600">Memuat proyek...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">Belum ada proyek yang dibuat</p>
            <Button asChild>
              <Link href="/project-owner/projects/create">Buat Proyek Baru</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewDetailHref={`/project-owner/projects/${project.id}`}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outlined"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }))
                  }
                  disabled={pagination.page === 0}
                  className="border-primary text-primary"
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
                  className="border-primary text-primary"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
