import { api, apiGet, apiPatch, apiPatchFile, apiPost, apiPostFile } from '@/shared/lib/api';
import type {
  CatalogueExportRequest,
  CatalogueProjectDetailDTO,
  CreateProjectRequest,
  ProjectDetailDTO,
  ProjectHistoryItemDTO,
  ProjectListItemDTO,
  ProjectResponseDTO,
} from '@/features/project/types';
import type {
  BatchUploadProjectRequest,
  BatchUploadJobDTO,
  BatchUploadStatusDTO,
} from '@/features/project/types/import-project';
import type {
  AdminProjectDetailDTO,
} from '@/features/project/types/admin-detail';
import type { ProjectCardData } from '@/shared/components/project-card';
import { ProjectStatus } from '@/shared/enums/project-status';
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

// ─── Update Project (Project Owner) ─────────────────────────────────────────

export interface UpdateProjectPayload {
  data: CreateProjectRequest;
  mapFile?: File | null;
  projectStructureFile?: File | null;
  projectFile?: File | null;
}

export async function updateProject(projectId: number, payload: UpdateProjectPayload) {
  const formData = new FormData();
  formData.append(
    'data',
    new Blob([JSON.stringify(payload.data)], { type: 'application/json' })
  );
  if (payload.mapFile) {
    formData.append('mapFile', payload.mapFile);
  }
  if (payload.projectStructureFile) {
    formData.append('projectStructureFile', payload.projectStructureFile);
  }
  if (payload.projectFile) {
    formData.append('projectFile', payload.projectFile);
  }

  return apiPatchFile<ProjectResponseDTO>(`/api/projects/${projectId}`, formData);
}

/** Submit a DRAFT project for review without changing any other fields. */
export async function submitProject(projectId: number) {
  const formData = new FormData();
  formData.append(
    'data',
    new Blob([JSON.stringify({ isSubmitted: true })], { type: 'application/json' })
  );
  return apiPatchFile<ProjectResponseDTO>(`/api/projects/${projectId}`, formData);
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

export async function submitBulkInsert(payload: BatchUploadProjectRequest[]) {
  return apiPost<BatchUploadJobDTO>('/api/admin/projects/batch-upload', payload);
}

export async function getBatchUploadStatus(jobId: string) {
  return apiGet<BatchUploadStatusDTO>(`/api/admin/projects/batch-upload/${jobId}`);
}
// ─── Get My Projects (Project Owner) ────────────────────────────────────────

export interface GetMyProjectsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: string;
  sector?: string;
  search?: string;
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

  if (params.sector) {
    queryParams.sector = params.sector;
  }

  if (params.search) {
    queryParams.search = params.search;
  }

  return apiGet<PagedProjectsResponse>('/api/projects/my-projects', queryParams);
}

// ─── Get My Project Status Counts (Project Owner) ───────────────────────────

export interface ProjectStatusCountResponse {
  draft: number;
  diajukan: number;
  inReview: number;
  terverifikasi: number;
  terpublikasi: number;
  perbaikanData: number;
  total: number;
}

export async function getMyProjectStatusCounts(): Promise<BaseResponse<ProjectStatusCountResponse>> {
  return apiGet<ProjectStatusCountResponse>('/api/projects/my-projects/status-counts');
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

  if (params.search?.trim()) {
    queryParams.search = params.search.trim();
  }

  const response = await apiGet<PagedProjectsResponse>('/api/admin/projects', queryParams);
  return response;
}

// ─── Publish Projects (Admin) ───────────────────────────────────────────────

export async function publishProjects(projectIds: number[]): Promise<BaseResponse<number>> {
  return apiPatch<number>('/api/admin/projects/bulk-publish', { projectIds });
}

export async function unpublishProjects(projectIds: number[]): Promise<BaseResponse<number>> {
  return apiPatch<number>('/api/admin/projects/bulk-unpublish', { projectIds });
}

// ─── Get Published Projects (Public Catalogue) ──────────────────────────────

export interface GetPublishedProjectsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  sector?: string;
  location?: string;
  cooperationModel?: string;
  minBudget?: string;
  maxBudget?: string;
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
  ownerInstitution: string;
  locationImageUrl: string;
  createdAt: string;
}

export async function getPublishedProjects(params: GetPublishedProjectsParams): Promise<BaseResponse<PagedProjectsResponse>> {
  const queryParams: Record<string, string> = {
    page: (params.page ?? 0).toString(),
    size: (params.size ?? 12).toString(),
    sort: `${params.sortBy ?? 'createdAt'},${params.sortDirection ?? 'desc'}`,
  };

  if (params.sector) {
    queryParams.sector = params.sector;
  }

  if (params.location) {
    queryParams.location = params.location;
  }

  if (params.cooperationModel) {
    queryParams.cooperationModel = params.cooperationModel;
  }

  if (params.minBudget) {
    queryParams.minBudget = params.minBudget;
  }

  if (params.maxBudget) {
    queryParams.maxBudget = params.maxBudget;
  }

  if (params.search?.trim()) {
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
      status: ProjectStatus.TERPUBLIKASI, // All public catalogue projects are published
      location: project.location,
      description: project.description,
      ownerInstitution: project.ownerInstitution,
      locationImageUrl: project.locationImageUrl,
      createdAt: project.createdAt,
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

// ─── Get Public Catalogue Project Detail ─────────────────────────────────────

export async function getCatalogueProjectById(id: number): Promise<BaseResponse<CatalogueProjectDetailDTO>> {
  return apiGet<CatalogueProjectDetailDTO>(`/api/catalogue/${id}`);
}

// ─── Record Project View ──────────────────────────────────────────────────────

export async function recordProjectView(projectId: number): Promise<BaseResponse<void>> {
  return apiPost<void>('/api/project-views', { projectId });
}

// ─── Admin Project Detail ───────────────────────────────────────────────────

export async function getProjectDetail(projectId: number): Promise<BaseResponse<AdminProjectDetailDTO>> {
  return apiGet<AdminProjectDetailDTO>(`/api/admin/projects/${projectId}`);
}

export async function approveProject(projectId: number): Promise<BaseResponse<ProjectResponseDTO>> {
  return apiPatch<ProjectResponseDTO>(`/api/admin/projects/${projectId}/approve`, {});
}

export async function rejectProject(projectId: number, notes: string): Promise<BaseResponse<ProjectResponseDTO>> {
  if (!notes || notes.length < 10 || notes.length > 500) {
    throw new Error('Catatan wajib diisi minimal 10 karakter dan maksimal 500 karakter');
  }
  return apiPatch<ProjectResponseDTO>(`/api/admin/projects/${projectId}/reject`, { notes });
}
