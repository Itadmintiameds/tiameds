"use client";

import { HiOutlineDotsVertical } from "react-icons/hi";

type StatusType = "Normal" | "Borderline" | "Critical";

export interface DropdownOption {
  id: number;
  label: string;
  value: string;
  status: StatusType;
  interpretation: string;
  isDefault: boolean;
}

export const defaultDropdownOptions: DropdownOption[] = [
  {
    id: 1,
    label: "Reactive",
    value: "reactive",
    status: "Normal",
    interpretation:
      "Positive result — further confirmation required",
    isDefault: true,
  },
  {
    id: 2,
    label: "Non-Reactive",
    value: "non_reactive",
    status: "Borderline",
    interpretation: "Pathogen / antigen detected",
    isDefault: false,
  },
  {
    id: 3,
    label: "Negative",
    value: "negative",
    status: "Normal",
    interpretation:
      "Positive result — further confirmation required",
    isDefault: false,
  },
];

interface DropdownProps {
  options: DropdownOption[];
  onOptionsChange: (options: DropdownOption[]) => void;
}

const Dropdown = ({ options, onOptionsChange }: DropdownProps) => {
  const handleChange = (
    id: number,
    field: keyof DropdownOption,
    value: string
  ) => {
    onOptionsChange(
      options.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSetDefault = (id: number) => {
    onOptionsChange(
      options.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    );
  };

  const addOption = () => {
    onOptionsChange([
      ...options,
      {
        id: Date.now(),
        label: "",
        value: "",
        status: "Normal",
        interpretation: "",
        isDefault: false,
      },
    ]);
  };

  const badgeClasses = (status: StatusType) => {
    switch (status) {
      case "Normal":
        return "border border-success-300 bg-success-50 text-success-700";

      case "Borderline":
        return "border border-warning-300 bg-warning-50 text-warning-700";

      case "Critical":
        return "border border-danger-300 bg-danger-50 text-danger-700";

      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {options.map((option, index) => (
        <div
          key={option.id}
          className={`rounded-xl border p-5 transition-all ${
            option.isDefault
              ? "border-secondary-500 bg-secondary-50"
              : "border-pneutral-200 bg-white"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <HiOutlineDotsVertical
                className="mt-1 text-secondary-400"
                size={18}
              />

              <span className="mt-0.5 text-label-l3 font-medium text-pneutral-400">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="flex-1 space-y-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                {/* Option Label */}
                <div>
                  <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                    Option Label
                  </label>

                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) =>
                      handleChange(
                        option.id,
                        "label",
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-pneutral-300 px-3 text-p2 outline-none transition focus:border-secondary-500"
                  />
                </div>

                {/* Option Value */}
                <div>
                  <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                    Option Value
                  </label>

                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) =>
                      handleChange(
                        option.id,
                        "value",
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-pneutral-300 px-3 text-p2 outline-none transition focus:border-secondary-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                    Status Mapping
                  </label>

                  <select
                    value={option.status}
                    onChange={(e) =>
                      handleChange(
                        option.id,
                        "status",
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-pneutral-300 bg-white px-3 text-p2 outline-none transition focus:border-secondary-500"
                  >
                    <option>Normal</option>
                    <option>Borderline</option>
                    <option>Critical</option>
                  </select>
                </div>

                {/* Badge + Default */}
                <div className="flex flex-col gap-3">
                  <div
                    className={`inline-flex w-fit rounded-md px-3 py-1 text-label-l3 font-medium ${badgeClasses(
                      option.status
                    )}`}
                  >
                    {option.status}
                  </div>

                  <button
                    onClick={() =>
                      handleSetDefault(option.id)
                    }
                    className={`h-9 rounded-full px-4 text-label-l3 font-medium transition ${
                      option.isDefault
                        ? "bg-secondary-700 text-white"
                        : "border border-pneutral-300 bg-white text-pneutral-600 hover:border-secondary-500"
                    }`}
                  >
                    Set Default
                  </button>
                </div>
              </div>

              {/* Interpretation */}
              <div>
                <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                  Interpretation
                </label>

                <input
                  type="text"
                  value={option.interpretation}
                  onChange={(e) =>
                    handleChange(
                      option.id,
                      "interpretation",
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-lg border border-pneutral-300 px-3 text-p2 outline-none transition focus:border-secondary-500"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
            {/* Add Option */}
      <button
        type="button"
        onClick={addOption}
        className="inline-flex items-center gap-2 text-p2 font-semibold text-secondary-700 transition hover:text-secondary-800"
      >
        <span className="text-lg leading-none">+</span>
        Add Option
      </button>
    </div>
  );
};

export default Dropdown;