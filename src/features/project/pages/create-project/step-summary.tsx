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

function SummaryItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-primary">{value || '-'}</p>
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

  return (
    <div className="grid gap-2">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
        {isImage && imageDataUrl ? (
          <a href={imageDataUrl} target="_blank" rel="noreferrer" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt={file.name}
              className="h-28 w-56 rounded-md border border-gray-200 object-cover"
            />
          </a>
        ) : isImage ? (
          <div className="flex h-28 w-56 items-center justify-center rounded-md border border-gray-200 bg-white text-xs text-gray-500">
            Menyiapkan preview gambar...
          </div>
        ) : isPdf ? (
          <iframe
            src={objectUrl ?? undefined}
            title={file.name}
            className="h-32 w-full rounded-md border border-gray-200 bg-white"
          />
        ) : isVideo ? (
          <video
            src={objectUrl ?? undefined}
            controls
            className="h-32 w-full rounded-md border border-gray-200 bg-black/90"
          />
        ) : isAudio ? (
          <audio src={objectUrl ?? undefined} controls className="w-full" />
        ) : (
          <object
            data={objectUrl ?? undefined}
            className="h-32 w-full rounded-md border border-gray-200 bg-white"
            aria-label={`Preview ${file.name}`}
          >
            <div className="flex h-full items-center justify-center px-3 text-xs text-gray-500">
              Preview tidak tersedia untuk tipe ini di browser. Gunakan download.
            </div>
          </object>
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
          <SummaryItem label="Total CAPEX" value={values.financial.totalCapex} />
          <SummaryItem label="Total OPEX" value={values.financial.totalOpex} />
          <SummaryItem label="NPV" value={values.financial.npv} />
          <SummaryItem label="IRR" value={values.financial.irr} />
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
              className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary"
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
              className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register('confirmation.agreePublication')}
            />
            Saya menyetujui bahwa informasi naratif dan visual proyek yang saya berikan akan
            ditampilkan secara publik pada Katalog Proyek IPFO setelah disetujui.
          </label>
          <label className="flex items-start gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary"
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
              className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary"
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
