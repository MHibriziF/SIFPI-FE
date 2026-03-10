'use client';

import { useId } from 'react';
import { useFormContext } from 'react-hook-form';

import { FileInput } from '@/shared/components/form-fields';
import type { EditProjectFormValues } from '@/features/project/types/edit-project-form';

interface EditFileUploadFieldProps {
  label: string;
  hint?: string;
  accept?: string;
  required?: boolean;
  fileField: 'files.mapFile' | 'files.projectStructureFile' | 'files.feasibilityStudyFile';
  /** URL of the currently uploaded file (from server) */
  existingFileUrl?: string | null;
  /** Label shown for the existing file link */
  existingFileLabel?: string;
}

export function EditFileUploadField({
  label,
  hint,
  accept,
  required,
  fileField,
  existingFileUrl,
  existingFileLabel = 'Lihat file saat ini',
}: EditFileUploadFieldProps) {
  const inputId = useId();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<EditProjectFormValues>();

  const file = watch(fileField);

  const fileError =
    fileField === 'files.mapFile'
      ? errors.files?.mapFile?.message
      : fileField === 'files.projectStructureFile'
        ? errors.files?.projectStructureFile?.message
        : errors.files?.feasibilityStudyFile?.message;

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setValue(fileField, selectedFile, {
      shouldDirty: true,
      shouldValidate: true,
    });
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
        required={required && !existingFileUrl}
        accept={accept}
        hint={existingFileUrl ? `${hint ?? ''} (Kosongkan jika tidak ingin mengganti file)`.trim() : hint}
        error={typeof fileError === 'string' ? fileError : undefined}
        onChange={event => {
          const selectedFile = event.currentTarget.files?.[0] ?? null;
          handleFileChange(selectedFile);
        }}
      />
      {file?.name ? <p className="text-xs text-gray-500">File baru terpilih: {file.name}</p> : null}
    </div>
  );
}
