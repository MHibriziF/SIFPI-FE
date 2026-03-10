'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { Select, TextInput, Textarea } from '@/shared/components/form-fields';
import { SECTOR_OPTIONS } from '@/shared/enums';
import { FileUploadField } from '@/features/project/components/file-upload-field';
import { SectionCard } from '@/features/project/components/section-card';
import type { ProjectFormValues } from '@/features/project/types/create-project-form';

export function StepGeneral() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionCard.Header title="Profil Dasar" />
        <SectionCard.Body className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Nama Proyek"
            required
            placeholder="Masukkan nama proyek"
            error={errors.general?.projectName?.message}
            {...register('general.projectName')}
          />
          <Controller
            control={control}
            name="general.sector"
            render={({ field }) => (
              <Select
                label="Sektor"
                required
                placeholder="Pilih sektor"
                options={SECTOR_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.general?.sector?.message}
              />
            )}
          />
          <TextInput
            label="Lokasi"
            required
            placeholder="Masukkan lokasi proyek"
            error={errors.general?.location?.message}
            {...register('general.location')}
          />
          <Textarea
            label="Deskripsi Singkat"
            required
            rows={4}
            hint="Maksimal 50 kata"
            placeholder="Ringkasan proyek"
            error={errors.general?.shortDescription?.message}
            {...register('general.shortDescription')}
          />
        </SectionCard.Body>
      </SectionCard>

      <SectionCard>
        <SectionCard.Header title="Narasi Bisnis" />
        <SectionCard.Body className="grid gap-4">
          <Textarea
            label="Value Proposition"
            required
            rows={4}
            placeholder="Jelaskan nilai tambah proyek"
            error={errors.general?.valueProposition?.message}
            {...register('general.valueProposition')}
          />
          <FileUploadField
            label="Peta Lokasi"
            required
            hint="Format yang disarankan: PNG/JPG"
            fileField="files.mapFile"
            accept=".png,.jpg,.jpeg"
          />
        </SectionCard.Body>
      </SectionCard>

      <SectionCard>
        <SectionCard.Header title="Kepemilikan" />
        <SectionCard.Body className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Institusi Pemilik"
            required
            placeholder="Masukkan institusi"
            error={errors.general?.ownerInstitution?.message}
            {...register('general.ownerInstitution')}
          />
          <TextInput
            label="Nama Contact Person"
            required
            placeholder="Masukkan nama"
            error={errors.general?.contactPerson?.message}
            {...register('general.contactPerson')}
          />
          <TextInput
            label="Email"
            required
            type="email"
            placeholder="nama@domain.com"
            error={errors.general?.email?.message}
            {...register('general.email')}
          />
          <TextInput
            label="Nomor Telepon"
            required
            placeholder="+62 ..."
            error={errors.general?.phone?.message}
            {...register('general.phone')}
          />
        </SectionCard.Body>
      </SectionCard>
    </div>
  );
}
