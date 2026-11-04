'use client';

import { useId, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaFolderOpen, FaTimes } from 'react-icons/fa';
import { ACCEPTED_FILE_TYPES } from '@/app/onboarding/_lib/constants';
import { validateUploadFile } from '@/app/onboarding/_lib/form';

interface Props {
    label: string;
    value: File | null;
    onChange: (file: File | null) => void;
    required?: boolean;
    error?: string;
    // logo: PNG / JPEG only
    imageOnly?: boolean;
}

// Same look as the certificate upload in onboarding (dashed drop zone, "Uploaded" chip). The file is only
// held here and sent when the parent submits, because a replacement has to go through admin approval.
const CertificateDropzone = ({ label, value, onChange, required, error, imageOnly }: Props) => {
    const ref = useRef<HTMLInputElement>(null);
    const id = useId();
    const [dragging, setDragging] = useState(false);

    const handleFile = (file: File | null | undefined) => {
        if (!file) return;
        const invalid = imageOnly
            ? /\.(jpe?g|png)$/i.test(file.name)
                ? file.size > 1024 * 1024
                    ? `${label} must be smaller than 1 MB`
                    : null
                : `${label} must be a JPG or PNG image`
            : validateUploadFile(file, label);
        if (invalid) {
            toast.error(invalid, { autoClose: 5000 });
            return;
        }
        onChange(file);
    };

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block font-heading text-xs font-medium text-gray-700">
                {label}
                {required && <span className="text-warning-500"> *</span>}
            </label>
            <input
                ref={ref}
                id={id}
                type="file"
                accept={imageOnly ? '.jpg,.jpeg,.png' : ACCEPTED_FILE_TYPES}
                className="sr-only"
                onChange={e => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = '';
                }}
            />
            {value ? (
                <div className="flex items-center justify-between gap-3 rounded-md border border-secondary-200 bg-secondary-50 px-3 py-3">
                    <span className="flex min-w-0 items-center gap-2 text-[13px] text-secondary-900">
                        <FaCheck className="shrink-0 text-success-700" />
                        <span className="truncate">{value.name}</span>
                        <span className="shrink-0 text-xs text-gray-500">Ready to submit</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        aria-label={`Remove ${label}`}
                        className="shrink-0 rounded p-1 text-gray-500 hover:bg-white hover:text-warning-600"
                    >
                        <FaTimes />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => ref.current?.click()}
                    onDragOver={e => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => {
                        e.preventDefault();
                        setDragging(false);
                        handleFile(e.dataTransfer.files?.[0]);
                    }}
                    className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-3 py-6 text-center transition-colors ${
                        error
                            ? 'border-warning-500 bg-warning-50/40'
                            : dragging
                              ? 'border-secondary-700 bg-secondary-100'
                              : 'border-secondary-300 bg-secondary-50 hover:bg-secondary-100'
                    }`}
                >
                    <FaFolderOpen className="text-3xl text-danger-500" />
                    <span className="text-[11px] font-medium text-gray-700">Choose a file or drag &amp; drop it here</span>
                    <span className="text-[10px] text-gray-500">{imageOnly ? 'JPG or PNG' : 'PDF, JPG or PNG'} · Maximum file size 1 MB</span>
                </button>
            )}
            {error && <p className="mt-1 text-xs font-medium text-warning-600">{error}</p>}
        </div>
    );
};

export default CertificateDropzone;
