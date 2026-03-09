export interface BatchUploadProjectRequest {
  ownerEmail: string;
  name: string;
  description: string;
  sector: string;
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
  is_feasibility_study: boolean;
  additionalInfo?: string | null;
  locationImageUrl: string;
  projectStructureImageUrl: string;
  projectFileUrl: string;
}

export interface BatchUploadProjectError {
  row: number;
  reasons: string[];
}

export interface BatchUploadProjectResultDTO {
  successCount: number;
  failedCount: number;
  errors: BatchUploadProjectError[];
}

export interface ParsedBulkProjectRow {
  rowNumber: number;
  dto: BatchUploadProjectRequest;
  errors: string[];
}

export interface BulkProjectImportDraft {
  sourceFileName: string;
  rows: ParsedBulkProjectRow[];
  createdAt: string;
}