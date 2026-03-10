'use client';

import { useId } from 'react';
import { useFormContext } from 'react-hook-form';

import { FileInput } from '@/shared/components/form-fields';
import type { ProjectFormValues } from '@/features/project/types/create-project-form';

interface FileUploadFieldProps {
  label: string;
  hint?: string;
  accept?: string;
  required?: boolean;
  fileField: 'files.mapFile' | 'files.projectStructureFile' | 'files.feasibilityStudyFile';
}

export function FileUploadField({
  label,
  hint,
  accept,
  required,
  fileField,
}: FileUploadFieldProps) {
  const inputId = useId();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();

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
      <FileInput
        id={inputId}
        label={label}
        required={required}
        accept={accept}
        hint={hint}
        error={typeof fileError === 'string' ? fileError : undefined}
        className="file:bg-gray-200 file:text-primary hover:file:bg-gray-300"
        onChange={event => {
          const selectedFile = event.currentTarget.files?.[0] ?? null;
          handleFileChange(selectedFile);
        }}
      />
      {file?.name ? <p className="text-xs text-gray-500">File terpilih: {file.name}</p> : null}
    </div>
  );
}
