import { z } from 'zod';
import {
  generalSectionSchema,
  technicalSectionSchema,
  financialSectionSchema,
  timelinesSchema,
  confirmationSchema,
  feasibilityStudyRefinement,
} from './project-form-base';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

const requiredFileSchema = (message: string, maxSize?: number, maxSizeMessage?: string) =>
  z
    .custom<File | null>(value => value instanceof File, { message })
    .nullable()
    .refine(Boolean, message)
    .refine(
      file => !file || !maxSize || file.size <= maxSize,
      maxSizeMessage ?? 'Ukuran file melebihi batas.'
    );

export const projectFormSchema = z
  .object({
    general: generalSectionSchema,
    technical: technicalSectionSchema,
    financial: financialSectionSchema,
    timelines: timelinesSchema,
    confirmation: confirmationSchema,
    files: z.object({
      mapFile: requiredFileSchema(
        'File peta wajib diunggah.',
        MAX_IMAGE_SIZE,
        'Ukuran gambar maksimal 5 MB.'
      ),
      projectStructureFile: requiredFileSchema(
        'Dokumen struktur proyek wajib diunggah.',
        MAX_IMAGE_SIZE,
        'Ukuran gambar maksimal 5 MB.'
      ),
      feasibilityStudyFile: requiredFileSchema(
        'Dokumen feasibility study wajib diunggah.',
        MAX_PDF_SIZE,
        'Ukuran file PDF maksimal 10 MB.'
      ),
    }),
  })
  .superRefine(feasibilityStudyRefinement);

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const DEFAULT_PROJECT_FORM_VALUES: ProjectFormValues = {
  general: {
    projectName: '',
    shortDescription: '',
    sector: '',
    location: '',
    valueProposition: '',
    ownerInstitution: '',
    contactPerson: '',
    email: '',
    phone: '',
  },
  technical: {
    cooperationModel: '',
    concessionPeriod: 0,
    assetReadiness: '',
    governmentSupport: '',
    revenueStream: '',
    isFeasibilityStudy: false,
  },
  financial: {
    totalCapex: undefined,
    totalOpex: undefined,
    npv: undefined,
    irr: undefined,
    additionalInfo: '',
  },
  timelines: [{ timeRange: '', phaseDescription: '' }],
  confirmation: {
    confirmDataAccuracy: false,
    agreePublication: false,
    acknowledgeVerification: false,
    allowPromotion: false,
  },
  files: {
    mapFile: null,
    projectStructureFile: null,
    feasibilityStudyFile: null,
  },
};

export const STEP_LABELS = ['General', 'Technical', 'Financial', 'Ringkasan'] as const;

export const STEP_FIELDS: Record<1 | 2 | 3 | 4, string[]> = {
  1: [
    'general.projectName',
    'general.shortDescription',
    'general.sector',
    'general.location',
    'general.valueProposition',
    'files.mapFile',
    'general.ownerInstitution',
    'general.contactPerson',
    'general.email',
    'general.phone',
  ],
  2: [
    'technical.cooperationModel',
    'technical.concessionPeriod',
    'technical.assetReadiness',
    'files.projectStructureFile',
    'technical.governmentSupport',
    'technical.revenueStream',
    'files.feasibilityStudyFile',
    'technical.isFeasibilityStudy',
    'timelines',
  ],
  3: [
    'financial.totalCapex',
    'financial.totalOpex',
    'financial.npv',
    'financial.irr',
  ],
  4: [
    'confirmation.confirmDataAccuracy',
    'confirmation.agreePublication',
    'confirmation.acknowledgeVerification',
    'confirmation.allowPromotion',
  ],
};
