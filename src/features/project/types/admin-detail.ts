// Admin Project Detail DTO - matches backend AdminProjectDetailDTO
export interface AdminProjectDetailDTO {
  // Basic Project Information
  id: number;
  name: string;
  description: string;
  sector: string;
  status: string; // ProjectStatus enum
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime

  // Location Information
  location: string;
  locationImageUrl: string | null;

  // Value Proposition & Strategic Info
  valueProposition: string | null;

  // Project Scope Details
  cooperationModel: string | null;
  concessionPeriod: number | null;
  assetReadiness: string | null;
  projectStructureImageUrl: string | null;

  // Government Support
  governmentSupport: string | null;

  // Financial Information
  totalCapex: number | null;
  totalOpex: number | null;
  npv: number | null;
  irr: number | null;
  revenueStream: string | null;

  // Project Documents
  projectFileDownloadUrl: string | null;
  isFeasibilityStudy: boolean | null;

  // Additional Information
  additionalInfo: string | null;

  // Project Owner Information
  ownerId: string; // UUID
  ownerName: string;
  ownerOrganization: string | null;
  ownerEmail: string;
  ownerPhone: string;

  // Contact Person Information
  contactPersonName: string | null;
  contactPersonEmail: string | null;
  contactPersonPhone: string | null;

  // Project Structure
  ownerInstitution: string | null;

  // Submission Status
  isSubmitted: boolean;

  // Timeline & History
  timelines: ProjectTimelineDTO[];
  statusHistory: ProjectStatusHistoryDTO[];
  verifications: ProjectVerificationDTO[];
}

export interface ProjectTimelineDTO {
  id: number;
  timeRange: string;
  phaseDescription: string;
}

export interface ProjectStatusHistoryDTO {
  id: number;
  status: string;           // DRAFT | DIAJUKAN | IN_REVIEW | PERBAIKAN_DATA | TERVERIFIKASI | TERPUBLIKASI
  changedAt: string;        // ISO datetime
  changedBy: string;        // UUID
  changedByName: string;    // Name of person who changed status
  notes: string | null;     // Reason/notes for status change
}

export interface ProjectVerificationDTO {
  id: number;
  action: 'VERIFIED' | 'REJECTED'; // or 'PUBLISHED' | 'UNPUBLISHED'
  notes: string;
  verifiedBy: string; // UUID
  verifiedByName: string;
  verifiedAt: string; // ISO datetime
}

export interface RejectProjectRequest {
  notes: string; // 10-500 characters
}
