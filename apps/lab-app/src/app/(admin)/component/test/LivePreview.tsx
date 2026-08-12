"use client";

import {
  Eye,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { ResultType } from "./Result";

interface LivePreviewProps {
  resultType: ResultType | null;
}

interface ReportPreset {
  testName: string;
  value: string;
  unit?: string;
  badgeText: string;
  badgeClass: string;
  ref?: string;
}

const reportPresets: Record<ResultType, ReportPreset> = {
  Numeric: {
    testName: "Haemoglobin",
    value: "14.2",
    unit: "g/dL",
    badgeText: "Normal",
    badgeClass: "border-success-600 bg-success-50 text-success-800",
    ref: "Ref: 13.5 - 17.0 g/dL (Adult Male)",
  },
  "Set Range": {
    testName: "Vitamin D",
    value: "32",
    unit: "ng/mL",
    badgeText: "Sufficient",
    badgeClass: "border-success-600 bg-success-50 text-success-800",
    ref: "Range: Sufficient 30 - 100 ng/mL",
  },
  "Dropdown/Select": {
    testName: "HIV Screening",
    value: "Negative",
    badgeText: "Normal",
    badgeClass: "border-success-600 bg-success-50 text-success-800",
    ref: "Expected: Negative / Non-Reactive",
  },
  Text: {
    testName: "Culture Report",
    value: "Clear, no growth",
    badgeText: "Normal",
    badgeClass: "border-success-600 bg-success-50 text-success-800",
  },
  "Positive / Negative": {
    testName: "HIV I & II",
    value: "Negative",
    badgeText: "Normal",
    badgeClass: "border-success-600 bg-success-50 text-success-800",
  },
  "Yes / No": {
    testName: "Pregnancy Test",
    value: "No",
    badgeText: "Normal",
    badgeClass: "border-success-600 bg-success-50 text-success-800",
  },
  Textarea: {
    testName: "Microscopy Findings",
    value:
      "RBC: Normal morphology. WBC: Within normal limits. Platelets: Adequate.",
    badgeText: "Normal",
    badgeClass: "border-success-600 bg-success-50 text-success-800",
  },
  "Multi-Parameter": {
    testName: "Lipid Panel",
    value: "",
    badgeText: "",
    badgeClass: "",
  },
};

const multiParamSample = [
  { name: "Total Cholesterol", value: "182", unit: "mg/dL", status: "Normal" },
  { name: "HIV I & II Screening", value: "Negative", unit: "", status: "Normal" },
];

const hasCriticalAlert = (resultType: ResultType | null) =>
  !!resultType && resultType !== "Text" && resultType !== "Textarea";

const LivePreview = ({ resultType }: LivePreviewProps) => {
  const renderResultEntry = () => {
    switch (resultType) {
      case "Numeric":
        return (
          <>
            <div className="mt-5 flex gap-3">
              <input
                type="text"
                placeholder="Enter the value....."
                className="h-12 flex-1 rounded-lg border border-pneutral-300 px-4 text-sm outline-none focus:border-secondary-600"
              />
              <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-pneutral-300 bg-pneutral-50 text-pneutral-900 font-medium">
                g/dL
              </div>
            </div>

            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full">
                <div className="grid h-full grid-cols-5">
                  <div className="bg-warning-500" />
                  <div className="bg-danger-500" />
                  <div className="bg-success-500" />
                  <div className="bg-danger-500" />
                  <div className="bg-warning-500" />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-5 text-center text-[10px] font-medium text-pneutral-400">
                <span>Crit Low</span>
                <span>Min</span>
                <span>Normal</span>
                <span>Max</span>
                <span>Crit High</span>
              </div>
            </div>
          </>
        );

      case "Set Range":
        return (
          <>
            <div className="mt-5">
              <input
                type="text"
                placeholder="Enter the value....."
                className="h-12 w-full rounded-lg border border-pneutral-300 px-4 text-sm outline-none focus:border-secondary-600"
              />
            </div>

            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full">
                <div className="grid h-full grid-cols-4">
                  <div className="bg-danger-500" />
                  <div className="bg-warning-500" />
                  <div className="bg-success-500" />
                  <div className="bg-danger-600" />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-4 text-center text-[10px] font-medium text-pneutral-400">
                <span>Deficient</span>
                <span>Insufficient</span>
                <span>Sufficient</span>
                <span>Toxicity</span>
              </div>
            </div>
          </>
        );

      case "Dropdown/Select":
        return (
          <div className="mt-5">
            <select
              defaultValue=""
              className="h-12 w-full rounded-lg border border-pneutral-300 bg-white px-4 text-sm outline-none focus:border-secondary-600"
            >
              <option value="" disabled>
                Select a result.....
              </option>
              <option>Reactive</option>
              <option>Non-Reactive</option>
              <option>Negative</option>
            </select>
          </div>
        );

      case "Text":
        return (
          <div className="mt-5">
            <input
              type="text"
              placeholder="Enter result text....."
              className="h-12 w-full rounded-lg border border-pneutral-300 px-4 text-sm outline-none focus:border-secondary-600"
            />
          </div>
        );

      case "Textarea":
        return (
          <div className="mt-5">
            <textarea
              rows={4}
              placeholder="Enter detailed findings....."
              className="w-full resize-none rounded-lg border border-pneutral-300 px-4 py-3 text-sm outline-none focus:border-secondary-600"
            />
          </div>
        );

      case "Positive / Negative":
        return (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="h-12 rounded-lg border border-pneutral-300 text-sm font-semibold text-pneutral-600"
            >
              Positive
            </button>
            <button
              type="button"
              className="h-12 rounded-lg border border-secondary-600 bg-secondary-50 text-sm font-semibold text-secondary-700"
            >
              Negative
            </button>
          </div>
        );

      case "Yes / No":
        return (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="h-12 rounded-lg border border-pneutral-300 text-sm font-semibold text-pneutral-600"
            >
              Yes
            </button>
            <button
              type="button"
              className="h-12 rounded-lg border border-secondary-600 bg-secondary-50 text-sm font-semibold text-secondary-700"
            >
              No
            </button>
          </div>
        );

      case "Multi-Parameter":
        return (
          <div className="mt-5 space-y-3">
            {multiParamSample.map((param) => (
              <div key={param.name} className="flex items-center gap-3">
                <span className="w-2/5 truncate text-sm text-pneutral-600">
                  {param.name}
                </span>
                <input
                  type="text"
                  placeholder="Enter value....."
                  className="h-10 flex-1 rounded-lg border border-pneutral-300 px-3 text-sm outline-none focus:border-secondary-600"
                />
                {param.unit && (
                  <span className="w-12 text-xs text-pneutral-400">
                    {param.unit}
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <p className="mt-5 text-sm text-pneutral-400">
            Select a result type above to preview the entry field.
          </p>
        );
    }
  };

  const renderReportPreview = () => {
    if (!resultType) {
      return (
        <p className="mt-6 text-center text-sm text-pneutral-400">
          Select a result type to preview the report.
        </p>
      );
    }

    if (resultType === "Multi-Parameter") {
      return (
        <div className="mt-6 space-y-3">
          {multiParamSample.map((param) => (
            <div
              key={param.name}
              className="flex items-center justify-between"
            >
              <span className="text-p2 text-pneutral-800">{param.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-pneutral-900">
                  {param.value}
                </span>
                {param.unit && (
                  <span className="text-pneutral-400">{param.unit}</span>
                )}
              </div>
              <span className="rounded-full border border-success-600 bg-success-50 px-3 py-1 text-label-l3 font-semibold text-success-800">
                {param.status}
              </span>
            </div>
          ))}
        </div>
      );
    }

    const preset = reportPresets[resultType];

    if (resultType === "Textarea") {
      return (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-lg text-pneutral-800">
              {preset.testName}
            </span>
            <span
              className={`rounded-full border px-4 py-1 text-sm font-semibold ${preset.badgeClass}`}
            >
              {preset.badgeText}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-pneutral-700">
            {preset.value}
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-lg text-pneutral-800">
            {preset.testName}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-pneutral-900">
              {preset.value}
            </span>
            {preset.unit && (
              <span className="text-pneutral-400">{preset.unit}</span>
            )}
          </div>
          <span
            className={`rounded-full border px-4 py-1 text-sm font-semibold ${preset.badgeClass}`}
          >
            {preset.badgeText}
          </span>
        </div>
        {preset.ref && (
          <>
            <div className="mt-5 border-t border-pneutral-200" />
            <p className="mt-4 text-sm text-pneutral-400">{preset.ref}</p>
          </>
        )}
      </>
    );
  };

  return (
    <div className="space-y-5 py-21">
      {/* Live Preview */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <Eye
            size={18}
            className="text-secondary-600"
          />
          <h2 className="text-xl font-semibold text-pneutral-900">
            Live Preview
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-pneutral-500">
          How this test appears during result
          entry & on reports
        </p>
      </div>

      {/* Result Entry */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-pneutral-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-pneutral-900">
            Result Entry
          </h3>
          <span className="rounded-full bg-info-50 px-4 py-1 text-sm font-semibold text-info-500">
            {resultType ?? "Not selected"}
          </span>
        </div>

        {renderResultEntry()}
      </div>

      {/* Report Preview */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-pneutral-100">
        <h3 className="text-center text-xl font-semibold text-pneutral-900">
          Report Preview
        </h3>
        {renderReportPreview()}
      </div>

      {/* Critical Alert */}
      {hasCriticalAlert(resultType) && (
        <div className="rounded-3xl border border-warning-600 bg-danger-50 p-4">
          <div className="flex gap-2">
            <AlertTriangle
              className="mt-1 text-warning-600"
              size={24}
            />
            <div>
              <h3 className="text-xl font-semibold text-warning-600">
                Critical Value Alert
              </h3>
              <p className="mt-2 text-p2 leading-6 text-warning-600">
                Values outside critical range will trigger
                immediate notification to the ordering
                physician.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button className="flex h-9 w-full items-center justify-center gap-1 rounded-full bg-secondary-700 text-label-l3 font-medium text-pneutral-50 shadow-lg">
        <CheckCircle2 size={16} />
        Save & Publish
      </button>
    </div>
  );
}

export default LivePreview;
