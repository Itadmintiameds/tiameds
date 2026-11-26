import type { Billing, Patient } from '@/types/patient/patient';
import type { PatientData } from '@/types/sample/sample';

// Rules for whether a visit's report may go out on WhatsApp. Kept free of React so it can be reasoned
// about (and tested) on its own.

export interface PaymentGateResult {
    /** True only when the bill is fully settled. */
    paid: boolean;
    /** Outstanding amount in rupees, when it could be determined. */
    due: number;
    reason?: 'no-billing' | 'due';
}

const toNumber = (value: unknown): number => {
    const n = typeof value === 'string' ? parseFloat(value) : (value as number);
    return typeof n === 'number' && Number.isFinite(n) ? n : 0;
};

/**
 * Fully paid = the bill says PAID *and* nothing is outstanding. Both must hold: `paymentStatus` alone
 * can lag behind a partial payment, and `due_amount` alone is 0/absent on rows that predate the field.
 * A visit with no billing at all is NOT treated as paid -- the gate fails closed.
 */
export const evaluatePaymentGate = (billing: Billing | null | undefined): PaymentGateResult => {
    if (!billing) return { paid: false, due: 0, reason: 'no-billing' };
    const due = Math.max(0, toNumber(billing.due_amount));
    const statusPaid = String(billing.paymentStatus ?? '').toUpperCase() === 'PAID';
    if (statusPaid && due <= 0) return { paid: true, due: 0 };
    return { paid: false, due, reason: 'due' };
};

/**
 * `/lab/{labId}/visit/{visitId}` hands back the patient with its visit, either as the raw body or
 * wrapped in the usual {status, message, data}. Anything that doesn't look like a patient with a
 * visit yields null.
 */
export const unwrapVisitPatient = (response: unknown): Patient | null => {
    const looksLikePatient = (v: unknown): v is Patient =>
        !!v && typeof v === 'object' && 'visit' in (v as Record<string, unknown>) && !!(v as Patient).visit;
    if (looksLikePatient(response)) return response;
    const inner = (response as { data?: unknown } | null | undefined)?.data;
    return looksLikePatient(inner) ? inner : null;
};

/** The same PatientData shape the Patient Dashboard hands to ReportView, built from a fresh visit fetch. */
export const toReportPatientData = (patient: Patient): PatientData => {
    const visit = patient.visit;
    const doctorName =
        (patient as unknown as { doctorName?: string }).doctorName ||
        (visit as unknown as { doctorName?: string })?.doctorName;
    return {
        visitId: visit?.visitId ?? 0,
        visitCode: visit?.visitCode,
        patientId: patient.id,
        patientname: `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim(),
        contactNumber: patient.phone,
        visitDate: visit?.visitDate ?? '',
        visitStatus: visit?.visitStatus ?? '',
        gender: patient.gender ?? '',
        email: patient.email ?? '',
        sampleNames: [],
        testIds: visit?.testIds ?? [],
        packageIds: visit?.packageIds ?? [],
        dateOfBirth: patient.dateOfBirth ?? '',
        visitType: visit?.visitType,
        doctorId: visit?.doctorId !== undefined && visit?.doctorId !== null ? Number(visit.doctorId) : 0,
        doctorName,
        testResult: visit?.testResult ?? [],
    };
};
