'use client';

import { useFormContext } from 'react-hook-form';

import { TextInput, Textarea } from '@/shared/components/form-fields';
import { FileUploadField } from '@/features/project/components/file-upload-field';
import { SectionCard } from '@/features/project/components/section-card';
import { TimelineEditor } from '@/features/project/components/timeline-editor';
import type { ProjectFormValues } from '@/features/project/types/create-project-form';

export function StepTechnical() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();

  return (
    <div className="space-y-5">
      <SectionCard>
        <SectionCard.Header title="Skema Legal" description="Model kerja sama dan masa konsesi proyek." />
        <SectionCard.Body className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Model Kerja Sama"
            required
            placeholder="Contoh: KPBU"
            error={errors.technical?.cooperationModel?.message}
            {...register('technical.cooperationModel')}
          />
          <TextInput
            label="Periode Konsesi (tahun)"
            required
            type="number"
            min={1}
            step={1}
            placeholder="Contoh: 25"
            error={errors.technical?.concessionPeriod?.message}
            {...register('technical.concessionPeriod', { valueAsNumber: true })}
          />
        </SectionCard.Body>
      </SectionCard>

      <SectionCard>
        <SectionCard.Header title="Status Teknis" description="Kesiapan teknis dan dukungan pemerintah." />
        <SectionCard.Body className="grid gap-4">
          <TextInput
            label="Kesiapan Aset"
            required
            placeholder="Contoh: Lahan clear and clean"
            error={errors.technical?.assetReadiness?.message}
            {...register('technical.assetReadiness')}
          />
          <FileUploadField
            label="Dokumen Struktur Proyek"
            required
            hint="Unggah gambar struktur proyek terbaru (PNG/JPG/JPEG/WebP)"
            fileField="files.projectStructureFile"
            accept=".png,.jpg,.jpeg,.webp"
          />
          <Textarea
            label="Dukungan Pemerintah"
            required
            rows={4}
            placeholder="Jelaskan dukungan regulasi/fiskal/non-fiskal"
            error={errors.technical?.governmentSupport?.message}
            {...register('technical.governmentSupport')}
          />
        </SectionCard.Body>
      </SectionCard>

      <SectionCard>
        <SectionCard.Header
          title="Model Bisnis & Lampiran"
          description="Skema pendapatan, lampiran dokumen, dan status feasibility study."
        />
        <SectionCard.Body className="grid gap-4">
          <Textarea
            label="Revenue Stream"
            required
            rows={3}
            placeholder="Jelaskan arus pendapatan proyek"
            error={errors.technical?.revenueStream?.message}
            {...register('technical.revenueStream')}
          />
          <FileUploadField
            label="Project Document"
            required
            hint="Dokumen ini akan dipakai sebagai lampiran utama proyek"
            fileField="files.feasibilityStudyFile"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />
          <label className="flex items-start gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('technical.isFeasibilityStudy')}
            />
            Apakah ini dokumen feasibility study?
          </label>
          <p className="text-xs text-gray-500">
            Jika dicentang, metrik Financials & Analytics pada langkah berikutnya menjadi wajib.
          </p>
        </SectionCard.Body>
      </SectionCard>

      <SectionCard>
        <SectionCard.Header title="Timeline" description="Tambahkan fase proyek secara berurutan." />
        <SectionCard.Body>
          <TimelineEditor />
        </SectionCard.Body>
      </SectionCard>
    </div>
  );
}
