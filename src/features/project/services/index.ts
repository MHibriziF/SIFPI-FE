import { api, apiGet, apiPatch, apiPost, apiPostFile } from '@/shared/lib/api';
import type {
  CatalogueExportRequest,
  CreateProjectRequest,
  ProjectDetailDTO,
  ProjectHistoryItemDTO,
  ProjectListItemDTO,
  ProjectResponseDTO,
} from '@/features/project/types';
import type {
  BatchUploadProjectRequest,
  BatchUploadProjectResultDTO,
} from '@/features/project/types/import-project';
import type { ProjectCardData } from '@/shared/components/project-card';
import { BaseResponse } from '@/shared/types/api';

// ─── Shared pagination types ────────────────────────────────────────────────

export interface PagedProjectsResponse {
  content: ProjectCardData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ─── Create Project (Project Owner) ─────────────────────────────────────────

export interface CreateProjectPayload {
  data: CreateProjectRequest;
  mapFile: File;
  projectStructureFile: File;
  projectFile: File;
}

export async function createProject(payload: CreateProjectPayload) {
  const formData = new FormData();
  formData.append(
    'data',
    new Blob([JSON.stringify(payload.data)], { type: 'application/json' })
  );
  formData.append('mapFile', payload.mapFile);
  formData.append('projectStructureFile', payload.projectStructureFile);
  formData.append('projectFile', payload.projectFile);

  return apiPostFile<ProjectResponseDTO>('/api/projects', formData);
}

export async function getProjects() {
  return apiGet<ProjectListItemDTO[] | { content?: ProjectListItemDTO[]; items?: ProjectListItemDTO[] }>(
    '/api/admin/projects'
  );
}

export interface CatalogueExportFile {
  blob: Blob;
  filename: string;
}

function extractFilename(contentDisposition?: string): string {
  if (!contentDisposition) return 'project-catalogue.pdf';

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]).replace(/["']/g, '');

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) return plainMatch[1].trim();

  return 'project-catalogue.pdf';
}

export async function exportProjectCatalogue(payload: CatalogueExportRequest) {
  const res = await api.post<Blob>('/api/projects/catalogue/export', payload, {
    responseType: 'blob',
  });

  return {
    blob: res.data,
    filename: extractFilename(res.headers['content-disposition']),
  } as CatalogueExportFile;
}

export async function batchUploadProjects(payload: BatchUploadProjectRequest[]) {
  return apiPost<BatchUploadProjectResultDTO>('/api/admin/projects/batch-upload', payload);
}
// ─── Get My Projects (Project Owner) ────────────────────────────────────────

export interface GetMyProjectsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: string;
}

export async function getMyProjects(params: GetMyProjectsParams): Promise<BaseResponse<PagedProjectsResponse>> {
  const queryParams: Record<string, string> = {
    page: (params.page ?? 0).toString(),
    size: (params.size ?? 10).toString(),
    sortBy: params.sortBy ?? 'createdAt',
    sortDirection: params.sortDirection ?? 'desc',
  };

  if (params.status) {
    queryParams.status = params.status;
  }

  return apiGet<PagedProjectsResponse>('/api/projects/my-projects', queryParams);
}

// ─── Get All Projects (Admin) ───────────────────────────────────────────────

export interface GetAllProjectsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: string;
  sector?: string;
  search?: string;
}

export async function getAllProjects(params: GetAllProjectsParams): Promise<BaseResponse<PagedProjectsResponse>> {
  const queryParams: Record<string, string> = {
    page: (params.page ?? 0).toString(),
    size: (params.size ?? 10).toString(),
    sortBy: params.sortBy ?? 'createdAt',
    sortDirection: params.sortDirection ?? 'desc',
  };

  if (params.status) {
    queryParams.status = params.status;
  }

  if (params.sector) {
    queryParams.sector = params.sector;
  }

  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  return apiGet<PagedProjectsResponse>('/api/admin/projects', queryParams);
}

// ─── Publish Projects (Admin) ───────────────────────────────────────────────

export async function publishProjects(projectIds: number[]): Promise<BaseResponse<void>> {
  return apiPatch<void>('/api/projects/publish', { projectIds });
}

// ─── Get Published Projects (Public Catalogue) ──────────────────────────────

export interface GetPublishedProjectsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  sector?: string;
  location?: string; // Changed from province to match backend
  search?: string;
}

// Backend DTO from PublicProjectCatalogueDTO
interface PublicProjectBackendDTO {
  id: number;
  name: string;
  description: string;
  sector: string;
  location: string;
  totalCapex: number;
  cooperationModel: string;
  locationImageUrl: string;
  createdAt: string;
}

// Helper function to format budget
function formatBudget(totalCapex: number): string {
  if (!totalCapex) return '';
  
  const billions = totalCapex / 1_000_000_000;
  const trillions = totalCapex / 1_000_000_000_000;
  
  if (trillions >= 1) {
    return `Rp ${trillions.toFixed(1)} Trillion`;
  } else if (billions >= 1) {
    return `Rp ${billions.toFixed(1)} Billion`;
  } else {
    return `Rp ${(totalCapex / 1_000_000).toFixed(1)} Million`;
  }
}

export async function getPublishedProjects(params: GetPublishedProjectsParams): Promise<BaseResponse<PagedProjectsResponse>> {
  const queryParams: Record<string, string> = {
    page: (params.page ?? 0).toString(),
    size: (params.size ?? 12).toString(),
    sortBy: params.sortBy ?? 'createdAt',
    sortDirection: params.sortDirection ?? 'desc',
  };

  if (params.sector) {
    queryParams.sector = params.sector;
  }

  if (params.location) {
    queryParams.location = params.location; // Backend expects 'location' not 'province'
  }

  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  const response = await apiGet<{
    content: PublicProjectBackendDTO[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  }>('/api/catalogue', queryParams);

  // Transform backend DTO to frontend ProjectCardData
  if (response.data) {
    const transformedContent: ProjectCardData[] = response.data.content.map((project) => ({
      id: project.id,
      name: project.name,
      sector: project.sector,
      status: 'TERPUBLIKASI' as const, // All public catalogue projects are published
      location: project.location,
      description: project.description,
      budget: formatBudget(project.totalCapex),
      locationImageUrl: project.locationImageUrl,
      // ownerName is not provided by backend yet
    }));

    return {
      status: response.status,
      message: response.message,
      timestamp: response.timestamp,
      data: {
        content: transformedContent,
        page: response.data.page,
        size: response.data.size,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        first: response.data.first,
        last: response.data.last,
      },
    };
  }

  // Fallback if no data
  return {
    status: response.status,
    message: response.message,
    timestamp: response.timestamp,
    data: {
      content: [],
      page: 0,
      size: params.size ?? 12,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    },
  };
}

// ─── Get Single Project Detail ───────────────────────────────────────────────

export async function getProjectById(id: number): Promise<BaseResponse<ProjectDetailDTO>> {
  return apiGet<ProjectDetailDTO>(`/api/projects/${id}`);
}

// ─── Get Project Status History ──────────────────────────────────────────────

export async function getProjectHistory(id: number): Promise<BaseResponse<ProjectHistoryItemDTO[]>> {
  return apiGet<ProjectHistoryItemDTO[]>(`/api/projects/${id}/history`);
}
