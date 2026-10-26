"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getDoctor } from '@/../services/doctorServices';
import {
  RadiologyReport,
  RadiologySignatoryRole,
  finalizeRadiologyReport,
  getRadiologyReport,
  saveRadiologyReport,
} from '@/../services/radiologyServices';
import { Doctor } from '@/types/doctor/doctor';

interface SignatoryDraft {
  doctorId: number;
  role: RadiologySignatoryRole;
}

const stripHtml = (html: string) =>
  html
    .replace(/<\/(p|li|div|tr)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*/g, '\n')
    .trim();

const parseReportDocument = (reportJson?: string): Record<string, unknown> => {
  try {
    const parsed = reportJson ? JSON.parse(reportJson) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : { sections: [] };
  } catch {
    return { sections: [] };
  }
};

// The editor keeps the written report as { title, sections[] }; true when any section has text
const hasReportText = (reportJson?: string) => {
  const sections = parseReportDocument(reportJson).sections;
  return Array.isArray(sections) && sections.some(s => typeof s?.content === 'string' && stripHtml(s.content));
};

// Doctors are just added; the backend still needs a role per signer, so the first doctor
// is the reporting doctor and the others verify.
const assignRoles = (list: SignatoryDraft[]): SignatoryDraft[] =>
  list.map((s, index) => ({ ...s, role: index === 0 ? 'REPORTING' : 'VERIFYING' }));

interface UseRadiologyReportArgs {
  labId?: number;
  visitId?: number | string;
  testId?: number;
  enabled: boolean;
}

export const useRadiologyReport = ({ labId, visitId, testId, enabled }: UseRadiologyReportArgs) => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [existing, setExisting] = useState<RadiologyReport | null>(null);
  const [signatories, setSignatories] = useState<SignatoryDraft[]>([]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!enabled || !labId || !visitId || !testId) return;
    let active = true;
    setLoading(true);
    Promise.allSettled([getDoctor(labId), getRadiologyReport(labId, visitId, testId)])
      .then(([doctorResult, reportResult]) => {
        if (!active) return;
        if (doctorResult.status === 'fulfilled' && doctorResult.value?.status === 'success') {
          setDoctors(doctorResult.value.data || []);
        }
        if (reportResult.status === 'fulfilled' && reportResult.value) {
          const report = reportResult.value;
          setExisting(report);
          setSignatories(report.signatories.map(s => ({ doctorId: s.doctorId, role: s.role })));
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [enabled, labId, visitId, testId]);

  const isLocked = existing?.status === 'FINAL' || existing?.status === 'AMENDED';

  // Returns a message when the radiology report cannot be saved yet, otherwise null
  const validate = useCallback(
    (reportJson?: string): string | null => {
      if (!signatories.some(s => s.role === 'REPORTING')) return 'Select at least one doctor for the radiology report';
      if (!hasReportText(reportJson)) return 'Write the radiology report (choose a format or upload a document) before saving';
      if (isLocked && !reason.trim()) return 'Enter the reason for changing the finalized radiology report';
      return null;
    },
    [signatories, isLocked, reason]
  );

  // Saves the report and signing doctors, then finalizes a new report (the lab report itself
  // is saved as completed, so the radiology report is signed off at the same time).
  const save = useCallback(
    async (reportJson?: string) => {
      if (!labId || !visitId || !testId) return;
      const saved = await saveRadiologyReport(labId, visitId, testId, {
        findingsJson: parseReportDocument(reportJson),
        signatories,
        version: existing?.version,
        reason: isLocked ? reason.trim() : undefined,
      });
      const result = saved.status === 'DRAFT'
        ? await finalizeRadiologyReport(labId, visitId, testId, saved.version)
        : saved;
      setExisting(result);
      setReason('');
    },
    [labId, visitId, testId, signatories, existing, isLocked, reason]
  );

  return {
    loading,
    doctors,
    existing,
    isLocked,
    signatories, setSignatories,
    reason, setReason,
    validate,
    save,
  };
};

type RadiologyReportState = ReturnType<typeof useRadiologyReport>;

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-secondary-700';

const RadiologyReportPanel: React.FC<{ state: RadiologyReportState }> = ({ state }) => {
  const { doctors, signatories, setSignatories } = state;
  const [pickedDoctor, setPickedDoctor] = useState('');

  const availableDoctors = useMemo(
    () => doctors.filter(d => d.id !== undefined && !signatories.some(s => s.doctorId === d.id)),
    [doctors, signatories]
  );

  const addDoctor = () => {
    const doctorId = Number(pickedDoctor);
    if (!doctorId) return;
    setSignatories(prev => assignRoles([...prev, { doctorId, role: 'VERIFYING' }]));
    setPickedDoctor('');
  };

  if (state.loading) {
    return <div className="rounded-xl border border-pneutral-200 bg-white p-4 text-sm text-gray-500">Loading radiology report details...</div>;
  }

  return (
    <div className="space-y-4 rounded-xl border border-pneutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Radiology Report Details</h4>
        {state.existing && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {state.existing.reportCode} · {state.existing.status}
          </span>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Signing Doctors <span className="text-warning-500">*</span></label>
        <div className="space-y-2">
          {signatories.map(signatory => {
            const doctor = doctors.find(d => d.id === signatory.doctorId);
            return (
              <div key={signatory.doctorId} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <div className="min-w-[160px] flex-1">
                  <p className="text-sm font-medium text-gray-900">{doctor?.name || `Doctor #${signatory.doctorId}`}</p>
                  <p className="text-xs text-gray-500">
                    {[doctor?.qualification, doctor?.speciality].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSignatories(prev => assignRoles(prev.filter(s => s.doctorId !== signatory.doctorId)))}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            );
          })}
          {signatories.length < 5 && (
            <div className="flex gap-2">
              <select value={pickedDoctor} onChange={e => setPickedDoctor(e.target.value)} className={inputClass}>
                <option value="">Select doctor…</option>
                {availableDoctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.speciality ? ` — ${d.speciality}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addDoctor}
                disabled={!pickedDoctor}
                className="rounded-lg bg-secondary-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {state.isLocked && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Reason for change <span className="text-warning-500">*</span></label>
          <input
            value={state.reason}
            onChange={e => state.setReason(e.target.value)}
            placeholder="This report is finalized — a reason is kept in its amendment history"
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
};

export default RadiologyReportPanel;
