import { apiPostFile, apiGet } from '@/shared/lib/api';
import type { CreateProjectRequest, ProjectResponseDTO } from '@/features/project/types';
import type { BaseResponse } from '@/shared/types/api';
import type { ProjectCardData } from '@/shared/components/project-card';

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

// Get my projects with pagination and filters
export interface GetMyProjectsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: string;
}

export interface PagedProjectsResponse {
  content: ProjectCardData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
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
