'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaRegEdit, FaUserAlt } from 'react-icons/fa';
import useUserStore from '@/context/userStore';
import { getProfile, submitCertificateRequest, updateLabDetails, updateMyDetails } from '@/../services/profileService';
import {
    CertificateRequestStatus,
    OrganizationDetails,
    ProfileData,
    ProfileUpdatePayload,
} from '@/types/profile';
import Loader from '../../component/common/Loader';
import CertificateDropzone from './CertificateDropzone';
import { ORG_FIELDS, asText, inputClass } from './profileFields';
import { COUNTRIES, STATES } from '@/app/onboarding/_lib/constants';
import { maxLen, text, validateEmail, validatePhone, validatePin } from '@/app/onboarding/_lib/form';

const ORG_GSTIN_CERT = 'organizationGstinCertificate';

type PersonalField = keyof ProfileUpdatePayload;

// Super Admin: only phone and the address block can be edited; the rest is shown disabled.
const PERSONAL_FIELDS: { key: PersonalField; label: string; editable?: boolean }[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'phone', label: 'Phone', editable: true },
    { key: 'address', label: 'Address', editable: true },
    { key: 'city', label: 'City', editable: true },
    { key: 'state', label: 'State', editable: true },
    { key: 'zip', label: 'Zip', editable: true },
    { key: 'country', label: 'Country', editable: true },
];

// Organization: email, phone and the address block are editable; name, type, PAN and GSTIN are not.
// Email and phone save straight away; changing any address field requires a new GSTIN certificate.
const ORG_CONTACT_KEYS = ['email', 'phone'];
const ORG_ADDRESS_KEYS = ['addressLine1', 'addressLine2', 'country', 'state', 'district', 'city', 'pinCode'];
const ORG_EDITABLE_KEYS = [...ORG_CONTACT_KEYS, ...ORG_ADDRESS_KEYS];
// Mandatory as in onboarding; everything else (address line 2, PAN) is optional.
const ORG_MANDATORY_KEYS = ['name', 'type', 'email', 'phone', 'addressLine1', 'country', 'state', 'district', 'city', 'pinCode', 'gstin'];

const STATUS_STYLES: Record<CertificateRequestStatus, string> = {
    PENDING: 'bg-danger-100 text-danger-800',
    APPROVED: 'bg-success-50 text-success-900',
    REJECTED: 'bg-warning-100 text-warning-700',
};

const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const show = (value?: string | number | boolean | null) =>
    value === null || value === undefined || value === '' ? '—' : String(value);

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
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

const digitsOnly = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);

type FieldRule = {
    options?: string[];
    maxLength?: number;
    inputMode?: 'numeric';
    sanitize?: (v: string) => string;
};

const PERSONAL_RULES: Partial<Record<PersonalField, FieldRule>> = {
    phone: { maxLength: 10, inputMode: 'numeric', sanitize: v => digitsOnly(v, 10) },
    address: { maxLength: 255 },
    city: { maxLength: 50 },
    state: { options: STATES },
    zip: { maxLength: 6, inputMode: 'numeric', sanitize: v => digitsOnly(v, 6) },
    country: { options: COUNTRIES },
};

const ORG_RULES: Record<string, FieldRule> = {
    email: { maxLength: 100, sanitize: v => v.toLowerCase().trim() },
    phone: { maxLength: 10, inputMode: 'numeric', sanitize: v => digitsOnly(v, 10) },
    addressLine1: { maxLength: 100 },
    addressLine2: { maxLength: 100 },
    country: { options: COUNTRIES },
    state: { options: STATES },
    district: { maxLength: 50 },
    city: { maxLength: 50 },
    pinCode: { maxLength: 6, inputMode: 'numeric', sanitize: v => digitsOnly(v, 6) },
};

// A saved value that is not in the dropdown list must still show up
const withCurrent = (options: string[] | undefined, value: string) =>
    options && value && !options.includes(value) ? [value, ...options] : options;

const disabledClass = 'bg-pneutral-50 text-pneutral-500 cursor-not-allowed border-pneutral-100';

const InputField = ({
    label,
    value,
    onChange,
    required,
    optional,
    options,
    disabled,
    error,
    maxLength,
    inputMode,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
    optional?: boolean;
    options?: string[];
    disabled?: boolean;
    error?: string;
    maxLength?: number;
    inputMode?: 'numeric';
}) => (
    <label className="flex flex-col gap-1">
        <span className="font-heading text-label-l2 text-pneutral-700">
            {label}
            {required && <span className="text-warning-500"> *</span>}
            {optional && <span className="text-pneutral-400 font-regular"> (Optional)</span>}
        </span>
        {options ? (
            <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className={`${inputClass} ${disabled ? disabledClass : ''} ${error ? 'border-warning-500' : ''}`}>
                <option value="">Select</option>
                {options.map(o => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        ) : (
            <input
                value={value}
                disabled={disabled}
                maxLength={maxLength}
                inputMode={inputMode}
                onChange={e => onChange(e.target.value)}
                className={`${inputClass} ${disabled ? disabledClass : ''} ${error ? 'border-warning-500' : ''}`}
            />
        )}
        {error && (
            <span data-field-error className="text-p2 font-medium text-warning-600">
                {error}
            </span>
        )}
    </label>
);

const ProfilePage = () => {
    const { updateUser } = useUserStore();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [personal, setPersonal] = useState<Record<PersonalField, string>>({
        firstName: '', lastName: '', phone: '', address: '', city: '', state: '', zip: '', country: '',
    });
    const [org, setOrg] = useState<Record<string, string>>({});
    const [certFile, setCertFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setProfile(await getProfile());
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // Certificate requests are approved by the platform admin elsewhere; re-fetch when the user comes back
    // to this tab so an approved certificate shows up without a manual reload (not while editing).
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible' && !isEditing) {
                getProfile().then(setProfile).catch(() => undefined);
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [isEditing]);

    if (loading && !profile) return <Loader />;

    if (error || !profile) {
        return (
            <div className="w-full p-4 bg-secondary-50 min-h-screen">
                <div className="bg-base-white rounded-lg p-6 shadow-xsm flex items-center justify-between">
                    <p className="text-p3 text-warning-600">{error || 'Profile not available.'}</p>
                    <button
                        onClick={loadProfile}
                        className="px-4 h-10 rounded-full bg-secondary-600 text-pneutral-50 font-heading text-p3"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { user } = profile;
    // The organization (entity) is stored with the labs, so any lab of the user carries the same entity data.
    const entityLab = profile.labs[0];
    const orgDetails: OrganizationDetails | null | undefined = entityLab?.details?.organization;
    const gstinCertUrl = entityLab?.documents?.[ORG_GSTIN_CERT] ?? null;
    // Newest first from the backend: the first match is the latest request for this certificate
    const gstinRequest = entityLab?.certificateRequests?.find(r => r.documentType === ORG_GSTIN_CERT);
    const gstinPending = gstinRequest?.status === 'PENDING';
    const addressChanged =
        isEditing && ORG_ADDRESS_KEYS.some(k => (org[k] ?? '').trim() !== asText(orgDetails?.[k as keyof OrganizationDetails]).trim());
    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

    const startEdit = () => {
        setPersonal({
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            phone: user.phone ?? '',
            address: user.address ?? '',
            city: user.city ?? '',
            state: user.state ?? '',
            zip: user.zip ?? '',
            country: user.country ?? '',
        });
        setOrg(Object.fromEntries(ORG_FIELDS.map(f => [f.key, asText(orgDetails?.[f.key])])));
        setCertFile(null);
        setErrors({});
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setCertFile(null);
    };

    // One Save for everything on the page. Each part only sends what changed:
    // personal details and organization details are saved immediately, a new certificate goes for admin approval.
    const handleSave = async () => {
        // Same rules as the Super Admin onboarding. Format is checked for values that were changed, so an
        // older saved value never blocks saving other fields; a mandatory value can never be emptied.
        const nextErrors: Record<string, string> = {};
        const personalPayload: ProfileUpdatePayload = {};
        for (const { key, label, editable } of PERSONAL_FIELDS) {
            if (!editable) continue;
            const next = personal[key].trim();
            const current = (user[key] ?? '').toString();
            if (!next && current) {
                nextErrors[`p.${key}`] = `${label} cannot be left empty`;
                continue;
            }
            if (!next || next === current) continue;
            const error =
                key === 'phone' ? validatePhone(next, 'Mobile number')
                : key === 'zip' ? validatePin(next)
                : key === 'address' ? maxLen(next, 'Address', 255)
                : key === 'city' ? maxLen(next, 'City', 50)
                : null;
            if (error) nextErrors[`p.${key}`] = error;
            else personalPayload[key] = next;
        }

        const orgPayload: Record<string, string> = {};
        for (const key of ORG_EDITABLE_KEYS) {
            const next = (org[key] ?? '').trim();
            const current = asText(orgDetails?.[key as keyof OrganizationDetails]).trim();
            const label = ORG_FIELDS.find(f => f.key === key)?.label ?? key;
            if (ORG_MANDATORY_KEYS.includes(key) && !next) {
                nextErrors[`o.${key}`] = `${label} cannot be left empty`;
                continue;
            }
            if (next === current) continue;
            const error =
                key === 'email' ? validateEmail(next, 'Organization email')
                : key === 'phone' ? validatePhone(next, 'Organization contact number')
                : key === 'pinCode' ? (next ? validatePin(next) : null)
                : key === 'addressLine1' ? text(next, 'Address line 1', 100)
                : key === 'addressLine2' ? maxLen(next, 'Address line 2', 100)
                : key === 'district' ? text(next, 'District', 50)
                : key === 'city' ? text(next, 'City / Town', 50)
                : null;
            if (error) nextErrors[`o.${key}`] = error;
            else orgPayload[key] = next; // "" clears an optional value
        }

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            toast.error('Please correct the highlighted fields');
            setTimeout(() => document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
            return;
        }

        const hasPersonal = Object.keys(personalPayload).length > 0;
        const hasOrg = Object.keys(orgPayload).length > 0;

        if (addressChanged && !certFile) {
            toast.error('Upload the GSTIN certificate to change the organization address');
            return;
        }

        if (!hasPersonal && !hasOrg && !certFile) {
            setIsEditing(false);
            return;
        }

        setSaving(true);
        let failed = false;
        try {
            if (hasPersonal) {
                const updated = await updateMyDetails(personalPayload);
                updateUser({
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    phone: updated.phone ?? undefined,
                    address: updated.address ?? undefined,
                    city: updated.city ?? undefined,
                    state: updated.state ?? undefined,
                    zip: updated.zip ?? undefined,
                    country: updated.country ?? undefined,
                });
            }
            // Certificate first: if it is refused (e.g. a request is already pending) the address is left unchanged
            if (certFile && entityLab) {
                await submitCertificateRequest(entityLab.labId, { type: ORG_GSTIN_CERT, file: certFile });
            }
            if (hasOrg && entityLab) {
                await updateLabDetails(entityLab.labId, { organization: orgPayload as OrganizationDetails });
            }
            toast.success(
                certFile
                    ? 'Saved. The new certificate will take effect once the admin approves it.'
                    : 'Profile updated successfully',
            );
        } catch (err) {
            failed = true;
            toast.error((err as Error).message);
        } finally {
            setSaving(false);
        }
        // Reload either way: earlier parts may have been saved even if a later one failed
        await loadProfile();
        if (!failed) cancelEdit();
    };

    return (
        <div className="w-full p-4 bg-secondary-50 min-h-screen">
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-4">
                {/* Header */}
                <section className="bg-base-white rounded-lg p-6 shadow-xsm flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="w-20 h-20 shrink-0 rounded-full bg-secondary-600 text-pneutral-50 font-heading text-h4 flex items-center justify-center">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-heading text-h5 text-pneutral-900">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-p3 text-pneutral-600 mt-1">{user.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="flex items-center gap-1 text-p2 text-pneutral-500">
                                <FaUserAlt /> @{user.username}
                            </span>
                            {user.roles.map(role => (
                                <Badge key={role} className="bg-secondary-100 text-secondary-800">
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="text-p2 text-pneutral-500 sm:text-right">
                        <p>Member since {formatDate(user.createdAt)}</p>
                        <p>Last updated {formatDate(user.updatedAt)}</p>
                    </div>
                </section>

                {gstinPending && (
                    <div className="bg-danger-50 text-danger-800 rounded-lg px-4 py-3 text-p3">
                        Your GSTIN certificate update is waiting for admin approval. The current certificate stays active
                        until it is approved, then the new one shows here.
                    </div>
                )}

                {/* Everything on one card, one Edit button */}
                <section className="bg-base-white rounded-lg p-6 shadow-xsm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-h6 text-pneutral-900">Profile Details</h2>
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
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={startEdit}
                                    className="flex items-center gap-2 px-4 h-10 rounded-full bg-secondary-600 text-pneutral-50 font-heading text-p3 transition-all duration-200 hover:bg-secondary-700"
                                >
                                    <FaRegEdit /> Edit
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Personal */}
                    <SectionTitle>Super Admin</SectionTitle>
                    {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {PERSONAL_FIELDS.map(({ key, label, editable }) => (
                                <InputField
                                    key={key}
                                    label={label}
                                    disabled={!editable}
                                    required={editable}
                                    options={withCurrent(PERSONAL_RULES[key]?.options, personal[key])}
                                    maxLength={PERSONAL_RULES[key]?.maxLength}
                                    inputMode={PERSONAL_RULES[key]?.inputMode}
                                    error={errors[`p.${key}`]}
                                    value={personal[key]}
                                    onChange={v => {
                                        setPersonal(prev => ({ ...prev, [key]: PERSONAL_RULES[key]?.sanitize?.(v) ?? v }));
                                        setErrors(prev => ({ ...prev, [`p.${key}`]: '' }));
                                    }}
                                />
                            ))}
                            <InputField label="Username" disabled value={user.username} onChange={() => undefined} />
                            <InputField label="Email" disabled value={user.email} onChange={() => undefined} />
                        </div>
                    ) : (
                        <Grid>
                            <Field label="First Name" value={user.firstName} />
                            <Field label="Last Name" value={user.lastName} />
                            <Field label="Username" value={user.username} />
                            <Field label="Email" value={user.email} />
                            <Field label="Phone" value={user.phone} />
                            <Field label="Address" value={user.address} />
                            <Field label="City" value={user.city} />
                            <Field label="State" value={user.state} />
                            <Field label="Zip" value={user.zip} />
                            <Field label="Country" value={user.country} />
                        </Grid>
                    )}
                    {/* Organization */}
                    <div className="mt-8">
                        <SectionTitle>Organization</SectionTitle>
                        {!entityLab ? (
                            <p className="text-p3 text-pneutral-600">No organization details available yet.</p>
                        ) : isEditing ? (
                            <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ORG_FIELDS.map(f => (
                                    <InputField
                                        key={f.key}
                                        label={f.label}
                                        options={withCurrent(f.options ?? ORG_RULES[f.key]?.options, org[f.key] ?? '')}
                                        maxLength={ORG_RULES[f.key]?.maxLength}
                                        inputMode={ORG_RULES[f.key]?.inputMode}
                                        error={errors[`o.${f.key}`]}
                                        required={ORG_MANDATORY_KEYS.includes(f.key)}
                                        optional={!ORG_MANDATORY_KEYS.includes(f.key)}
                                        disabled={!ORG_EDITABLE_KEYS.includes(f.key) || (gstinPending && ORG_ADDRESS_KEYS.includes(f.key))}
                                        value={org[f.key] ?? ''}
                                        onChange={v => {
                                            setOrg(prev => ({ ...prev, [f.key]: ORG_RULES[f.key]?.sanitize?.(v) ?? v }));
                                            setErrors(prev => ({ ...prev, [`o.${f.key}`]: '' }));
                                        }}
                                    />
                                ))}
                            </div>
                            </>
                        ) : (
                            <Grid>
                                <Field label="Name" value={orgDetails?.name} />
                                <Field label="Type" value={orgDetails?.type} />
                                <Field label="Email" value={orgDetails?.email} />
                                <Field label="Phone" value={orgDetails?.phone} />
                                <Field label="PAN" value={orgDetails?.pan} />
                                <Field label="GSTIN" value={orgDetails?.gstin} />
                                <Field
                                    label="Address"
                                    value={[orgDetails?.addressLine1, orgDetails?.addressLine2, orgDetails?.district, orgDetails?.city, orgDetails?.state, orgDetails?.pinCode, orgDetails?.country]
                                        .filter(Boolean)
                                        .join(', ')}
                                />
                            </Grid>
                        )}
                    </div>

                    {/* GSTIN certificate */}
                    {entityLab && (
                        <div className="mt-8">
                            <SectionTitle>Organization GSTIN Certificate</SectionTitle>
                            {isEditing ? (
                                gstinPending ? (
                                    <p className="text-p3 text-pneutral-600">
                                        A replacement is already waiting for admin approval, so the organization address is locked until it is reviewed.
                                    </p>
                                ) : (
                                    <div className="max-w-md">
                                        <CertificateDropzone
                                            label="New GSTIN Certificate"
                                            required={addressChanged}
                                            value={certFile}
                                            onChange={setCertFile}
                                        />
                                        <p className={`text-p2 mt-2 ${addressChanged && !certFile ? 'text-warning-600' : 'text-pneutral-500'}`}>
                                            {addressChanged
                                                ? 'You changed the organization address, so the GSTIN certificate must be uploaded. It goes to the admin for approval and the current one stays active until then.'
                                                : 'Needed only if you change the organization address. The current certificate stays active until the admin approves a new one.'}
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div className="inline-flex flex-wrap items-center gap-4 p-3 rounded-md bg-secondary-50">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-p3 text-pneutral-900">
                                            {gstinCertUrl ? 'GSTIN certificate uploaded' : 'No certificate uploaded'}
                                        </span>
                                        {gstinPending ? (
                                            <Badge className={STATUS_STYLES.PENDING}>Pending approval</Badge>
                                        ) : gstinRequest?.status === 'REJECTED' ? (
                                            <span className="text-p2 text-warning-600">
                                                Last request rejected
                                                {gstinRequest.rejectionReason ? `: ${gstinRequest.rejectionReason}` : ''}
                                            </span>
                                        ) : (
                                            <span className="text-p2 text-pneutral-500">Changes need admin approval</span>
                                        )}
                                    </div>
                                    {gstinCertUrl && (
                                        <a
                                            href={gstinCertUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-1 rounded-full border border-secondary-600 font-heading text-label-l2 text-secondary-700 transition-colors hover:bg-secondary-100"
                                        >
                                            View
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
