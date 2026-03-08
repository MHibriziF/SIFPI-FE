import { apiPost, apiPostFile } from '@/shared/lib/api';
import type { CreateProjectRequest, ProjectResponseDTO } from '@/features/project/types';
import type {
  BatchUploadProjectRequest,
  BatchUploadProjectResultDTO,
} from '@/features/project/types/import-project';

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

export async function batchUploadProjects(payload: BatchUploadProjectRequest[]) {
  return apiPost<BatchUploadProjectResultDTO>('/api/admin/projects/batch-upload', payload);
}
