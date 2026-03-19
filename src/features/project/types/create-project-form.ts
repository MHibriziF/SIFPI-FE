import { z } from 'zod';
import {
  generalSectionSchema,
  technicalSectionSchema,
  financialSectionSchema,
  timelinesSchema,
  confirmationSchema,
  feasibilityStudyRefinement,
} from './project-form-base';

const requiredFileSchema = (message: string) =>
  z.custom<File | null>(value => value instanceof File, { message }).nullable().refine(Boolean, message);

export const projectFormSchema = z
  .object({
    general: generalSectionSchema,
    technical: technicalSectionSchema,
    financial: financialSectionSchema,
    timelines: timelinesSchema,
    confirmation: confirmationSchema,
    files: z.object({
      mapFile: requiredFileSchema('File peta wajib diunggah.'),
      projectStructureFile: requiredFileSchema('Dokumen struktur proyek wajib diunggah.'),
      feasibilityStudyFile: requiredFileSchema('Dokumen feasibility study wajib diunggah.'),
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
