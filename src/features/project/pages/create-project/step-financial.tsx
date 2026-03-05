'use client';

import { useFormContext } from 'react-hook-form';

import { TextInput, Textarea } from '@/shared/components/form-fields';
import { SectionCard } from '@/features/project/components/section-card';
import type { ProjectFormValues } from '@/features/project/types/create-project-form';

export function StepFinancial() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();
  const isFeasibilityStudy = watch('technical.isFeasibilityStudy');
  const numberAsOptional = (value: string) => (value === '' ? undefined : Number(value));

  return (
    <div className="space-y-5">
      <SectionCard>
        <SectionCard.Header title="Financials & Analytics" description="Komponen finansial utama proyek." />
        <SectionCard.Body className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Total CAPEX"
            required={isFeasibilityStudy}
            type="number"
            step="any"
            hint={
              isFeasibilityStudy
                ? 'Wajib diisi karena dokumen feasibility study dicentang.'
                : undefined
            }
            error={errors.financial?.totalCapex?.message}
            {...register('financial.totalCapex', { setValueAs: numberAsOptional })}
          />
          <TextInput
            label="Total OPEX"
            required={isFeasibilityStudy}
            type="number"
            step="any"
            hint={
              isFeasibilityStudy
                ? 'Wajib diisi karena dokumen feasibility study dicentang.'
                : undefined
            }
            error={errors.financial?.totalOpex?.message}
            {...register('financial.totalOpex', { setValueAs: numberAsOptional })}
          />
          <TextInput
            label="NPV"
            required={isFeasibilityStudy}
            type="number"
            step="any"
            hint={
              isFeasibilityStudy
                ? 'Wajib diisi karena dokumen feasibility study dicentang.'
                : undefined
            }
            error={errors.financial?.npv?.message}
            {...register('financial.npv', { setValueAs: numberAsOptional })}
          />
          <TextInput
            label="IRR"
            required={isFeasibilityStudy}
            type="number"
            step="any"
            hint={
              isFeasibilityStudy
                ? 'Wajib diisi karena dokumen feasibility study dicentang.'
                : undefined
            }
            error={errors.financial?.irr?.message}
            {...register('financial.irr', { setValueAs: numberAsOptional })}
          />
        </SectionCard.Body>
      </SectionCard>

      <SectionCard>
        <SectionCard.Header title="Additional Information" description="Informasi tambahan (opsional)." />
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
