"use client";

import { FaCircleExclamation } from "react-icons/fa6";

interface NumericForm {
  normalMin: string;
  normalMax: string;
  criticalMin: string;
  criticalMax: string;
  borderlineMin: string;
  borderlineMax: string;
  unit: string;
  decimalPlaces: string;
}

interface NumericProps {
  form: NumericForm;
  toggles: {
    allowDecimal: boolean;
    allowNegative: boolean;
    requireRemarks: boolean;
    autoInterpretation: boolean;
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  toggleSwitch: (
    key:
      | "allowDecimal"
      | "allowNegative"
      | "requireRemarks"
      | "autoInterpretation"
  ) => void;
}

const Numeric = ({
  form,
  toggles,
  handleInputChange,
  toggleSwitch,
}: NumericProps) => {
  const toggleItems = [
    {
      key: "allowDecimal",
      label: "Allow Decimal Input",
    },
    {
      key: "allowNegative",
      label: "Allow Negative Values",
    },
    {
      key: "requireRemarks",
      label: "Show on Report",
    },
    {
      key: "autoInterpretation",
      label: "Auto-flag Abnormal Result",
    },
  ];

  const leftColumnToggles = toggleItems.slice(0, 2);
  const rightColumnToggles = toggleItems.slice(2);

  return (
    <>
      <>
            <div className="rounded-xl border border-secondary-400 bg-secondary-50">
              {/* Section Header */}
              <div className="border-b border-secondary-200 p-4">
                <div className="flex items-center gap-2">
                  <FaCircleExclamation
                    className="text-secondary-700"
                    size={22}
                  />

                  <h3 className="text-p3 font-semibold text-secondary-700">
                    Reference & Critical Values
                  </h3>

                  <span className="rounded-full border border-secondary-300 bg-white px-3 py-1 text-label-l2 text-secondary-700">
                    Most Important
                  </span>
                </div>
              </div>

              <div className="space-y-6 p-5">
                {/* Normal + Critical */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* ---------------- Normal Range ---------------- */}
                  <div>
                    <div className="mb-5 flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-success-700" />

                      <h4 className="text-p3 font-semibold text-success-800">
                        Normal Range
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Min */}
                      <div>
                        <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                          Min Value
                        </label>

                        <input
                          type="text"
                          inputMode="decimal"
                          name="normalMin"
                          value={form.normalMin}
                          onChange={handleInputChange}
                          placeholder="e.g. 12.0"
                          className="h-9 w-full rounded-lg border border-pneutral-200 bg-white px-4 text-p2 outline-none transition-all focus:border-success-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>

                      {/* Max */}
                      <div>
                        <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                          Max Value
                        </label>

                        <input
                          type="text"
                          inputMode="decimal"
                          name="normalMax"
                          value={form.normalMax}
                          onChange={handleInputChange}
                          placeholder="e.g. 16.0"
                          className="h-9 w-full rounded-lg border border-pneutral-200 bg-white px-4 text-p2 outline-none transition-all focus:border-success-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ---------------- Critical Values ---------------- */}
                  <div>
                    <div className="mb-5 flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-warning-500" />

                      <h4 className="text-p3 font-semibold text-warning-600">
                        Critical Values
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Min */}
                      <div>
                        <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                          Min Value
                        </label>

                        <input
                          type="text"
                          inputMode="decimal"
                          name="criticalMin"
                          value={form.criticalMin}
                          onChange={handleInputChange}
                          placeholder="e.g. 7.0"
                          className="h-9 w-full rounded-lg border border-warning-200 bg-white px-4 text-p2 outline-none transition-all focus:border-warning-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>

                      {/* Max */}
                      <div>
                        <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                          Max Value
                        </label>

                        <input
                          type="text"
                          inputMode="decimal"
                          name="criticalMax"
                          value={form.criticalMax}
                          onChange={handleInputChange}
                          placeholder="e.g. 20.0"
                          className="h-9 w-full rounded-lg border border-warning-200 bg-white px-4 text-p2 outline-none transition-all focus:border-warning-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------- Borderline Range ---------------- */}
                <div>
                  <div className="mb-5 flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-danger-500" />

                    <h4 className="text-p3 font-semibold text-warning-600">
                      Borderline Range
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Min */}
                    <div>
                      <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                        Min Value
                      </label>

                      <input
                        type="text"
                        inputMode="decimal"
                        name="borderlineMin"
                        value={form.borderlineMin}
                        onChange={handleInputChange}
                        placeholder="e.g. 10.0"
                        className="h-9 w-full rounded-lg border border-danger-300 bg-white px-4 text-p2 outline-none transition-all focus:border-danger-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>

                    {/* Max */}
                    <div>
                      <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                        Max Value
                      </label>

                      <input
                        type="text"
                        inputMode="decimal"
                        name="borderlineMax"
                        value={form.borderlineMax}
                        onChange={handleInputChange}
                        placeholder="e.g. 18.0"
                        className="h-9 w-full rounded-lg border border-danger-300 bg-white px-4 text-p2 outline-none transition-all focus:border-danger-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-pneutral-200" />

                {/* Unit & Decimal */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Unit */}
                  <div>
                    <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                      Unit
                    </label>

                    <input
                      type="text"
                      name="unit"
                      value={form.unit}
                      onChange={handleInputChange}
                      placeholder="e.g. g/dL"
                      className="h-11 w-full rounded-lg border border-pneutral-300 bg-white px-4 outline-none transition focus:border-secondary-500"
                    />
                  </div>

                  {/* Decimal */}
                  <div>
                    <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                      Decimal Places
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      name="decimalPlaces"
                      value={form.decimalPlaces}
                      onChange={handleInputChange}
                      placeholder="2"
                      className="h-11 w-full rounded-lg border border-pneutral-300 bg-white px-4 outline-none transition focus:border-secondary-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Toggles - Left/Right layout with toggle button on left */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                {leftColumnToggles.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-3"
                  >
                    <button
                      onClick={() =>
                        toggleSwitch(
                          item.key as keyof typeof toggles
                        )
                      }
                      className={`relative h-6 w-12 flex-shrink-0 rounded-full transition-all duration-300 ${
                        toggles[item.key as keyof typeof toggles]
                          ? "bg-secondary-700"
                          : "bg-pneutral-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
                          toggles[item.key as keyof typeof toggles]
                            ? "left-7"
                            : "left-1"
                        }`}
                      />
                    </button>
                    <p className="text-p2 font-medium text-pneutral-900">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {rightColumnToggles.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-3"
                  >
                    <button
                      onClick={() =>
                        toggleSwitch(
                          item.key as keyof typeof toggles
                        )
                      }
                      className={`relative h-6 w-12 shrink-0 rounded-full transition-all duration-300 ${
                        toggles[item.key as keyof typeof toggles]
                          ? "bg-secondary-700"
                          : "bg-pneutral-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
                          toggles[item.key as keyof typeof toggles]
                            ? "left-7"
                            : "left-1"
                        }`}
                      />
                    </button>
                    <p className="text-p2 font-medium text-pneutral-900">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
    </>
  );
};

export default Numeric;