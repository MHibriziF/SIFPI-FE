'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileEdit, Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Select, TextInput } from '@/shared/components/form-fields';
import { ProjectCard, type ProjectCardData } from '@/shared/components/project-card';
import { StatCard } from '@/shared/components/stat-card';
import { showToast } from '@/shared/components/toast';
import { getMyProjects } from '@/features/project/services';
import { ApiError } from '@/shared/types/api';
import {
  ProjectStatus,
  PROJECT_STATUS_LABELS,
  SECTOR_OPTIONS,
} from '@/shared/enums';

// ─── Constants ──────────────────────────────────────────────────────────────

type OwnerStatus = ProjectStatus | '';

/** Radix Select.Item disallows value="" — use a sentinel for "all" options */
const ALL = '__all__';

const SECTOR_FILTER_OPTIONS = [
  { value: ALL, label: 'Semua Sektor' },
  ...SECTOR_OPTIONS,
];

const STATUS_FILTER_OPTIONS = [
  { value: ALL, label: 'Semua Status' },
  ...Object.values(ProjectStatus).map(s => ({ value: s, label: PROJECT_STATUS_LABELS[s] })),
];

const SORT_OPTIONS = [
  { value: 'desc', label: 'Terbaru' },
  { value: 'asc', label: 'Terlama' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function OwnerReadAllProjects() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: '' as OwnerStatus,
    sector: '',
    keyword: '',
    sortDirection: 'desc' as 'asc' | 'desc',
  });

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const [statusCounts, setStatusCounts] = useState({
    draft: 0,
    submitted: 0,
    approved: 0,
    needsRevision: 0,
  });

  // ── Fetch Status Counts (independent of filters) ───────────────────────

  const fetchStatusCounts = useCallback(async () => {
    try {
      // Fetch ALL projects without status filter to calculate accurate counts
      const response = await getMyProjects({
        page: 0,
        size: 1000, // Large enough to get all projects for counting
        sortBy: 'createdAt',
        sortDirection: 'desc',
        // NO status filter here - we want all projects
      });

      const allProjects = response.data.content || [];
      const counts = { draft: 0, submitted: 0, approved: 0, needsRevision: 0 };
      
      // Debug: Log actual status values from backend
      console.log('📊 Status values from backend:', allProjects.map(p => ({ id: p.id, status: p.status })));
      
      allProjects.forEach((p) => {
        // Normalize status to uppercase for consistent comparison
        const normalizedStatus = p.status?.toUpperCase();
        
        switch (normalizedStatus) {
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
    } catch (error) {
      console.error('Error fetching status counts:', error);
      // Don't show toast for counts error, just log it
    }
  }, []);

  // ── Fetch Projects (with filters) ──────────────────────────────────────

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMyProjects({
        page: pagination.page,
        size: pagination.size,
        sortBy: 'createdAt',
        sortDirection: filters.sortDirection,
        status: filters.status || undefined,
        sector: filters.sector || undefined,
        search: filters.keyword || undefined,
      });

      const data = response.data;
      setProjects(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      const apiError = error as ApiError;
      showToast('danger', 'Gagal memuat proyek', apiError.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.size, filters.status, filters.keyword, filters.sector, filters.sortDirection]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    // Fetch status counts once on mount and whenever filters change
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleStatusFilter = (status: OwnerStatus) => {
    setFilters((prev) => ({ ...prev, status: prev.status === status ? '' : status }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // ── Render ──────────────────────────────────────────────────────────────

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
            title="Draft"
            value={statusCounts.draft}
            variant="draft"
            isActive={filters.status === ProjectStatus.DRAFT}
            onClick={() => handleStatusFilter(ProjectStatus.DRAFT)}
          />
          <StatCard
            icon={Clock}
            title="In Review"
            value={statusCounts.submitted}
            variant="info"
            isActive={filters.status === ProjectStatus.IN_REVIEW || filters.status === ProjectStatus.DIAJUKAN}
            onClick={() => handleStatusFilter(ProjectStatus.IN_REVIEW)}
          />
          <StatCard
            icon={CheckCircle}
            title="Terverifikasi"
            value={statusCounts.approved}
            variant="success"
            isActive={filters.status === ProjectStatus.TERVERIFIKASI || filters.status === ProjectStatus.TERPUBLIKASI}
            onClick={() => handleStatusFilter(ProjectStatus.TERVERIFIKASI)}
          />
          <StatCard
            icon={AlertTriangle}
            title="Perbaikan Data"
            value={statusCounts.needsRevision}
            variant="warning"
            isActive={filters.status === ProjectStatus.PERBAIKAN_DATA}
            onClick={() => handleStatusFilter(ProjectStatus.PERBAIKAN_DATA)}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TextInput
              label="Cari Proyek"
              placeholder="Masukkan nama proyek..."
              value={filters.keyword}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, keyword: e.target.value }));
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
              options={STATUS_FILTER_OPTIONS}
              value={filters.status || ALL}
              onValueChange={(val) => {
                handleStatusFilter(val === ALL ? '' : val as OwnerStatus);
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
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-600">Memuat proyek...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">Belum ada proyek yang diajukan</p>
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
                  showSubmittedDate
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {pagination.page * pagination.size + 1}-
                {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
                {pagination.totalElements} entries
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pagination.page <= 0}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={pagination.page === i ? 'filled' : 'ghost'}
                    size="icon-sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: i }))}
                    className="text-xs"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pagination.page >= pagination.totalPages - 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
