'use client';

import { useId } from 'react';
import { useFormContext } from 'react-hook-form';

import { FileInput } from '@/shared/components/form-fields';

interface FileUploadFieldProps {
  label: string;
  hint?: string;
  accept?: string;
  required?: boolean;
  fileField: 'files.mapFile' | 'files.projectStructureFile' | 'files.feasibilityStudyFile';
  /** URL of the currently uploaded file (from server). When provided, enables edit-mode behaviour. */
  existingFileUrl?: string | null;
  /** Label shown for the existing file link */
  existingFileLabel?: string;
}

export function FileUploadField({
  label,
  hint,
  accept,
  required,
  fileField,
  existingFileUrl,
  existingFileLabel = 'Lihat file saat ini',
}: Readonly<FileUploadFieldProps>) {
  const inputId = useId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { setValue, watch, formState: { errors } } = useFormContext<any>();

  const file = watch(fileField);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filesErrors = (errors as any).files;
  const fileError = (() => {
    if (fileField === 'files.mapFile') return filesErrors?.mapFile?.message;
    if (fileField === 'files.projectStructureFile') return filesErrors?.projectStructureFile?.message;
    return filesErrors?.feasibilityStudyFile?.message;
  })();

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setValue(fileField, selectedFile, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-2">
      {existingFileUrl && !file && (
        <div className="flex items-center gap-2 rounded-md border border-primary/15 bg-primary/5 px-3 py-2">
          <span className="text-xs text-gray-600">File saat ini:</span>
          <a
            href={existingFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {existingFileLabel}
          </a>
        </div>
      )}
      <FileInput
        id={inputId}
        label={label}
        required={existingFileUrl ? required && !existingFileUrl : required}
        accept={accept}
        hint={existingFileUrl ? `${hint ?? ''} (Kosongkan jika tidak ingin mengganti file)`.trim() : hint}
        error={typeof fileError === 'string' ? fileError : undefined}
        className={existingFileUrl ? undefined : 'file:bg-gray-200 file:text-primary hover:file:bg-gray-300'}
        onChange={event => {
          const selectedFile = event.currentTarget.files?.[0] ?? null;
          handleFileChange(selectedFile);
        }}
      />
      {file?.name ? (
        <p className="text-xs text-gray-500">
          {existingFileUrl ? 'File baru terpilih' : 'File terpilih'}: {file.name}
        </p>
      ) : null}
    </div>
  );
}
