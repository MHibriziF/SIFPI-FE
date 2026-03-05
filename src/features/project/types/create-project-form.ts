import { z } from 'zod';

const PHONE_REGEX = /^[+]?[\d\s()\-]{8,20}$/;

const shortDescriptionSchema = z
  .string()
  .min(1, 'Deskripsi singkat wajib diisi.')
  .refine(value => value.trim().split(/\s+/).length <= 50, 'Maksimal 50 kata.');

const positiveNumber = (label: string) =>
  z
    .number({ message: `${label} wajib berupa angka.` })
    .refine(value => Number.isFinite(value), `${label} wajib berupa angka valid.`);

const optionalFiniteNumber = (label: string) =>
  z
    .number({ message: `${label} wajib berupa angka.` })
    .refine(value => Number.isFinite(value), `${label} wajib berupa angka valid.`)
    .optional();

const requiredFileSchema = (message: string) =>
  z.custom<File | null>(value => value instanceof File, { message }).nullable().refine(Boolean, message);

export const projectFormSchema = z
  .object({
    general: z.object({
      projectName: z.string().min(1, 'Nama proyek wajib diisi.'),
      shortDescription: shortDescriptionSchema,
      sector: z.string().min(1, 'Sektor wajib diisi.'),
      location: z.string().min(1, 'Lokasi wajib diisi.'),
      valueProposition: z.string().min(1, 'Value proposition wajib diisi.'),
      ownerInstitution: z.string().min(1, 'Institusi pemilik wajib diisi.'),
      contactPerson: z.string().min(1, 'Nama kontak wajib diisi.'),
      email: z.email('Format email tidak valid.'),
      phone: z.string().regex(PHONE_REGEX, 'Format nomor telepon tidak valid.'),
    }),
    technical: z.object({
      cooperationModel: z.string().min(1, 'Model kerja sama wajib diisi.'),
      concessionPeriod: positiveNumber('Periode konsesi').min(1, 'Periode konsesi minimal 1 tahun.'),
      assetReadiness: z.string().min(1, 'Kesiapan aset wajib diisi.'),
      governmentSupport: z.string().min(1, 'Dukungan pemerintah wajib diisi.'),
      revenueStream: z.string().min(1, 'Revenue stream wajib diisi.'),
      isFeasibilityStudy: z.boolean(),
    }),
    financial: z.object({
      totalCapex: optionalFiniteNumber('Total CAPEX'),
      totalOpex: optionalFiniteNumber('Total OPEX'),
      npv: optionalFiniteNumber('NPV'),
      irr: optionalFiniteNumber('IRR'),
      additionalInfo: z.string().optional(),
    }),
    timelines: z
      .array(
        z.object({
          timeRange: z.string().min(1, 'Rentang waktu wajib diisi.'),
          phaseDescription: z.string().min(1, 'Deskripsi fase wajib diisi.'),
        })
      )
      .min(1, 'Timeline minimal satu fase.'),
    confirmation: z.object({
      confirmDataAccuracy: z.boolean(),
      agreePublication: z.boolean(),
      acknowledgeVerification: z.boolean(),
      allowPromotion: z.boolean(),
    }),
    files: z.object({
      mapFile: requiredFileSchema('File peta wajib diunggah.'),
      projectStructureFile: requiredFileSchema('Dokumen struktur proyek wajib diunggah.'),
      feasibilityStudyFile: requiredFileSchema('Dokumen feasibility study wajib diunggah.'),
    }),
  })
  .superRefine((value, context) => {
    if (!value.technical.isFeasibilityStudy) return;

    if (value.financial.totalCapex === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Total CAPEX wajib diisi jika dokumen feasibility study dicentang.',
        path: ['financial', 'totalCapex'],
      });
    }

    if (value.financial.totalOpex === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Total OPEX wajib diisi jika dokumen feasibility study dicentang.',
        path: ['financial', 'totalOpex'],
      });
    }

    if (value.financial.npv === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'NPV wajib diisi jika dokumen feasibility study dicentang.',
        path: ['financial', 'npv'],
      });
    }

    if (value.financial.irr === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'IRR wajib diisi jika dokumen feasibility study dicentang.',
        path: ['financial', 'irr'],
      });
    }
  });

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
