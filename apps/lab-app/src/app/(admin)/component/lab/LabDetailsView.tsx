'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaRegEdit } from 'react-icons/fa';
import { getProfile, submitCertificateRequest, updateLabDetails } from '@/../services/profileService';
import { CertificateRequestStatus, LabDetails, ProfileLabSection } from '@/types/profile';
import Loader from '../common/Loader';
import CertificateDropzone from '../../dashboard/profile/CertificateDropzone';
import { asText, inputClass } from '../../dashboard/profile/profileFields';
import { MultiSelectField } from '@/app/onboarding/_components/fields';
import { ALL_SERVICES, COUNTRIES, LAB_SERVICES, LAB_TYPES, STATES } from '@/app/onboarding/_lib/constants';
import {
    maxLen,
    text,
    validateEmail,
    // validateGstin,
    validatePan,
    validatePhone,
    validatePin,
} from '@/app/onboarding/_lib/form';

// Only what the lab onboarding asks for is shown and edited here (no director / government id / license etc.).
const CERTIFICATES: { type: string; label: string }[] = [
    { type: 'establishmentRegistrationCertificate', label: 'Establishment Registration Certificate' },
    { type: 'gstinCertificate', label: 'GSTIN Certificate' },
    { type: 'biomedicalWasteAuthorizationCertificate', label: 'Biomedical Waste Authorization Certificate' },
    { type: 'nablAccreditationCertificate', label: 'NABL Accreditation Certificate' },
];
const ESTABLISHMENT = 'establishmentRegistrationCertificate';
const WASTE_CERT = 'biomedicalWasteAuthorizationCertificate';
const GSTIN_CERT = 'gstinCertificate';
const NABL_CERT = 'nablAccreditationCertificate';

const ADDRESS_KEYS = ['address', 'labAddressLine2', 'labCountry', 'state', 'labDistrict', 'city', 'labZip'];

// Changing one of these values makes the matching certificate mandatory (it goes to the admin for approval).
const CERT_TRIGGERS: Record<string, string> = {
    ...Object.fromEntries(ADDRESS_KEYS.map(k => [k, GSTIN_CERT])),
    establishmentRegistrationNumber: ESTABLISHMENT,
    issuingAuthority: ESTABLISHMENT,
    issuingDate: ESTABLISHMENT,
    expiryDate: ESTABLISHMENT,
    labAccreditation: NABL_CERT,
    biomedicalWasteAuthorizationNumber: WASTE_CERT,
};

const CERT_REASONS: Record<string, string> = {
    [GSTIN_CERT]: 'You changed the address, so the GSTIN certificate must be uploaded.',
    [ESTABLISHMENT]: 'You changed the establishment registration details, so the certificate must be uploaded.',
    [NABL_CERT]: 'You changed the NABL accreditation number, so the certificate must be uploaded.',
    [WASTE_CERT]: 'You changed the biomedical waste authorization number, so the certificate must be uploaded.',
};

const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '');

interface FieldDef {
    key: string;
    label: string;
    required?: boolean;
    locked?: boolean; // shown but cannot be changed
    options?: string[];
    maxLength?: number;
    digits?: number; // digits only, up to this length
    // returns an error message for a changed, non-empty value
    check?: (value: string, all: Record<string, string>) => string | null;
}

const digitsOnly = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);

// Same fields, mandatory/optional split and validation as the laboratory steps of the onboarding.
const LAB_FIELDS: FieldDef[] = [
    { key: 'name', label: 'Laboratory Name', required: true, locked: true, maxLength: 100 },
    { key: 'labType', label: 'Laboratory Type', required: true, locked: true, options: LAB_TYPES },
    { key: 'labPhone', label: 'Laboratory Contact Number', required: true, digits: 10, check: v => validatePhone(v, 'Laboratory contact number') },
    { key: 'labEmail', label: 'Laboratory Email', required: true, maxLength: 100, check: v => validateEmail(v, 'Laboratory email') },
    { key: 'address', label: 'Address Line 1', required: true, maxLength: 100, check: v => text(v, 'Address line 1', 100) },
    { key: 'labAddressLine2', label: 'Address Line 2', maxLength: 100, check: v => maxLen(v, 'Address line 2', 100) },
    { key: 'labCountry', label: 'Country', required: true, options: COUNTRIES },
    { key: 'state', label: 'State / Union Territory', required: true, options: STATES },
    { key: 'labDistrict', label: 'District', required: true, maxLength: 50, check: v => text(v, 'District', 50) },
    { key: 'city', label: 'City / Town', required: true, maxLength: 50, check: v => text(v, 'City / Town', 50) },
    { key: 'labZip', label: 'PIN Code', required: true, digits: 6, check: v => validatePin(v) },
];

const COMPLIANCE_FIELDS: FieldDef[] = [
    { key: 'establishmentRegistrationNumber', label: 'Establishment Registration No.', required: true, maxLength: 50, check: v => text(v, 'Registration number', 50) },
    { key: 'issuingAuthority', label: 'Issuing Authority (Establishment Registration No.)', required: true, maxLength: 25, check: v => text(v, 'Issuing authority', 25) },
    { key: 'labPan', label: 'PAN', maxLength: 10, check: v => validatePan(v) },
    { key: 'labGstin', label: 'GSTIN', required: true, locked: true, maxLength: 15 },
    { key: 'labAccreditation', label: 'NABL Accreditation Number', required: true, maxLength: 25, check: v => text(v, 'NABL accreditation number', 25) },
];

const ALL_FIELDS = [...LAB_FIELDS, ...COMPLIANCE_FIELDS];
const UPPER_KEYS = ['labPan', 'labGstin'];

const STATUS_STYLES: Record<CertificateRequestStatus, string> = {
    PENDING: 'bg-danger-100 text-danger-800',
    APPROVED: 'bg-success-50 text-success-900',
    REJECTED: 'bg-warning-100 text-warning-700',
};

const disabledClass = 'bg-pneutral-50 text-pneutral-500 cursor-not-allowed border-pneutral-100';

const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const show = (value?: string | number | boolean | null) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
};

const Field = ({ label, value }: { label: string; value?: string | number | boolean | null }) => (
    <div className="flex flex-col gap-1">
        <span className="font-heading text-label-l2 text-pneutral-500">{label}</span>
        <span className="text-p3 text-pneutral-900 wrap-break-word">{show(value)}</span>
    </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">{children}</div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-heading text-label-l4 text-pneutral-900 pb-2 mb-4 border-b border-pneutral-100">{children}</h3>
);

const Badge = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <span className={`px-3 py-1 rounded-full font-heading text-label-l2 ${className}`}>{children}</span>
);

const Input = ({
    def,
    value,
    error,
    disabled,
    onChange,
}: {
    def: FieldDef;
    value: string;
    error?: string;
    disabled?: boolean;
    onChange: (v: string) => void;
}) => {
    // A saved value that is not in the dropdown list must still show up
    const options = def.options && value && !def.options.includes(value) ? [value, ...def.options] : def.options;
    const cls = `${inputClass} ${disabled ? disabledClass : ''} ${error ? 'border-warning-500' : ''}`;
    return (
        <label className="flex flex-col gap-1">
            <span className="font-heading text-label-l2 text-pneutral-700">
                {def.label}
                {def.required ? (
                    <span className="text-warning-500"> *</span>
                ) : (
                    <span className="text-pneutral-400 font-regular"> (Optional)</span>
                )}
            </span>
            {options ? (
                <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className={cls}>
                    <option value="">Select</option>
                    {options.map(o => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            ) : (
                <input
                    value={value}
                    disabled={disabled}
                    maxLength={def.digits ?? def.maxLength}
                    inputMode={def.digits ? 'numeric' : undefined}
                    onChange={e => onChange(e.target.value)}
                    className={cls}
                />
            )}
            {error && <span data-field-error className="text-p2 font-medium text-warning-600">{error}</span>}
        </label>
    );
};

// Certificate row in the same style as the GSTIN certificate on the profile: label and bordered View side by side
const CertificateRow = ({
    label,
    url,
    pending,
    rejectedReason,
}: {
    label: string;
    url?: string | null;
    pending: boolean;
    rejectedReason?: string | null;
}) => (
    <div className="inline-flex flex-wrap items-center gap-4 p-3 rounded-md bg-secondary-50 w-fit max-w-full">
        <div className="flex flex-col gap-1">
            <span className="text-p3 text-pneutral-900">{label}</span>
            {pending ? (
                <Badge className={STATUS_STYLES.PENDING}>Pending approval</Badge>
            ) : rejectedReason !== undefined ? (
                <span className="text-p2 text-warning-600">
                    Last request rejected{rejectedReason ? `: ${rejectedReason}` : ''}
                </span>
            ) : (
                <span className="text-p2 text-pneutral-500">{url ? 'Uploaded' : 'Not uploaded'}</span>
            )}
        </div>
        {url && (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1 rounded-full border border-secondary-600 font-heading text-label-l2 text-secondary-700 transition-colors hover:bg-secondary-100"
            >
                View
            </a>
        )}
    </div>
);

interface Props {
    labId: number;
    // lets the list refresh its rows after an edit
    onChanged?: () => void;
}

// One lab in the same layout as the Super Admin profile: one card, one Edit button that turns the whole
// card into edit mode for this lab only.
const LabDetailsView = ({ labId, onChanged }: Props) => {
    const [lab, setLab] = useState<ProfileLabSection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [services, setServices] = useState<string[]>([]);
    const [wasteGenerated, setWasteGenerated] = useState<boolean | null>(null);
    const [certFiles, setCertFiles] = useState<Record<string, File | null>>({});
    const [issuingDate, setIssuingDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const today = new Date().toISOString().slice(0, 10);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProfile(labId);
            setLab(data.labs[0] ?? null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [labId]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading && !lab) return <Loader />;

    if (error || !lab) {
        return (
            <div className="flex items-center justify-between rounded-lg bg-base-white p-4">
                <p className="text-p3 text-warning-600">{error || 'Lab details not available.'}</p>
                <button onClick={load} className="px-4 h-10 rounded-full bg-secondary-600 text-pneutral-50 font-heading text-p3">
                    Retry
                </button>
            </div>
        );
    }

    const d = lab.details?.lab;
    const documents = lab.documents ?? {};
    const requests = lab.certificateRequests ?? [];
    const pendingTypes = new Set(requests.filter(r => r.status === 'PENDING').map(r => r.documentType));
    const logoUrl = documents.labLogo;
    const detail = (key: string) => asText((d as Record<string, unknown> | null | undefined)?.[key]);

    // Onboarding asks Yes / No for biomedical waste; the authorization number only matters for Yes
    const wasteOn = wasteGenerated === true;

    const currentValue = (key: string) =>
        key === 'issuingDate' ? toDateInput(d?.issuingDate)
        : key === 'expiryDate' ? toDateInput(d?.expiryDate)
        : detail(key).trim();
    const editedValue = (key: string) =>
        key === 'issuingDate' ? issuingDate
        : key === 'expiryDate' ? expiryDate
        : (form[key] ?? '').trim();
    const isChanged = (key: string) => isEditing && editedValue(key) !== currentValue(key);

    // Certificates that must be uploaded because a value they prove was changed
    const requiredCerts = new Set<string>();
    for (const [key, cert] of Object.entries(CERT_TRIGGERS)) {
        if (cert === WASTE_CERT && !wasteOn) continue;
        if (isChanged(key)) requiredCerts.add(cert);
    }
    // A replacement waiting for approval locks the values it proves until the admin reviews it
    const isLocked = (key: string) => !!CERT_TRIGGERS[key] && pendingTypes.has(CERT_TRIGGERS[key]);

    const toggleService = (service: string) => {
        if (service === ALL_SERVICES) {
            setServices(services.includes(ALL_SERVICES) ? [] : [ALL_SERVICES, ...LAB_SERVICES]);
            return;
        }
        const next = services.includes(service)
            ? services.filter(s => s !== service && s !== ALL_SERVICES)
            : [...services.filter(s => s !== ALL_SERVICES), service];
        setServices(LAB_SERVICES.every(s => next.includes(s)) ? [ALL_SERVICES, ...LAB_SERVICES] : next);
        setErrors(p => ({ ...p, labServices: '' }));
    };

    const startEdit = () => {
        setForm({
            ...Object.fromEntries(ALL_FIELDS.map(f => [f.key, detail(f.key)])),
            biomedicalWasteAuthorizationNumber: detail('biomedicalWasteAuthorizationNumber'),
        });
        setServices(d?.labServices ?? []);
        setWasteGenerated(d?.biomedicalWasteGenerated ?? null);
        setCertFiles({});
        setIssuingDate(toDateInput(d?.issuingDate));
        setExpiryDate(toDateInput(d?.expiryDate));
        setErrors({});
        setIsEditing(true);
    };

    const cancelEdit = () => setIsEditing(false);

    const setValue = (def: FieldDef, raw: string) => {
        let v = raw;
        if (def.digits) v = digitsOnly(v, def.digits);
        if (UPPER_KEYS.includes(def.key)) v = v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setForm(p => ({ ...p, [def.key]: v }));
        setErrors(p => ({ ...p, [def.key]: '' }));
    };

    // One Save: lab details are saved immediately, each new certificate is submitted for admin approval.
    // Same rules as onboarding. Format is checked for changed values; a mandatory value that exists cannot be emptied.
    const handleSave = async () => {
        const nextErrors: Record<string, string> = {};
        const payload: Record<string, unknown> = {};

        for (const f of ALL_FIELDS) {
            if (f.locked || isLocked(f.key)) continue;
            const next = (form[f.key] ?? '').trim();
            const current = detail(f.key).trim();
            if (f.required && !next && current) {
                nextErrors[f.key] = `${f.label} cannot be left empty`;
                continue;
            }
            if (next === current) continue;
            const err = next ? f.check?.(next, form) ?? null : null;
            if (err) nextErrors[f.key] = err;
            else payload[f.key] = next; // "" clears an optional value
        }

        const currentServices = d?.labServices ?? [];
        if (services.length === 0) {
            nextErrors.labServices = 'Select at least one laboratory service';
        } else if (services.length !== currentServices.length || services.some(s => !currentServices.includes(s))) {
            payload.labServices = services;
        }

        if (wasteGenerated === null) nextErrors.biomedicalWasteGenerated = 'Select Yes or No';
        else if (wasteGenerated !== !!d?.biomedicalWasteGenerated) payload.biomedicalWasteGenerated = wasteGenerated;
        const wasteNumber = (form.biomedicalWasteAuthorizationNumber ?? '').trim();
        if (wasteOn) {
            const err = text(wasteNumber, 'Authorization number', 25);
            if (err) nextErrors.biomedicalWasteAuthorizationNumber = err;
        }
        if (wasteNumber !== detail('biomedicalWasteAuthorizationNumber').trim() && !nextErrors.biomedicalWasteAuthorizationNumber) {
            payload.biomedicalWasteAuthorizationNumber = wasteNumber;
        }

        const certs = Object.entries(certFiles).filter(([, f]) => f) as [string, File][];

        // Dates are the establishment certificate's validity, so they are saved together with it
        if (!isLocked('issuingDate')) {
            if (!issuingDate && currentValue('issuingDate')) nextErrors.issuingDate = 'Issuing date cannot be left empty';
            else if (issuingDate > today) nextErrors.issuingDate = 'Issuing date cannot be in the future';
            if (!expiryDate && currentValue('expiryDate')) nextErrors.expiryDate = 'Expiry date cannot be left empty';
            else if (issuingDate && expiryDate && expiryDate <= issuingDate) nextErrors.expiryDate = 'Expiry date must be after the issuing date';
            else if (expiryDate && expiryDate < today && isChanged('expiryDate')) nextErrors.expiryDate = 'Expiry date cannot be in the past';
        }

        for (const type of Array.from(requiredCerts)) {
            if (!certFiles[type]) {
                const label = CERTIFICATES.find(c => c.type === type)?.label ?? 'Certificate';
                nextErrors[`cert.${type}`] = `Upload the ${label} to save these changes`;
            }
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            toast.error('Please correct the highlighted fields');
            setTimeout(() => document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
            return;
        }

        const hasDetails = Object.keys(payload).length > 0;
        if (!hasDetails && certs.length === 0) {
            setIsEditing(false);
            return;
        }

        setSaving(true);
        let failed = false;
        try {
            if (hasDetails) await updateLabDetails(lab.labId, { lab: payload as LabDetails });
            for (const [type, file] of certs) {
                await submitCertificateRequest(lab.labId, {
                    type,
                    file,
                    issuingDate: type === ESTABLISHMENT ? issuingDate || undefined : undefined,
                    expiryDate: type === ESTABLISHMENT ? expiryDate || undefined : undefined,                });
            }
            toast.success(certs.length ? 'Saved. New certificates will take effect once the admin approves them.' : 'Lab updated successfully');
        } catch (err) {
            failed = true;
            toast.error((err as Error).message);
        } finally {
            setSaving(false);
        }
        // Reload either way: earlier parts may have been saved even if a later one failed
        await load();
        onChanged?.();
        if (!failed) setIsEditing(false);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <section className="bg-base-white rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt={`${lab.labName} logo`} className="h-16 w-16 shrink-0 rounded-lg border border-pneutral-100 object-contain bg-base-white" />
                ) : (
                    <div className="h-16 w-16 shrink-0 rounded-full bg-secondary-600 text-pneutral-50 font-heading text-h5 flex items-center justify-center">
                        {lab.labName?.slice(0, 2).toUpperCase() || 'LB'}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h2 className="font-heading text-h5 text-pneutral-900">{lab.labName}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {d?.labType && <span className="text-p2 text-pneutral-500">{d.labType}</span>}
                        <Badge className={lab.isActive ? 'bg-success-50 text-success-900' : 'bg-pneutral-100 text-pneutral-700'}>
                            {lab.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {lab.approvalStatus && <Badge className="bg-info-50 text-info-700">{lab.approvalStatus}</Badge>}
                    </div>
                </div>
            </section>

            {pendingTypes.size > 0 && (
                <div className="bg-danger-50 text-danger-800 rounded-lg px-4 py-3 text-p3">
                    {pendingTypes.size} certificate request{pendingTypes.size > 1 ? 's are' : ' is'} waiting for admin
                    approval. The current certificate stays active until it is approved, then the new one shows here.
                </div>
            )}

            {/* Everything on one card, one Edit button */}
            <section className="bg-base-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading text-h6 text-pneutral-900">Lab Details</h2>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={cancelEdit}
                                disabled={saving}
                                className="px-4 h-10 rounded-full bg-secondary-100 text-secondary-800 font-heading text-p3 disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 h-10 rounded-full bg-secondary-600 text-pneutral-50 font-heading text-p3 hover:bg-secondary-700 disabled:opacity-60"
                            >
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={startEdit}
                            className="flex items-center gap-2 px-4 h-10 rounded-full bg-secondary-600 text-pneutral-50 font-heading text-p3 transition-all duration-200 hover:bg-secondary-700"
                        >
                            <FaRegEdit /> Edit
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <>
                        <SectionTitle>Laboratory Information</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {LAB_FIELDS.map(f => (
                                <Input
                                    key={f.key}
                                    def={f}
                                    value={form[f.key] ?? ''}
                                    error={errors[f.key]}
                                    disabled={f.locked || isLocked(f.key)}
                                    onChange={v => setValue(f, v)}
                                />
                            ))}
                            <div className="sm:col-span-2 lg:col-span-3">
                                <MultiSelectField
                                    label="Laboratory Services"
                                    required
                                    selected={services}
                                    options={[ALL_SERVICES, ...LAB_SERVICES]}
                                    allOption={ALL_SERVICES}
                                    placeholder="Select laboratory services"
                                    error={errors.labServices}
                                    onToggle={toggleService}
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <SectionTitle>Compliance Details</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {COMPLIANCE_FIELDS.map(f => (
                                    <Input
                                        key={f.key}
                                        def={f}
                                        value={form[f.key] ?? ''}
                                        error={errors[f.key]}
                                        disabled={f.locked || isLocked(f.key)}
                                        onChange={v => setValue(f, v)}
                                    />
                                ))}
                                <label className="flex flex-col gap-1">
                                    <span className="font-heading text-label-l2 text-pneutral-700">
                                        Biomedical Waste Generated <span className="text-warning-500">*</span>
                                    </span>
                                    <select
                                        value={wasteGenerated === null ? '' : wasteGenerated ? 'YES' : 'NO'}
                                        onChange={e => {
                                            setWasteGenerated(e.target.value === '' ? null : e.target.value === 'YES');
                                            setErrors(p => ({ ...p, biomedicalWasteGenerated: '' }));
                                        }}
                                        className={`${inputClass} ${errors.biomedicalWasteGenerated ? 'border-warning-500' : ''}`}
                                    >
                                        <option value="">Select</option>
                                        <option value="YES">Yes</option>
                                        <option value="NO">No</option>
                                    </select>
                                    {errors.biomedicalWasteGenerated && (
                                        <span data-field-error className="text-p2 font-medium text-warning-600">{errors.biomedicalWasteGenerated}</span>
                                    )}
                                </label>
                                {wasteOn && (
                                    <Input
                                        def={{ key: 'biomedicalWasteAuthorizationNumber', label: 'Biomedical Waste Authorization Number', required: true, maxLength: 25 }}
                                        value={form.biomedicalWasteAuthorizationNumber ?? ''}
                                        error={errors.biomedicalWasteAuthorizationNumber}
                                        disabled={isLocked('biomedicalWasteAuthorizationNumber')}
                                        onChange={v => {
                                            setForm(p => ({ ...p, biomedicalWasteAuthorizationNumber: v }));
                                            setErrors(p => ({ ...p, biomedicalWasteAuthorizationNumber: '' }));
                                        }}
                                    />
                                )}
                                <label className="flex flex-col gap-1">
                                    <span className="font-heading text-label-l2 text-pneutral-700">
                                        Issuing Date (Establishment Registration No.) <span className="text-warning-500">*</span>
                                    </span>
                                    <input
                                        type="date"
                                        max={today}
                                        value={issuingDate}
                                        disabled={isLocked('issuingDate')}
                                        onChange={e => {
                                            setIssuingDate(e.target.value);
                                            setErrors(p => ({ ...p, issuingDate: '' }));
                                        }}
                                        className={`${inputClass} ${isLocked('issuingDate') ? disabledClass : ''} ${errors.issuingDate ? 'border-warning-500' : ''}`}
                                    />
                                    {errors.issuingDate && <span data-field-error className="text-p2 font-medium text-warning-600">{errors.issuingDate}</span>}
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="font-heading text-label-l2 text-pneutral-700">
                                        Expiry Date (Establishment Registration No.) <span className="text-warning-500">*</span>
                                    </span>
                                    <input
                                        type="date"
                                        min={issuingDate || undefined}
                                        value={expiryDate}
                                        disabled={isLocked('expiryDate')}
                                        onChange={e => {
                                            setExpiryDate(e.target.value);
                                            setErrors(p => ({ ...p, expiryDate: '' }));
                                        }}
                                        className={`${inputClass} ${isLocked('expiryDate') ? disabledClass : ''} ${errors.expiryDate ? 'border-warning-500' : ''}`}
                                    />
                                    {errors.expiryDate && <span data-field-error className="text-p2 font-medium text-warning-600">{errors.expiryDate}</span>}
                                </label>
                            </div>
                        </div>

                        <div className="mt-8">
                            <SectionTitle>Certificates</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CERTIFICATES.filter(c => c.type !== WASTE_CERT || wasteOn).map(({ type, label }) => {
                                    if (pendingTypes.has(type)) {
                                        return (
                                            <div key={type} className="rounded-md bg-secondary-50 p-3">
                                                <p className="text-p3 text-pneutral-900">{label}</p>
                                                <p className="text-p2 text-pneutral-500 mt-1">A replacement is already waiting for admin approval.</p>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={type} className="flex flex-col gap-3">
                                            <CertificateDropzone
                                                label={documents[type] ? `Replace ${label}` : `Upload ${label}`}
                                                required={requiredCerts.has(type)}
                                                error={errors[`cert.${type}`]}
                                                value={certFiles[type] ?? null}
                                                onChange={file => {
                                                    setCertFiles(p => ({ ...p, [type]: file }));
                                                    setErrors(p => ({ ...p, [`cert.${type}`]: '' }));
                                                }}
                                            />
                                            {requiredCerts.has(type) && !certFiles[type] && (
                                                <p className="text-p2 text-warning-600">
                                                    {CERT_REASONS[type]} It goes to the admin for approval and the current one stays active until then.
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <SectionTitle>Laboratory Information</SectionTitle>
                        <Grid>
                            <Field label="Laboratory Type" value={d?.labType} />
                            <Field label="Laboratory Services" value={d?.labServices?.join(', ')} />
                            <Field label="Contact Number" value={d?.labPhone} />
                            <Field label="Email" value={d?.labEmail} />
                            <Field
                                label="Address"
                                value={[d?.address, d?.labAddressLine2, d?.labDistrict, d?.city, d?.state, d?.labZip, d?.labCountry]
                                    .filter(Boolean)
                                    .join(', ')}
                            />
                        </Grid>

                        <div className="mt-8">
                            <SectionTitle>Compliance Details</SectionTitle>
                            <Grid>
                                <Field label="Establishment Registration No." value={d?.establishmentRegistrationNumber} />
                                <Field label="Issuing Authority (Establishment Registration No.)" value={d?.issuingAuthority} />
                                <Field label="Issuing Date (Establishment Registration No.)" value={formatDate(d?.issuingDate)} />
                                <Field label="Expiry Date (Establishment Registration No.)" value={formatDate(d?.expiryDate)} />
                                <Field label="PAN" value={d?.labPan} />
                                <Field label="GSTIN" value={d?.labGstin} />
                                <Field label="NABL Accreditation Number" value={d?.labAccreditation} />
                                <Field label="Biomedical Waste Generated" value={d?.biomedicalWasteGenerated} />
                                {d?.biomedicalWasteGenerated && (
                                    <Field label="Biomedical Waste Authorization Number" value={d?.biomedicalWasteAuthorizationNumber} />
                                )}
                            </Grid>
                        </div>

                        <div className="mt-8">
                            <SectionTitle>Certificates</SectionTitle>
                            <div className="flex flex-col gap-3">
                                {CERTIFICATES.filter(c => c.type !== WASTE_CERT || d?.biomedicalWasteGenerated || documents[c.type]).map(({ type, label }) => {
                                    const latest = requests.find(r => r.documentType === type);
                                    return (
                                        <CertificateRow
                                            key={type}
                                            label={label}
                                            url={documents[type]}
                                            pending={pendingTypes.has(type)}
                                            rejectedReason={latest?.status === 'REJECTED' ? latest.rejectionReason ?? '' : undefined}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default LabDetailsView;
