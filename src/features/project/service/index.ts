import { api, apiGet, apiPost, apiPostFile } from '@/shared/lib/api';
import type {
  CatalogueExportRequest,
  CreateProjectRequest,
  ProjectListItemDTO,
  ProjectResponseDTO,
} from '@/features/project/types';
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
