'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { SubmitProjectButton, Button } from '@/shared/components/button';
import { SummaryCard } from '@/features/project/components/summary-card';
import type { ProjectFormValues } from '@/features/project/types/create-project-form';

interface StepSummaryProps {
  onBack: () => void;
  onEditStep: (step: number) => void;
  onSaveDraft: () => void;
  submitting: boolean;
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

function SummaryItem({ label, value }: { label: string; value?: string | number | null }) {
  const displayValue =
    value === undefined || value === null || value === '' ? '-' : value;

  return (
    <div className="grid gap-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-primary">{displayValue}</p>
    </div>
  );
}

interface PreviewableFile {
  blob: Blob;
  name: string;
  type: string;
  key: string;
}

function extractFile(input: unknown): File | Blob | null {
  if (!input) return null;
  if (input instanceof File || input instanceof Blob) return input;
  if (input instanceof FileList) return input[0] ?? null;
  if (Array.isArray(input)) return extractFile(input[0]);

  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    return (
      extractFile(obj.file) ??
      extractFile(obj.originFileObj) ??
      extractFile(obj.blob) ??
      extractFile(obj[0])
    );
  }

  return null;
}

function normalizeFile(input: unknown): PreviewableFile | null {
  const file = extractFile(input);
  if (!file) return null;

  const name = file instanceof File ? file.name : 'file';
  const type = file.type ?? '';
  const size = file.size ?? 0;
  const lastModified = file instanceof File ? file.lastModified : 0;
  const key = `${name}:${size}:${type}:${lastModified}`;

  return { blob: file, name, type, key };
}

function FileSummaryItem({ label, file: rawFile }: { label: string; file: unknown }) {
  const file = useMemo(() => normalizeFile(rawFile), [rawFile]);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const isImage =
    !!file &&
    (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg|heic|heif)$/i.test(file.name));
  const isPdf = !!file && file.type === 'application/pdf';
  const isVideo = !!file && file.type.startsWith('video/');
  const isAudio = !!file && file.type.startsWith('audio/');
  const objectUrl = useMemo(
    () => (file && !isImage ? URL.createObjectURL(file.blob) : null),
    [file, isImage]
  );

  useEffect(() => {
    if (!file || !isImage) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file.blob);
  }, [file, isImage]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  if (!file) {
    return <SummaryItem label={label} value="-" />;
  }

  const downloadHref = isImage ? imageDataUrl : objectUrl;
  const resizablePreviewClass =
    'block h-44 w-full max-w-full min-h-32 resize overflow-auto rounded-md border border-gray-200 bg-white';
  const resizableFrameClass =
    'h-44 w-full max-w-full min-h-32 resize overflow-hidden rounded-md border border-gray-200 bg-white';
  const previewContentClass = 'h-full w-full';

  return (
    <div className="grid gap-2">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
        {isImage && imageDataUrl ? (
          <a href={imageDataUrl} target="_blank" rel="noreferrer" className={resizablePreviewClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt={file.name}
              className={`${previewContentClass} object-contain`}
            />
          </a>
        ) : isImage ? (
          <div className={`${resizablePreviewClass} flex items-center justify-center text-xs text-gray-500`}>
            Menyiapkan preview gambar...
          </div>
        ) : isPdf ? (
          <div className={resizableFrameClass}>
            <iframe
              src={objectUrl ?? undefined}
              title={file.name}
              className={`${previewContentClass} border-0`}
            />
          </div>
        ) : isVideo ? (
          <div className={resizableFrameClass}>
            <video
              src={objectUrl ?? undefined}
              controls
              className={`${previewContentClass} bg-black/90`}
            />
          </div>
        ) : isAudio ? (
          <audio src={objectUrl ?? undefined} controls className="w-full" />
        ) : (
          <div className={resizableFrameClass}>
            <object
              data={objectUrl ?? undefined}
              className={`${previewContentClass} border-0`}
              aria-label={`Preview ${file.name}`}
            >
              <div className="flex h-full items-center justify-center px-3 text-xs text-gray-500">
                Preview tidak tersedia untuk tipe ini di browser. Gunakan download.
              </div>
            </object>
          </div>
        )}
      </div>
      {downloadHref ? (
        <a
          href={downloadHref}
          download={file.name}
          className="w-fit text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {file.name}
        </a>
      ) : (
        <p className="text-xs text-gray-500">File sedang diproses untuk preview/download.</p>
      )}
    </div>
  );
}

export function StepSummary({ onBack, onEditStep, onSaveDraft, submitting }: StepSummaryProps) {
  const { watch, register } = useFormContext<ProjectFormValues>();

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
          <FileSummaryItem label="Map File" file={values.files.mapFile} />
        </SummaryCard.Body>
      </SummaryCard>

      <SummaryCard>
        <SummaryCard.Header title="Project Structure" onEdit={() => onEditStep(2)} />
        <SummaryCard.Body className="grid gap-4 md:grid-cols-2">
          <SummaryItem label="Cooperation Model" value={values.technical.cooperationModel} />
          <SummaryItem label="Concession Period" value={values.technical.concessionPeriod} />
          <SummaryItem label="Asset Readiness" value={values.technical.assetReadiness} />
          <FileSummaryItem label="Structure File" file={values.files.projectStructureFile} />
          <SummaryItem label="Revenue Stream" value={values.technical.revenueStream} />
          <SummaryItem
            label="Is Feasibility Study"
            value={values.technical.isFeasibilityStudy ? 'Ya' : 'Tidak'}
          />
          <FileSummaryItem label="Project File" file={values.files.feasibilityStudyFile} />
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
          <p className="text-sm text-primary">{values.financial.additionalInfo || '-'}</p>
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
            Saya menyatakan bahwa seluruh informasi yang dimasukkan dalam formulir ini adalah
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
            Saya menyetujui bahwa informasi naratif dan visual proyek yang saya berikan akan
            ditampilkan secara publik pada Katalog Proyek IPFO setelah disetujui.
          </label>
          <label className="flex items-start gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('confirmation.acknowledgeVerification')}
            />
            Saya memahami bahwa proses verifikasi oleh Admin memiliki target waktu rata-rata 14
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
            Saya memberikan izin kepada IPFO untuk mempublikasikan data proyek ini ke kanal berita
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
            {submitting ? 'Menyimpan...' : 'Save as Draft'}
          </Button>
          <SubmitProjectButton type="submit" disabled={!allConfirmed || submitting}>
            {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          </SubmitProjectButton>
        </div>
      </div>
    </div>
  );
}
