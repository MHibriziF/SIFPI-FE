'use client';

import { useFormContext } from 'react-hook-form';

import { SubmitProjectButton, Button } from '@/shared/components/button';
import { SummaryCard } from '@/features/project/components/summary-card';
import type { EditProjectFormValues } from '@/features/project/types/edit-project-form';

interface EditStepSummaryProps {
  onBack: () => void;
  onEditStep: (step: number) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  submitting: boolean;
  /** Whether the project was rejected and can be resubmitted */
  isResubmit: boolean;
  existingMapFileUrl?: string | null;
  existingStructureFileUrl?: string | null;
  existingProjectFileUrl?: string | null;
}

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatCurrencyValue(value?: number | null) {
  if (value === undefined || value === null) return '-';
  return moneyFormatter.format(value);
}

function formatPercentValue(value?: number | null) {
  if (value === undefined || value === null) return '-';
  return `${numberFormatter.format(value)}%`;
}

function SummaryItem({ label, value }: Readonly<{ label: string; value?: string | number | null }>) {
  const displayValue =
    value === undefined || value === null || value === '' ? '-' : value;

  return (
    <div className="grid gap-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-primary">{displayValue}</p>
    </div>
  );
}

function FileSummaryItem({
  label,
  newFile,
  existingUrl,
  existingLabel,
}: Readonly<{
  label: string;
  newFile?: File | null;
  existingUrl?: string | null;
  existingLabel?: string;
}>) {
  if (newFile) {
    return (
      <div className="grid gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm text-primary">
          📄 File baru: <span className="font-medium">{newFile.name}</span>
        </p>
      </div>
    );
  }

  if (existingUrl) {
    return (
      <div className="grid gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <a
          href={existingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {existingLabel ?? 'Lihat file saat ini'}
        </a>
      </div>
    );
  }

  return <SummaryItem label={label} value="-" />;
}

export function EditStepSummary({
  onBack,
  onEditStep,
  onSaveDraft,
  onSubmit,
  submitting,
  isResubmit,
  existingMapFileUrl,
  existingStructureFileUrl,
  existingProjectFileUrl,
}: Readonly<EditStepSummaryProps>) {
  const { watch, register } = useFormContext<EditProjectFormValues>();
  const values = watch();

  const allConfirmed =
    values.confirmation.confirmDataAccuracy &&
    values.confirmation.agreePublication &&
    values.confirmation.acknowledgeVerification &&
    values.confirmation.allowPromotion;

  return (
    <div className="space-y-5">
      <SummaryCard>
        <SummaryCard.Header title="Strategic Narrative" onEdit={() => onEditStep(1)} />
        <SummaryCard.Body>
          <p className="text-sm text-primary">{values.general.valueProposition || '-'}</p>
        </SummaryCard.Body>
      </SummaryCard>

      <SummaryCard>
        <SummaryCard.Header title="Project Information" onEdit={() => onEditStep(1)} />
        <SummaryCard.Body className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Project Name" value={values.general.projectName} />
          <SummaryItem label="Sector" value={values.general.sector} />
          <SummaryItem label="Location" value={values.general.location} />
          <SummaryItem label="Short Description" value={values.general.shortDescription} />
          <FileSummaryItem
            label="Map File"
            newFile={values.files.mapFile}
            existingUrl={existingMapFileUrl}
            existingLabel="Peta lokasi (tidak diubah)"
          />
        </SummaryCard.Body>
      </SummaryCard>

      <SummaryCard>
        <SummaryCard.Header title="Project Structure" onEdit={() => onEditStep(2)} />
        <SummaryCard.Body className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Cooperation Model" value={values.technical.cooperationModel} />
          <SummaryItem label="Concession Period" value={values.technical.concessionPeriod} />
          <SummaryItem label="Asset Readiness" value={values.technical.assetReadiness} />
          <FileSummaryItem
            label="Structure File"
            newFile={values.files.projectStructureFile}
            existingUrl={existingStructureFileUrl}
            existingLabel="Struktur proyek (tidak diubah)"
          />
          <SummaryItem label="Revenue Stream" value={values.technical.revenueStream} />
          <SummaryItem
            label="Is Feasibility Study"
            value={values.technical.isFeasibilityStudy ? 'Ya' : 'Tidak'}
          />
          <FileSummaryItem
            label="Project File"
            newFile={values.files.feasibilityStudyFile}
            existingUrl={existingProjectFileUrl}
            existingLabel="Dokumen proyek (tidak diubah)"
          />
        </SummaryCard.Body>
      </SummaryCard>

      <SummaryCard>
        <SummaryCard.Header title="Government Support" onEdit={() => onEditStep(2)} />
        <SummaryCard.Body>
          <p className="text-sm text-primary">{values.technical.governmentSupport || '-'}</p>
        </SummaryCard.Body>
      </SummaryCard>

      <SummaryCard>
        <SummaryCard.Header title="Project Owner" onEdit={() => onEditStep(1)} />
        <SummaryCard.Body className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Owner Institution" value={values.general.ownerInstitution} />
          <SummaryItem label="Contact Person" value={values.general.contactPerson} />
          <SummaryItem label="Email" value={values.general.email} />
          <SummaryItem label="Phone" value={values.general.phone} />
        </SummaryCard.Body>
      </SummaryCard>

      <SummaryCard>
        <SummaryCard.Header title="Financials" onEdit={() => onEditStep(3)} />
        <SummaryCard.Body className="grid gap-4 md:grid-cols-2">
          <p className="md:col-span-2 text-xs text-gray-500">
            Keterangan: Total CAPEX, Total OPEX, dan NPV ditampilkan dalam million USD. IRR
            ditampilkan dalam persen (%).
          </p>
          <SummaryItem
            label="Total CAPEX (million USD)"
            value={formatCurrencyValue(values.financial.totalCapex)}
          />
          <SummaryItem
            label="Total OPEX (million USD)"
            value={formatCurrencyValue(values.financial.totalOpex)}
          />
          <SummaryItem label="NPV (million USD)" value={formatCurrencyValue(values.financial.npv)} />
          <SummaryItem label="IRR (%)" value={formatPercentValue(values.financial.irr)} />
        </SummaryCard.Body>
      </SummaryCard>

      <SummaryCard>
        <SummaryCard.Header title="Additional Information" onEdit={() => onEditStep(3)} />
        <SummaryCard.Body>
          <p className="text-sm text-primary">{values.financial.additionalInfo ?? '-'}</p>
        </SummaryCard.Body>
      </SummaryCard>

      <SummaryCard>
        <SummaryCard.Header title="Timeline" onEdit={() => onEditStep(2)} />
        <SummaryCard.Body>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {values.timelines.map((timeline, index) => (
              <article
                key={`${timeline.timeRange}-${index}`}
                className="min-w-56 rounded-lg border border-primary/10 bg-primary/4 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {timeline.timeRange || '-'}
                </p>
                <p className="mt-2 text-sm text-primary">{timeline.phaseDescription || '-'}</p>
              </article>
            ))}
          </div>
        </SummaryCard.Body>
      </SummaryCard>

      <SummaryCard>
        <SummaryCard.Header title="Konfirmasi" />
        <SummaryCard.Body className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('confirmation.confirmDataAccuracy')}
            />
            {' '}Saya menyatakan bahwa seluruh informasi yang dimasukkan dalam formulir ini adalah
            benar, akurat, dan sesuai dengan dokumen perencanaan terbaru. Saya memahami bahwa
            ketidaksesuaian data dapat menyebabkan penundaan atau penolakan pada proses verifikasi
            oleh Admin IPFO.
          </label>
          <label className="flex items-start gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('confirmation.agreePublication')}
            />
            {' '}Saya menyetujui bahwa informasi naratif dan visual proyek yang saya berikan akan
            ditampilkan secara publik pada Katalog Proyek IPFO setelah disetujui.
          </label>
          <label className="flex items-start gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('confirmation.acknowledgeVerification')}
            />
            {' '}Saya memahami bahwa proses verifikasi oleh Admin memiliki target waktu rata-rata 14
            hari kerja sejak dokumen dinyatakan lengkap. Saya bersedia untuk segera melakukan
            revisi data jika mendapatkan catatan atau masukan dari Admin selama proses review
            berlangsung.
          </label>
          <label className="flex items-start gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('confirmation.allowPromotion')}
            />
            {' '}Saya memberikan izin kepada IPFO untuk mempublikasikan data proyek ini ke kanal berita
            dan newsletter resmi guna menarik minat investor.
          </label>
        </SummaryCard.Body>
      </SummaryCard>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outlined" onClick={onBack} disabled={submitting}>
          Kembali
        </Button>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outlined" onClick={onSaveDraft} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          {isResubmit && (
            <SubmitProjectButton
              type="button"
              disabled={!allConfirmed || submitting}
              onClick={onSubmit}
            >
              {submitting ? 'Mengirim...' : 'Submit Ulang'}
            </SubmitProjectButton>
          )}
        </div>
      </div>
    </div>
  );
}
