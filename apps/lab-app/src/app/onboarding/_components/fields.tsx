'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { FaCheck, FaChevronDown, FaFileUpload, FaTimes } from 'react-icons/fa';
import { ACCEPTED_FILE_TYPES } from '../_lib/constants';

export const inputClass = (error?: string) =>
  `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${
    error
      ? 'border-warning-500 focus:border-warning-500 focus:ring-warning-200'
      : 'border-gray-300 focus:border-primary-600 focus:ring-primary-200'
  }`;

interface FieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  /** Rendered on the right of the label row (e.g. a "same as" checkbox). */
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
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-warning-500">*</span>}
        {optional && <span className="text-xs font-normal text-gray-400">(optional)</span>}
      </label>
      {action}
    </div>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    {error && (
      <p data-field-error className="mt-1 text-xs font-medium text-warning-600">
        {error}
      </p>
    )}
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
  trailing,
  ...field
}: InputProps) => {
  const id = useId();
  return (
    <Field {...field} htmlFor={id}>
      <div className="relative">
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
          className={`${inputClass(field.error)} ${trailing ? 'pr-10' : ''}`}
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
};

export const SelectField = ({ value, onChange, options, placeholder = 'Select', disabled, ...field }: SelectProps) => {
  const id = useId();
  return (
    <Field {...field} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!field.error}
        className={inputClass(field.error)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
};

type MultiSelectProps = Omit<FieldProps, 'children' | 'htmlFor'> & {
  selected: string[];
  options: string[];
  onToggle: (option: string) => void;
  placeholder?: string;
  /** Option that stands for "everything"; shown as the summary when selected. */
  allOption?: string;
};

/** Dropdown whose options are checkboxes (checkbox before the label). */
export const MultiSelectField = ({
  selected,
  options,
  onToggle,
  placeholder = 'Select',
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

  const summary = !selected.length
    ? placeholder
    : allOption && selected.includes(allOption)
      ? 'All services'
      : selected.length <= 2
        ? selected.join(', ')
        : `${selected.length} selected`;

  return (
    <Field {...field} htmlFor={id}>
      <div ref={rootRef} className="relative">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`${inputClass(field.error)} flex items-center justify-between gap-2 text-left`}
        >
          <span className={`truncate ${selected.length ? 'text-gray-900' : 'text-gray-400'}`}>{summary}</span>
          <FaChevronDown className={`shrink-0 text-xs text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <ul
            role="listbox"
            aria-multiselectable
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {options.map((option) => {
              const checked = selected.includes(option);
              return (
                <li key={option} role="option" aria-selected={checked}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 px-3.5 py-2 text-sm hover:bg-primary-100/60 ${
                      option === allOption ? 'border-b border-gray-100 font-semibold text-primary-900' : 'text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(option)}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-primary-700"
                    />
                    {option}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
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
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-primary-700 disabled:cursor-not-allowed"
        />
        <label htmlFor={id} className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
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
  file: File | null;
  onChange: (file: File | null) => void;
};

export const FileField = ({ file, onChange, ...field }: FileProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();

  return (
    <Field {...field} htmlFor={id}>
      <input
        ref={ref}
        id={id}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="sr-only"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />
      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-100/50 px-3.5 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm text-primary-900">
            <FaCheck className="shrink-0 text-success-700" />
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 text-xs text-gray-500">{Math.max(1, Math.round(file.size / 1024))} KB</span>
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
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3.5 py-3 text-sm font-medium transition-colors ${
            field.error
              ? 'border-warning-500 text-warning-600 hover:bg-warning-50'
              : 'border-primary-300 text-primary-700 hover:bg-primary-100/60'
          }`}
        >
          <FaFileUpload className="shrink-0" />
          <span>
            Choose file{' '}
            <span className="font-normal opacity-80">(PDF, JPG or PNG, max 1 MB)</span>
          </span>
        </button>
      )}
    </Field>
  );
};

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection = ({ title, description, children }: SectionProps) => (
  <section className="space-y-4">
    <div className="border-b border-gray-200 pb-2">
      <h3 className="text-base font-semibold text-primary-900">{title}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
    {children}
  </section>
);

export const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">{children}</div>
);
