import { z } from 'zod';

export const PHONE_REGEX = /^[+]?[\d\s()-]{8,20}$/;

export const shortDescriptionSchema = z
  .string()
  .min(1, 'Deskripsi singkat wajib diisi.')
  .refine(value => value.trim().split(/\s+/).length <= 50, 'Maksimal 50 kata.');

export const positiveNumber = (label: string) =>
  z
    .number({ message: `${label} wajib berupa angka.` })
    .refine(value => Number.isFinite(value), `${label} wajib berupa angka valid.`);

export const optionalFiniteNumber = (label: string) =>
  z
    .number({ message: `${label} wajib berupa angka.` })
    .refine(value => Number.isFinite(value), `${label} wajib berupa angka valid.`)
    .refine(value => value > 0, `${label} wajib berupa angka positif.`)
    .optional();

export const generalSectionSchema = z.object({
  projectName: z.string().min(1, 'Nama proyek wajib diisi.'),
  shortDescription: shortDescriptionSchema,
  sector: z.string().min(1, 'Sektor wajib diisi.'),
  location: z.string().min(1, 'Lokasi wajib diisi.'),
  valueProposition: z.string().min(1, 'Value proposition wajib diisi.'),
  ownerInstitution: z.string().min(1, 'Institusi pemilik wajib diisi.'),
  contactPerson: z.string().min(1, 'Nama kontak wajib diisi.'),
  email: z.email('Format email tidak valid.'),
  phone: z.string().regex(PHONE_REGEX, 'Format nomor telepon tidak valid.'),
});

export const technicalSectionSchema = z.object({
  cooperationModel: z.string().min(1, 'Model kerja sama wajib diisi.'),
  concessionPeriod: positiveNumber('Periode konsesi').min(1, 'Periode konsesi minimal 1 tahun.'),
  assetReadiness: z.string().min(1, 'Kesiapan aset wajib diisi.'),
  governmentSupport: z.string().min(1, 'Dukungan pemerintah wajib diisi.'),
  revenueStream: z.string().min(1, 'Revenue stream wajib diisi.'),
  isFeasibilityStudy: z.boolean(),
});

export const financialSectionSchema = z.object({
  totalCapex: optionalFiniteNumber('Total CAPEX'),
  totalOpex: optionalFiniteNumber('Total OPEX'),
  npv: optionalFiniteNumber('NPV'),
  irr: optionalFiniteNumber('IRR').refine(
    value => value === undefined || value <= 100,
    'IRR maksimal 100%.'
  ),
  additionalInfo: z.string().optional(),
});

export const timelinesSchema = z
  .array(
    z.object({
      timeRange: z.string().min(1, 'Rentang waktu wajib diisi.'),
      phaseDescription: z.string().min(1, 'Deskripsi fase wajib diisi.'),
    })
  )
  .min(1, 'Timeline minimal satu fase.');

export const confirmationSchema = z.object({
  confirmDataAccuracy: z.boolean(),
  agreePublication: z.boolean(),
  acknowledgeVerification: z.boolean(),
  allowPromotion: z.boolean(),
});

export function feasibilityStudyRefinement(
  value: {
    technical: { isFeasibilityStudy: boolean };
    financial: { totalCapex?: number; totalOpex?: number; npv?: number; irr?: number };
  },
  context: z.RefinementCtx
) {
  if (!value.technical.isFeasibilityStudy) return;

  const checks: [keyof typeof value.financial, string][] = [
    ['totalCapex', 'Total CAPEX'],
    ['totalOpex', 'Total OPEX'],
    ['npv', 'NPV'],
    ['irr', 'IRR'],
  ];

  for (const [field, label] of checks) {
    if (value.financial[field] === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} wajib diisi jika dokumen feasibility study dicentang.`,
        path: ['financial', field],
      });
    }
  }
}
