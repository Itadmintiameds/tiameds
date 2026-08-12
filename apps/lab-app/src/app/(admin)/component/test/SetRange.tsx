"use client";

import { useState } from "react";
import { BsGripVertical } from "react-icons/bs";

type StatusType =
  | "Normal"
  | "Borderline"
  | "Abnormal"
  | "Critical";

interface RangeRow {
  id: number;
  label: string;
  from: string;
  to: string;
  status: StatusType;
  interpretation: string;
}

const SetRange = () => {
  const [rows, setRows] = useState<RangeRow[]>([
    {
      id: 1,
      label: "Deficient",
      from: "0",
      to: "20",
      status: "Abnormal",
      interpretation:
        "Vitamin D deficiency — supplementation required",
    },
    {
      id: 2,
      label: "Insufficient",
      from: "20",
      to: "30",
      status: "Borderline",
      interpretation:
        "Sub-optimal level — monitor and supplement",
    },
    {
      id: 3,
      label: "Sufficient",
      from: "30",
      to: "100",
      status: "Normal",
      interpretation: "Adequate Vitamin D level",
    },
    {
      id: 4,
      label: "Toxicity",
      from: ">100",
      to: "999",
      status: "Critical",
      interpretation:
        "Elevated level — review supplementation",
    },
  ]);

  const handleChange = (
    id: number,
    field: keyof RangeRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: "",
        from: "",
        to: "",
        status: "Normal",
        interpretation: "",
      },
    ]);
  };

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <div className="min-w-[950px]">
          {/* Header */}
          <div className="grid grid-cols-[40px_170px_80px_80px_120px_1fr] gap-3 border-b border-pneutral-200 pb-3 px-2">
            <div />

            <h4 className="text-p3 font-semibold text-pneutral-700">
              Label
            </h4>

            <h4 className="text-p3 font-semibold text-pneutral-700">
              From Value
            </h4>

            <h4 className="text-p3 font-semibold text-pneutral-700">
              To Value
            </h4>

            <h4 className="text-p3 font-semibold text-pneutral-700">
              Status
            </h4>

            <h4 className="text-p3 font-semibold text-pneutral-700">
              Interpretation
            </h4>
          </div>

          {/* Rows */}
          <div className="divide-y divide-pneutral-200">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[40px_170px_80px_80px_120px_1fr] gap-2 py-4 items-center"
              >
                {/* Drag */}
                <div className="flex justify-center">
                  <BsGripVertical
                    size={16}
                    className="text-secondary-300"
                  />
                </div>

                {/* Label */}
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) =>
                    handleChange(
                      row.id,
                      "label",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition-all focus:border-secondary-500"
                />

                {/* From */}
                <input
                  type="text"
                  value={row.from}
                  onChange={(e) =>
                    handleChange(
                      row.id,
                      "from",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition-all focus:border-secondary-500"
                />

                {/* To */}
                <input
                  type="text"
                  value={row.to}
                  onChange={(e) =>
                    handleChange(
                      row.id,
                      "to",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition-all focus:border-secondary-500"
                />

                {/* Status */}
                <select
                  value={row.status}
                  onChange={(e) =>
                    handleChange(
                      row.id,
                      "status",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition-all focus:border-secondary-500"
                >
                  <option>Normal</option>
                  <option>Borderline</option>
                  <option>Abnormal</option>
                  <option>Critical</option>
                </select>

                {/* Interpretation */}
                <input
                  type="text"
                  value={row.interpretation}
                  onChange={(e) =>
                    handleChange(
                      row.id,
                      "interpretation",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-lg border border-pneutral-300 bg-white px-4 text-p2 outline-none transition-all focus:border-secondary-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Row */}
      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-2 text-p2 font-semibold text-secondary-700 transition hover:text-secondary-800"
      >
        <span className="text-lg leading-none">+</span>
        Add Range Row
      </button>
    </div>
  );
};

export default SetRange;