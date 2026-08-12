"use client";

import {
  Eye,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";


const LivePreview = () => { 
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
            Numeric
          </span>
        </div>

        {/* Input */}
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

        {/* Scale */}
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
      </div>

      {/* Report Preview */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-pneutral-100">
        <h3 className="text-center text-xl font-semibold text-pneutral-900">
          Report Preview
        </h3>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-lg text-pneutral-800">
            Haemoglobin
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-pneutral-900">
              14.2
            </span>
            <span className="text-pneutral-400">
              g/dL
            </span>
          </div>
          <span className="rounded-full border border-success-600 bg-success-50 px-4 py-1 text-sm font-semibold text-success-800">
            Normal
          </span>
        </div>
        <div className="mt-5 border-t border-pneutral-200" />
        <p className="mt-4 text-sm text-pneutral-400">
          Ref: 13.5 - 17.0 g/dL (Adult Male)
        </p>
      </div>

      {/* Critical Alert */}
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

      {/* Save Button */}
      <button className="flex h-9 w-full items-center justify-center gap-1 rounded-full bg-secondary-700 text-label-l3 font-medium text-pneutral-50 shadow-lg">
        <CheckCircle2 size={16} />
        Save & Publish
      </button>
    </div>
  );
}

export default LivePreview;