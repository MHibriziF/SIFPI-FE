'use client';

import { useFormContext } from 'react-hook-form';

import { TextInput, Textarea } from '@/shared/components/form-fields';
import { SectionCard } from '@/features/project/components/section-card';

interface StepFinancialProps {
  /** When true, shows descriptions on section headers (edit mode) */
  showDescriptions?: boolean;
}

export function StepFinancial({ showDescriptions }: Readonly<StepFinancialProps> = {}) {
  const { register, watch, formState } = useFormContext<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = formState.errors as any;
  const isFeasibilityStudy = watch('technical.isFeasibilityStudy');
  const numberAsOptional = (value: string) => (value === '' ? undefined : Number(value));

  return (
    <div className="space-y-5">
      <SectionCard>
        <SectionCard.Header
          title="Financials & Analytics"
          description={showDescriptions ? 'Komponen finansial utama proyek.' : undefined}
        />
        <SectionCard.Body className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Total CAPEX (million USD)"
            required={isFeasibilityStudy}
            type="number"
            step="any"
            placeholder="Contoh: 125.5"
            hint={isFeasibilityStudy ? 'Wajib diisi karena dokumen feasibility study dicentang.' : undefined}
            error={errors.financial?.totalCapex?.message}
            {...register('financial.totalCapex', { setValueAs: numberAsOptional })}
          />
          <TextInput
            label="Total OPEX (million USD)"
            required={isFeasibilityStudy}
            type="number"
            step="any"
            placeholder="Contoh: 18.75"
            hint={isFeasibilityStudy ? 'Wajib diisi karena dokumen feasibility study dicentang.' : undefined}
            error={errors.financial?.totalOpex?.message}
            {...register('financial.totalOpex', { setValueAs: numberAsOptional })}
          />
          <TextInput
            label="NPV (million USD)"
            required={isFeasibilityStudy}
            type="number"
            step="any"
            placeholder="Contoh: 42.3"
            hint={isFeasibilityStudy ? 'Wajib diisi karena dokumen feasibility study dicentang.' : undefined}
            error={errors.financial?.npv?.message}
            {...register('financial.npv', { setValueAs: numberAsOptional })}
          />
          <TextInput
            label="IRR (%)"
            required={isFeasibilityStudy}
            type="number"
            step="any"
            max={100}
            placeholder="Contoh: 14.2"
            hint={isFeasibilityStudy ? 'Wajib diisi karena dokumen feasibility study dicentang.' : undefined}
            error={errors.financial?.irr?.message}
            {...register('financial.irr', { setValueAs: numberAsOptional })}
          />
        </SectionCard.Body>
      </SectionCard>

      <SectionCard>
        <SectionCard.Header
          title="Additional Information"
          description={showDescriptions ? 'Informasi tambahan (opsional).' : undefined}
        />
        <SectionCard.Body>
          <Textarea
            label="Catatan Tambahan"
            rows={4}
            placeholder="Tambahkan informasi lain yang relevan"
            error={errors.financial?.additionalInfo?.message}
            {...register('financial.additionalInfo')}
          />
        </SectionCard.Body>
      </SectionCard>
    </div>
  );
}
