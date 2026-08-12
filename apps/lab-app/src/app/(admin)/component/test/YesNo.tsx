"use client";

import { useState } from "react";

const YesNo = () => {
  const [options, setOptions] = useState([
    {
      id: 1,
      label: "Yes",
      status: "Abnormal",
      interpretation: "Result is positive",
    },
    {
      id: 2,
      label: "No",
      status: "Normal",
      interpretation: "Result is negative/within normal",
    },
  ]);

  const [toggles, setToggles] = useState({
    showOnReport: true,
    requiredField: false,
  });

  const handleChange = (
    id: number,
    field: "status" | "interpretation",
    value: string
  ) => {
    setOptions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const toggleSwitch = (
    key: keyof typeof toggles
  ) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Yes & No Cards */}
      {options.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-pneutral-200 bg-white p-4"
        >
          <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-[40px_1fr_1fr]">
            {/* Label */}
            <div>
              <p className="h-11 flex items-center text-p3 font-semibold text-pneutral-900">
                {item.label}
              </p>
            </div>

            {/* Status */}
            <div>
              <select
                value={item.status}
                onChange={(e) =>
                  handleChange(
                    item.id,
                    "status",
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition focus:border-secondary-500"
              >
                <option>Normal</option>
                <option>Abnormal</option>
                <option>Borderline</option>
              </select>
            </div>

            {/* Interpretation */}
            <div>


              <input
                type="text"
                value={item.interpretation}
                onChange={(e) =>
                  handleChange(
                    item.id,
                    "interpretation",
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition focus:border-secondary-500"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Toggles */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Show on Report */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              toggleSwitch("showOnReport")
            }
            className={`relative h-6 w-12 rounded-full transition-all duration-300 ${
              toggles.showOnReport
                ? "bg-secondary-700"
                : "bg-pneutral-200"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
                toggles.showOnReport
                  ? "left-7"
                  : "left-1"
              }`}
            />
          </button>

          <p className="text-p2 font-medium text-pneutral-900">
            Show on report
          </p>
        </div>

        {/* Required Field */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              toggleSwitch("requiredField")
            }
            className={`relative h-6 w-12 rounded-full transition-all duration-300 ${
              toggles.requiredField
                ? "bg-secondary-700"
                : "bg-pneutral-200"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
                toggles.requiredField
                  ? "left-7"
                  : "left-1"
              }`}
            />
          </button>

          <p className="text-p2 font-medium text-pneutral-900">
            Required field
          </p>
        </div>
      </div>
    </div>
  );
};

export default YesNo;