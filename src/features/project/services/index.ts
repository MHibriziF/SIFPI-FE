import { apiPostFile, apiGet, apiPatch } from '@/shared/lib/api';
import type { CreateProjectRequest, ProjectResponseDTO } from '@/features/project/types';
import type { BaseResponse } from '@/shared/types/api';
import type { ProjectCardData } from '@/shared/components/project-card';

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
