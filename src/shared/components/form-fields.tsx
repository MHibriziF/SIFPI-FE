'use client';

import * as React from 'react';
import { Select as RadixSelect, Label } from 'radix-ui';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import PhoneInputPrimitive, { getCountryCallingCode, type Country } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import { cn } from '@/shared/lib/utils';

// ---------------------------------------------------------------------------
// Internal: field wrapper — renders label, children, hint / error
// ---------------------------------------------------------------------------
interface FormFieldProps {
  label?: string;
  hint?: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, hint, required, error, htmlFor, children, className }: Readonly<FormFieldProps>) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label.Root
          htmlFor={htmlFor}
          className="text-sm font-medium text-primary leading-none select-none"
        >
          {label}
          {required && (
            <span className="text-danger ml-1" aria-hidden="true">
              *
            </span>
          )}
        </Label.Root>
      )}

      {children}

      {error && <p className="text-xs text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared input base classes
// ---------------------------------------------------------------------------
function inputBase(hasError?: boolean) {
  return cn(
    'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-primary',
    'placeholder:text-gray-400 placeholder:font-normal',
    'outline-none transition-colors duration-150',
    'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
    hasError
      ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/15'
      : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/15'
  );
}

// ---------------------------------------------------------------------------
// TextInput
// ---------------------------------------------------------------------------
interface TextInputProps extends React.ComponentProps<'input'> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

function TextInput({
  label,
  hint,
  error,
  required,
  id,
  className,
  wrapperClassName,
  ...props
}: Readonly<TextInputProps>) {
  return (
    <FormField
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={wrapperClassName}
    >
      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        className={cn(inputBase(!!error), className)}
        {...props}
      />
    </FormField>
  );
}

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------
interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

function Textarea({
  label,
  hint,
  error,
  required,
  id,
  className,
  wrapperClassName,
  ...props
}: Readonly<TextareaProps>) {
  return (
    <FormField
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={wrapperClassName}
    >
      <textarea
        id={id}
        required={required}
        aria-invalid={!!error}
        className={cn(inputBase(!!error), 'min-h-28 resize-y', className)}
        {...props}
      />
    </FormField>
  );
}

// ---------------------------------------------------------------------------
// FileInput
// ---------------------------------------------------------------------------
interface FileInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

function FileInput({
  label,
  hint,
  error,
  required,
  id,
  className,
  wrapperClassName,
  ...props
}: Readonly<FileInputProps>) {
  return (
    <FormField
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={wrapperClassName}
    >
      <input
        type="file"
        id={id}
        required={required}
        aria-invalid={!!error}
        className={cn(
          inputBase(!!error),
          'cursor-pointer',
          // Style the browser's native "Choose File" button
          'file:mr-3 file:px-3 file:py-1',
          'file:rounded-md file:border-0',
          'file:text-xs file:font-medium file:cursor-pointer',
          'file:bg-primary file:text-white',
          'file:transition-colors file:duration-150',
          'hover:file:bg-primary/85',
          className
        )}
        {...props}
      />
    </FormField>
  );
}

// ---------------------------------------------------------------------------
// SelectDropdown — shared Radix dropdown shell (portal + content + scroll)
// ---------------------------------------------------------------------------
function SelectDropdown({ children, contentClassName }: Readonly<{ children: React.ReactNode; contentClassName?: string }>) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position="popper"
        sideOffset={4}
        className={cn(
          'z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          contentClassName,
        )}
      >
        <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-gray-400">
          <ChevronUp className="size-4" />
        </RadixSelect.ScrollUpButton>
        <RadixSelect.Viewport className="max-h-[min(var(--radix-select-content-available-height),256px)] overflow-y-auto p-1">
          {children}
        </RadixSelect.Viewport>
        <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-gray-400">
          <ChevronDown className="size-4" />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

const selectItemClass = cn(
  'relative flex items-center gap-2 rounded-md px-3 py-2 pr-8',
  'text-sm text-primary cursor-pointer select-none',
  'outline-none transition-colors duration-100',
  'data-highlighted:bg-primary/8',
  'data-[state=checked]:font-medium',
);

// ---------------------------------------------------------------------------
// Select (Dropdown)
// ---------------------------------------------------------------------------
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
}

function Select({
  label,
  hint,
  error,
  required,
  id,
  placeholder = 'Pilih salah satu',
  options,
  value,
  onValueChange,
  disabled,
  className,
  wrapperClassName,
}: Readonly<SelectProps>) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} htmlFor={id} className={wrapperClassName}>
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={id}
          aria-invalid={!!error}
          className={cn(
            inputBase(!!error),
            'group flex items-center justify-between gap-2 text-left',
            'data-placeholder:text-gray-400',
            'data-[disabled:bg-gray-50 data-disabled:text-gray-400 data-disabled:cursor-not-allowed',
            className
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon asChild>
            <ChevronDown className="size-4 shrink-0 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <SelectDropdown contentClassName="w-(--radix-select-trigger-width)">
          {options.map(option => (
            <RadixSelect.Item
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn(selectItemClass, 'data-disabled:text-gray-400 data-disabled:cursor-not-allowed data-disabled:pointer-events-none')}
            >
              <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              <RadixSelect.ItemIndicator className="absolute right-2.5">
                <Check className="size-3.5 text-primary" />
              </RadixSelect.ItemIndicator>
            </RadixSelect.Item>
          ))}
        </SelectDropdown>
      </RadixSelect.Root>
    </FormField>
  );
}

// ---------------------------------------------------------------------------
// PhoneInput
// ---------------------------------------------------------------------------

function Flag({ country }: { country: Country }) {
  const FlagIcon = flags[country];
  return FlagIcon ? (
    <span className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0 inline-flex">
      <FlagIcon title={country} />
    </span>
  ) : null;
}

interface PhoneCountrySelectProps {
  value?: Country;
  onChange: (value?: Country) => void;
  options: Array<{ value?: Country; label: string; divider?: boolean }>;
  disabled?: boolean;
}

function PhoneCountrySelect({ value, onChange, options, disabled }: Readonly<PhoneCountrySelectProps>) {
  const countries = options.filter((o): o is { value: Country; label: string } => !!o.value);

  return (
    <RadixSelect.Root value={value} onValueChange={v => onChange(v as Country)} disabled={disabled}>
      <RadixSelect.Trigger
        className={cn(
          'flex items-center gap-1.5 px-2.5 self-stretch shrink-0',
          'border-r border-gray-300 bg-transparent outline-none cursor-pointer',
          'hover:bg-gray-50 transition-colors duration-150',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        {value ? (
          <>
            <Flag country={value} />
            <span className="text-sm text-primary">+{getCountryCallingCode(value)}</span>
          </>
        ) : (
          <span className="text-gray-400 text-sm">+?</span>
        )}
        <ChevronDown className="size-3 text-gray-400 shrink-0" />
      </RadixSelect.Trigger>

      <SelectDropdown contentClassName="w-72">
        {countries.map(option => (
          <RadixSelect.Item key={option.value} value={option.value} className={cn(selectItemClass, 'pr-14')}>
            <Flag country={option.value} />
            <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
            <span className="absolute right-8 text-xs text-gray-400">+{getCountryCallingCode(option.value)}</span>
            <RadixSelect.ItemIndicator className="absolute right-2">
              <Check className="size-3.5 text-primary" />
            </RadixSelect.ItemIndicator>
          </RadixSelect.Item>
        ))}
      </SelectDropdown>
    </RadixSelect.Root>
  );
}

const PhoneNumberInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function PhoneNumberInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-primary',
          'placeholder:text-gray-400 placeholder:font-normal',
          'outline-none',
          'disabled:text-gray-400 disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      />
    );
  }
);
PhoneNumberInput.displayName = 'PhoneNumberInput';

interface PhoneInputProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  wrapperClassName?: string;
}

function PhoneInput({
  label,
  hint,
  error,
  required,
  id,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = 'Nomor telepon',
  wrapperClassName,
}: Readonly<PhoneInputProps>) {
  return (
    <FormField
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={wrapperClassName}
    >
      <PhoneInputPrimitive
        id={id}
        defaultCountry="ID"
        className={cn(
          'flex rounded-lg border bg-white overflow-hidden',
          'transition-colors duration-150',
          disabled && 'bg-gray-50',
          error
            ? 'border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/15'
            : 'border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'
        )}
        countrySelectComponent={PhoneCountrySelect}
        inputComponent={PhoneNumberInput}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={v => onChange?.(v ?? '')}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={!!error}
      />
    </FormField>
  );
}

export { TextInput, Textarea, FileInput, Select, PhoneInput };
