import type { ProjectStatus, Sector } from '@/shared/enums';

export interface ProjectTimelineRequest {
  timeRange: string;
  phaseDescription: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  sector: Sector | string;
  status?: ProjectStatus | string;
  location: string;
  valueProposition: string;
  ownerInstitution: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  cooperationModel: string;
  concessionPeriod: number;
  assetReadiness: string;
  governmentSupport: string;
  totalCapex: number;
  totalOpex: number;
  npv: number;
  irr: number;
  revenueStream: string;
  isFeasibilityStudy: boolean;
  additionalInfo?: string;
  timelines?: ProjectTimelineRequest[];
  isSubmitted?: boolean;
}

export interface ProjectTimelineResponseDTO {
  id: number;
  timeRange: string;
  phaseDescription: string;
}

export interface ProjectResponseDTO {
  id: number;
  name: string;
  description: string;
  sector: Sector | string;
  status: ProjectStatus | string;
  location: string;
  valueProposition: string;
  locationImageUrl: string | null;
  ownerInstitution: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  cooperationModel: string;
  concessionPeriod: number;
  assetReadiness: string;
  projectStructureImageUrl: string | null;
  governmentSupport: string;
  totalCapex: number;
  totalOpex: number;
  npv: number;
  irr: number;
  revenueStream: string;
  projectFileDownloadUrl: string | null;
  isFeasibilityStudy: boolean;
  additionalInfo: string | null;
  timelines: ProjectTimelineResponseDTO[];
  isSubmitted: boolean;
}

export interface ProjectListItemDTO {
  id: number;
  name: string;
  sector: Sector | string;
  status: ProjectStatus | string;
  ownerId?: string | null;
  ownerName?: string | null;
  ownerOrganization?: string | null;
  totalCapex?: number | null;
  totalOpex?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Legacy compatibility for endpoints that may still return these fields.
export interface ProjectListItemLegacyDTO extends ProjectListItemDTO {
  projectCode?: string | null;
  ownerInstitution?: string | null;
}

// ─── Project Detail (full single-project response) ────────────────────────

export interface ProjectDetailDTO extends ProjectResponseDTO {
  ownerId: string;
  rejectionReason: string | null;
  createdAt: string;
  editedAt: string;
}

// ─── Project Status History ───────────────────────────────────────────────

export interface ProjectHistoryItemDTO {
  id: number;
  status: ProjectStatus | string;
  changedBy: string;
  changedByName: string;
  notes: string | null;
  changedAt: string;
}

// ─── Catalogue Export ─────────────────────────────────────────────────────

export type CatalogueQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface CatalogueExportRequest {
  projectIds: number[];
  quarter: CatalogueQuarter;
  year: number;
}
