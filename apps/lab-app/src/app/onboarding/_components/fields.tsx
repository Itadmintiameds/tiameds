'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaFolderOpen, FaSort, FaSpinner, FaTimes } from 'react-icons/fa';
import { uploadOnboardingDocument } from '@/../services/onboardingService';
import { OnboardingDocumentType, UploadedDocument } from '@/types/onboarding/onboarding';
import { ACCEPTED_FILE_TYPES } from '../_lib/constants';
import { validateUploadFile } from '../_lib/form';

export const inputClass = (error?: string, hasIcon = false) =>
  `h-10 w-full rounded-md border bg-white text-[13px] text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${
    hasIcon ? 'pl-9 pr-3' : 'px-3'
  } ${
    error
      ? 'border-warning-500 focus:border-warning-500 focus:ring-warning-200'
      : 'border-gray-300 focus:border-secondary-700 focus:ring-secondary-200'
  }`;

/** Leading icon rendered inside an input / select. */
const LeadingIcon = ({ icon }: { icon: React.ReactNode }) => (
  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">{icon}</span>
);

interface FieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  /** Rendered below the control (e.g. a "same as" checkbox). */
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const Field = ({
  label,
  required,
  optional,
  error,
  hint,
  htmlFor,
  className = '',
  action,
  children,
}: FieldProps) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 font-heading text-[13px] font-medium text-gray-800">
      {label}
      {required && <span className="text-warning-500">*</span>}
      {optional && <span className="text-xs font-normal text-gray-500">(Optional)</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>}
    {error && (
      <p data-field-error className="mt-1 text-xs font-medium text-warning-600">
        {error}
      </p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

type InputProps = Omit<FieldProps, 'children' | 'htmlFor'> & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  min?: string;
  max?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
};

export const TextField = ({
  value,
  onChange,
  type = 'text',
  placeholder,
  maxLength,
  disabled,
  inputMode,
  autoComplete,
  min,
  max,
  icon,
  trailing,
  ...field
}: InputProps) => {
  const id = useId();
  return (
    <Field {...field} htmlFor={id}>
      <div className="relative">
        {icon && <LeadingIcon icon={icon} />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          inputMode={inputMode}
          autoComplete={autoComplete}
          min={min}
          max={max}
          aria-invalid={!!field.error}
          className={`${inputClass(field.error, !!icon)} ${trailing ? 'pr-10' : ''}`}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{trailing}</div>}
      </div>
    </Field>
  );
};

type SelectProps = Omit<FieldProps, 'children' | 'htmlFor'> & {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export const SelectField = ({
  value,
  onChange,
  options,
  placeholder = 'Select',
  disabled,
  icon,
  ...field
}: SelectProps) => {
  const id = useId();
  return (
    <Field {...field} htmlFor={id}>
      <div className="relative">
        {icon && <LeadingIcon icon={icon} />}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={!!field.error}
          className={`${inputClass(field.error, !!icon)} appearance-none pr-8 ${value ? '' : 'text-gray-400'}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option} className="text-gray-900">
              {option}
            </option>
          ))}
        </select>
        <FaSort className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500" />
      </div>
    </Field>
  );
};

type MultiSelectProps = Omit<FieldProps, 'children' | 'htmlFor'> & {
  selected: string[];
  options: string[];
  onToggle: (option: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  /** Option that stands for "everything"; it is not shown as a chip. */
  allOption?: string;
};

/** Dropdown whose options are checkboxes; chosen values are listed as removable chips below. */
export const MultiSelectField = ({
  selected,
  options,
  onToggle,
  placeholder = 'Select',
  icon,
  allOption,
  ...field
}: MultiSelectProps) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const chips = selected.filter((option) => option !== allOption);

  return (
    <Field {...field} htmlFor={id}>
      <div ref={rootRef} className="relative">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`${inputClass(field.error, !!icon)} flex items-center justify-between gap-2 text-left`}
        >
          {icon && <LeadingIcon icon={icon} />}
          <span className="truncate text-gray-400">{placeholder}</span>
          <FaSort className="shrink-0 text-xs text-gray-500" />
        </button>
        {open && (
          <ul
            role="listbox"
            aria-multiselectable
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          >
            {options.map((option) => {
              const checked = selected.includes(option);
              return (
                <li key={option} role="option" aria-selected={checked}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-[13px] hover:bg-secondary-50 ${
                      option === allOption ? 'border-b border-gray-100 font-semibold text-secondary-900' : 'text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(option)}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-secondary-700"
                    />
                    {option}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li
              key={chip}
              className="inline-flex items-center gap-1.5 rounded bg-pneutral-300 px-2.5 py-1 text-xs font-medium text-pneutral-900"
            >
              {chip}
              <button
                type="button"
                onClick={() => onToggle(chip)}
                aria-label={`Remove ${chip}`}
                className="text-pneutral-800 hover:text-warning-600"
              >
                <FaTimes className="text-[10px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
};

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const CheckboxField = ({ checked, onChange, disabled, error, children }: CheckboxProps) => {
  const id = useId();
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-secondary-700 disabled:cursor-not-allowed"
        />
        <label htmlFor={id} className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {children}
        </label>
      </div>
      {error && (
        <p data-field-error className="mt-1 text-xs font-medium text-warning-600">
          {error}
        </p>
      )}
    </div>
  );
};

type FileProps = Omit<FieldProps, 'children' | 'htmlFor'> & {
  /** Backend part name the file is uploaded under. */
  docType: OnboardingDocumentType;
  value: UploadedDocument | null;
  onChange: (doc: UploadedDocument | null) => void;
};

/**
 * Dashed drop zone; click to browse or drag a file onto it. The file is uploaded as soon as it is
 * chosen and only the returned link is kept in the form.
 */
export const FileField = ({ docType, value, onChange, ...field }: FileProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | null | undefined) => {
    if (!file || uploading) return;
    const invalid = validateUploadFile(file, field.label);
    if (invalid) {
      toast.error(invalid, { autoClose: 5000 });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadOnboardingDocument(docType, file);
      onChange({ name: file.name, url });
      toast.success(`${field.label} uploaded successfully`, { autoClose: 3000 });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload document.', { autoClose: 5000 });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Field {...field} htmlFor={id}>
      <input
        ref={ref}
        id={id}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {uploading ? (
        <div className="flex items-center justify-center gap-2 rounded-md border border-secondary-200 bg-secondary-50 px-3 py-6 text-[11px] font-medium text-gray-700">
          <FaSpinner className="animate-spin text-secondary-700" /> Uploading...
        </div>
      ) : value ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-secondary-200 bg-secondary-50 px-3 py-3">
          <span className="flex min-w-0 items-center gap-2 text-[13px] text-secondary-900">
            <FaCheck className="shrink-0 text-success-700" />
            <span className="truncate">{value.name}</span>
            <span className="shrink-0 text-xs text-gray-500">Uploaded</span>
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${field.label}`}
            className="shrink-0 rounded p-1 text-gray-500 hover:bg-white hover:text-warning-600"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-3 py-6 text-center transition-colors ${
            field.error
              ? 'border-warning-500 bg-warning-50/40'
              : dragging
                ? 'border-secondary-700 bg-secondary-100'
                : 'border-secondary-300 bg-secondary-50 hover:bg-secondary-100'
          }`}
        >
          <FaFolderOpen className="text-3xl text-danger-500" />
          <span className="text-[11px] font-medium text-gray-700">Choose a file or drag &amp; drop it here</span>
          <span className="text-[10px] text-gray-500">Maximum file size 1 MB</span>
        </button>
      )}
    </Field>
  );
};

export const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">{children}</div>
);
