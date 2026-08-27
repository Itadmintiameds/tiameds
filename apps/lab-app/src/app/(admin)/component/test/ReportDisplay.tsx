"use client";

import { FileText } from "lucide-react";

export interface ReportDisplaySettings {
  showTest: boolean;
  showReferenceRange: boolean;
  showUnit: boolean;
  showInterpretation: boolean;
  highlightAbnormal: boolean;
  showTrend: boolean;
}

export const defaultReportDisplaySettings: ReportDisplaySettings = {
  showTest: true,
  showReferenceRange: false,
  showUnit: true,
  showInterpretation: false,
  highlightAbnormal: true,
  showTrend: false,
};

interface ReportDisplayProps {
  settings: ReportDisplaySettings;
  onSettingsChange: (settings: ReportDisplaySettings) => void;
}

const ReportDisplay = ({ settings, onSettingsChange }: ReportDisplayProps) => {
  const toggleSwitch = (key: keyof ReportDisplaySettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const Toggle = ({
    checked,
    onClick,
  }: {
    checked: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`relative h-6 w-12 rounded-full transition-all duration-300 ${
        checked ? "bg-secondary-600" : "bg-pneutral-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-pneutral-200 px-6 py-4">

        <div className="flex items-start gap-3">

          <div className="flex items-center justify-center">

            <FileText
              size={20}
              className=" mt-3 text-secondary-600"
            />

          </div>

          <div>

            <h2 className="text-p4 font-semibold text-pneutral-900">
              Report Display Settings
            </h2>

            <p className="text-p2 text-pneutral-500">
              Control how this test appears on printed and digital reports
            </p>

          </div>

        </div>

      </div>

      {/* Body */}

      <div className="grid grid-cols-1 gap-y-6 gap-x-10 p-6 md:grid-cols-2">

        {/* Left */}

        <div className="space-y-6">

          {/* Show Test */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={settings.showTest}
              onClick={() =>
                toggleSwitch("showTest")
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show test on report
            </span>

          </div>

          {/* Show Unit */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={settings.showUnit}
              onClick={() =>
                toggleSwitch("showUnit")
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show unit on report
            </span>

          </div>

          {/* Highlight */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={settings.highlightAbnormal}
              onClick={() =>
                toggleSwitch(
                  "highlightAbnormal"
                )
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Highlight abnormal values
            </span>

          </div>

        </div>

        {/* Right */}

        <div className="space-y-6">

          {/* Reference */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={
                settings.showReferenceRange
              }
              onClick={() =>
                toggleSwitch(
                  "showReferenceRange"
                )
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show reference range on report
            </span>

          </div>

          {/* Interpretation */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={
                settings.showInterpretation
              }
              onClick={() =>
                toggleSwitch(
                  "showInterpretation"
                )
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show interpretation on report
            </span>

          </div>

          {/* Trend */}

          <div className="flex items-center gap-3">

            <Toggle
              checked={settings.showTrend}
              onClick={() =>
                toggleSwitch("showTrend")
              }
            />

            <span className="text-p3 font-semibold text-pneutral-900">
              Show trend indicator
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}
export default ReportDisplay;
