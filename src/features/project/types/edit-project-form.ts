import { z } from 'zod';
import {
  generalSectionSchema,
  technicalSectionSchema,
  financialSectionSchema,
  timelinesSchema,
  confirmationSchema,
  feasibilityStudyRefinement,
} from './project-form-base';

/**
 * Edit project form schema — same fields as create, but files are optional
 * (user may keep existing files or upload new ones).
 */
export const editProjectFormSchema = z
  .object({
    general: generalSectionSchema,
    technical: technicalSectionSchema,
    financial: financialSectionSchema,
    timelines: timelinesSchema,
    confirmation: confirmationSchema,
    files: z.object({
      mapFile: z.custom<File | null>().nullable().optional(),
      projectStructureFile: z.custom<File | null>().nullable().optional(),
      feasibilityStudyFile: z.custom<File | null>().nullable().optional(),
    }),
  })
  .superRefine(feasibilityStudyRefinement);

export type EditProjectFormValues = z.infer<typeof editProjectFormSchema>;

export const EDIT_STEP_LABELS = ['General', 'Technical', 'Financial', 'Ringkasan'] as const;

export const EDIT_STEP_FIELDS: Record<1 | 2 | 3 | 4, string[]> = {
  1: [
    'general.projectName',
    'general.shortDescription',
    'general.sector',
    'general.location',
    'general.valueProposition',
    'general.ownerInstitution',
    'general.contactPerson',
    'general.email',
    'general.phone',
  ],
  2: [
    'technical.cooperationModel',
    'technical.concessionPeriod',
    'technical.assetReadiness',
    'technical.governmentSupport',
    'technical.revenueStream',
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
