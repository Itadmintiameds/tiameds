import React from 'react';
import { reportTemplates, TemplateId } from './reportTemplates';

type TemplatePreviewProps = {
  templateId: TemplateId;
  headerEnabled: boolean;
  headerRequired: boolean;
  fontSize: number;
  textSize: 'Small' | 'Medium' | 'Large';
  textColor: string;
  signaturePlacement: string;
  signatureColumns: 2 | 3 | 4;
  disclaimerEnabled: boolean;
  disclaimerText: string;
  roles: Array<{
    id: string;
    role: string;
    displayName: string;
    designation: string;
    signatureUrl?: string;
    enabled: boolean;
  }>;
};

const TemplatePreview = ({
  templateId,
  headerEnabled,
  headerRequired,
  fontSize,
  textSize,
  textColor,
  signaturePlacement,
  signatureColumns,
  disclaimerEnabled,
  disclaimerText,
  roles,
}: TemplatePreviewProps) => {
  const template = reportTemplates.find((item) => item.id === templateId);
  const baseSize = textSize === 'Small' ? 11 : textSize === 'Large' ? 14 : 12;
  const previewStyles = { fontSize: `${Math.max(baseSize, fontSize)}px`, color: textColor };
  const spacingClass =
    template?.spacing === 'compact'
      ? 'space-y-2'
      : template?.spacing === 'cozy'
        ? 'space-y-5'
        : 'space-y-4';
  const headerClass =
    template?.headerStyle === 'compact' ? 'py-2 px-3' : 'py-3 px-4';
  const signatureColumnsClass =
    signatureColumns === 4 ? 'grid-cols-4' : signatureColumns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  const signatureLayoutClass =
    template?.signatureLayout === 'stacked'
      ? 'grid grid-cols-1 gap-2'
      : `grid ${signatureColumnsClass} gap-2`;

  return (
    <div className={spacingClass} style={previewStyles}>
      {headerEnabled && (
        <div className={`rounded-lg border border-gray-200 ${headerClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Lab Report</div>
              <div className="opacity-70">
                {template?.label || 'Template'} · {template?.description || 'Layout'}
              </div>
            </div>
            <span className="opacity-70">{headerRequired ? 'Header Required' : 'Header Optional'}</span>
          </div>
        </div>
      )}
      <div className="rounded-lg border border-gray-200 p-3">
        <div className="font-semibold">Patient Summary</div>
        <div className="mt-2 grid grid-cols-2 gap-2 opacity-80">
          <div><span className="font-medium opacity-70">Name:</span> Mr. Kumar</div>
          <div><span className="font-medium opacity-70">Age/Sex:</span> 33 / M</div>
          <div><span className="font-medium opacity-70">Visit ID:</span> VZ-00074</div>
          <div><span className="font-medium opacity-70">Date:</span> 10/02/2026</div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 p-3">
        <div className="font-semibold">Results</div>
        <div className="mt-2 grid grid-cols-4 gap-2 opacity-80">
          <div className="rounded bg-gray-100 px-2 py-1 font-semibold">Test</div>
          <div className="rounded bg-gray-100 px-2 py-1 font-semibold">Result</div>
          <div className="rounded bg-gray-100 px-2 py-1 font-semibold">Range</div>
          <div className="rounded bg-gray-100 px-2 py-1 font-semibold">Unit</div>
          <div className="rounded border border-gray-100 px-2 py-1">AEC</div>
          <div className="rounded border border-gray-100 px-2 py-1">2000</div>
          <div className="rounded border border-gray-100 px-2 py-1">1000-4800</div>
          <div className="rounded border border-gray-100 px-2 py-1">cells/µL</div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 p-3">
        <div className="font-semibold">
          Signatures ({signaturePlacement.replace('-', ' ')})
        </div>
        <div className={`mt-2 ${signatureLayoutClass}`}>
          {roles.filter((role) => role.enabled).map((role) => (
            <div key={role.id} className="rounded border border-gray-200 p-2">
              <div className="font-semibold">{role.displayName || role.role}</div>
              <div className="opacity-70">{role.designation || 'Designation'}</div>
              <div className="mt-2 flex h-8 items-center justify-center rounded bg-gray-50">
                {role.signatureUrl ? (
                  <img
                    src={role.signatureUrl}
                    alt={`${role.role} signature`}
                    className="max-h-8 max-w-full object-contain"
                  />
                ) : (
                  <div className="h-6 w-full rounded bg-gradient-to-r from-gray-100 to-gray-50" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {disclaimerEnabled && (
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-xs font-semibold">Disclaimer</div>
          <div className="mt-2 text-[11px] opacity-70">{disclaimerText}</div>
        </div>
      )}
    </div>
  );
};

export default TemplatePreview;
