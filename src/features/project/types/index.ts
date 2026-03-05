export interface ProjectTimelineRequest {
  timeRange: string;
  phaseDescription: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  sector: string;
  status?: string;
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
  sector: string;
  status: string;
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
