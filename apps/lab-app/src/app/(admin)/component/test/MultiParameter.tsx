"use client";

import { useState } from "react";
import { BsGripVertical } from "react-icons/bs";
import { HiOutlineTrash } from "react-icons/hi2";

type StatusType = "Normal" | "Borderline" | "Abnormal" | "Critical";

type ParamResultType =
  | "Numeric"
  | "Dropdown/Select"
  | "Text"
  | "Textarea"
  | "Positive / Negative"
  | "Yes / No"
  | "Set Range";

const resultTypes: ParamResultType[] = [
  "Numeric",
  "Dropdown/Select",
  "Text",
  "Textarea",
  "Positive / Negative",
  "Yes / No",
  "Set Range",
];

interface DropdownOption {
  id: number;
  label: string;
  value: string;
  status: StatusType;
  interpretation: string;
  isDefault: boolean;
}

interface BinaryOption {
  id: number;
  label: string;
  status: StatusType;
  interpretation: string;
}

interface RangeRow {
  id: number;
  label: string;
  from: string;
  to: string;
  status: StatusType;
  interpretation: string;
}

interface NumericConfig {
  normalMin: string;
  normalMax: string;
  criticalMin: string;
  criticalMax: string;
  borderlineMin: string;
  borderlineMax: string;
  unit: string;
  decimalPlaces: string;
  allowDecimal: boolean;
  allowNegative: boolean;
  showOnReport: boolean;
  autoInterpretation: boolean;
}

interface TextConfig {
  placeholder: string;
  characterLimit: string;
  defaultValue: string;
  showOnReport: boolean;
  requiredField: boolean;
}

interface TextareaConfig {
  placeholder: string;
  characterLimit: string;
  defaultTemplate: string;
  defaultValue: string;
  showOnReport: boolean;
  requiredField: boolean;
  allowMultiline: boolean;
}

interface BinaryConfig {
  options: BinaryOption[];
  showOnReport: boolean;
  requiredField: boolean;
}

interface Parameter {
  id: number;
  name: string;
  resultType: ParamResultType;
  numeric: NumericConfig;
  dropdown: { options: DropdownOption[] };
  text: TextConfig;
  textarea: TextareaConfig;
  positiveNegative: BinaryConfig;
  yesNo: BinaryConfig;
  setRange: { rows: RangeRow[] };
}

const createParameter = (
  id: number,
  name = "",
  resultType: ParamResultType = "Numeric"
): Parameter => ({
  id,
  name,
  resultType,
  numeric: {
    normalMin: "",
    normalMax: "",
    criticalMin: "",
    criticalMax: "",
    borderlineMin: "",
    borderlineMax: "",
    unit: "",
    decimalPlaces: "2",
    allowDecimal: true,
    allowNegative: false,
    showOnReport: true,
    autoInterpretation: true,
  },
  dropdown: {
    options: [
      {
        id: id + 1,
        label: "",
        value: "",
        status: "Normal",
        interpretation: "",
        isDefault: true,
      },
    ],
  },
  text: {
    placeholder: "",
    characterLimit: "500",
    defaultValue: "",
    showOnReport: true,
    requiredField: false,
  },
  textarea: {
    placeholder: "",
    characterLimit: "500",
    defaultTemplate: "",
    defaultValue: "",
    showOnReport: true,
    requiredField: false,
    allowMultiline: true,
  },
  positiveNegative: {
    options: [
      { id: id + 2, label: "Positive", status: "Abnormal", interpretation: "" },
      { id: id + 3, label: "Negative", status: "Normal", interpretation: "" },
    ],
    showOnReport: true,
    requiredField: false,
  },
  yesNo: {
    options: [
      { id: id + 4, label: "Yes", status: "Abnormal", interpretation: "" },
      { id: id + 5, label: "No", status: "Normal", interpretation: "" },
    ],
    showOnReport: true,
    requiredField: false,
  },
  setRange: {
    rows: [
      {
        id: id + 6,
        label: "",
        from: "",
        to: "",
        status: "Normal",
        interpretation: "",
      },
    ],
  },
});

const inputClass =
  "h-10 w-full rounded-lg border border-pneutral-300 bg-white px-3 text-p2 outline-none transition-all focus:border-secondary-500";
const numericInputClass =
  "h-10 w-full rounded-lg border border-pneutral-200 bg-white px-3 text-p2 outline-none transition-all focus:border-success-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const criticalInputClass =
  "h-10 w-full rounded-lg border border-warning-200 bg-white px-3 text-p2 outline-none transition-all focus:border-warning-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const ToggleSwitch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-12 shrink-0 rounded-full transition-all duration-300 ${
        checked ? "bg-secondary-700" : "bg-pneutral-200"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
    <p className="text-p2 font-medium text-pneutral-900">{label}</p>
  </div>
);

let seed = 100;
const nextId = () => {
  seed += 1;
  return seed;
};

const MultiParameter = () => {
  const [parameters, setParameters] = useState<Parameter[]>([
    createParameter(1, "Total Cholesterol", "Numeric"),
    createParameter(20, "HIV I & II Screening", "Positive / Negative"),
  ]);

  const updateParameter = (
    id: number,
    updater: (p: Parameter) => Parameter
  ) => {
    setParameters((prev) =>
      prev.map((p) => (p.id === id ? updater(p) : p))
    );
  };

  const addParameter = () => {
    setParameters((prev) => [...prev, createParameter(nextId())]);
  };

  const removeParameter = (id: number) => {
    setParameters((prev) => prev.filter((p) => p.id !== id));
  };

  const handleNameChange = (id: number, value: string) =>
    updateParameter(id, (p) => ({ ...p, name: value }));

  const handleResultTypeChange = (id: number, type: ParamResultType) =>
    updateParameter(id, (p) => ({ ...p, resultType: type }));

  // Numeric
  const handleNumericChange = (
    id: number,
    field: keyof NumericConfig,
    value: string
  ) =>
    updateParameter(id, (p) => ({
      ...p,
      numeric: { ...p.numeric, [field]: value },
    }));

  const toggleNumeric = (
    id: number,
    key: "allowDecimal" | "allowNegative" | "showOnReport" | "autoInterpretation"
  ) =>
    updateParameter(id, (p) => ({
      ...p,
      numeric: { ...p.numeric, [key]: !p.numeric[key] },
    }));

  // Dropdown
  const handleDropdownOptionChange = (
    id: number,
    optionId: number,
    field: keyof DropdownOption,
    value: string
  ) =>
    updateParameter(id, (p) => ({
      ...p,
      dropdown: {
        options: p.dropdown.options.map((o) =>
          o.id === optionId ? { ...o, [field]: value } : o
        ),
      },
    }));

  const setDropdownDefault = (id: number, optionId: number) =>
    updateParameter(id, (p) => ({
      ...p,
      dropdown: {
        options: p.dropdown.options.map((o) => ({
          ...o,
          isDefault: o.id === optionId,
        })),
      },
    }));

  const addDropdownOption = (id: number) =>
    updateParameter(id, (p) => ({
      ...p,
      dropdown: {
        options: [
          ...p.dropdown.options,
          {
            id: nextId(),
            label: "",
            value: "",
            status: "Normal",
            interpretation: "",
            isDefault: false,
          },
        ],
      },
    }));

  const removeDropdownOption = (id: number, optionId: number) =>
    updateParameter(id, (p) => ({
      ...p,
      dropdown: {
        options: p.dropdown.options.filter((o) => o.id !== optionId),
      },
    }));

  // Text
  const handleTextChange = (
    id: number,
    field: keyof TextConfig,
    value: string
  ) =>
    updateParameter(id, (p) => ({
      ...p,
      text: { ...p.text, [field]: value },
    }));

  const toggleText = (id: number, key: "showOnReport" | "requiredField") =>
    updateParameter(id, (p) => ({
      ...p,
      text: { ...p.text, [key]: !p.text[key] },
    }));

  // Textarea
  const handleTextareaChange = (
    id: number,
    field: keyof TextareaConfig,
    value: string
  ) =>
    updateParameter(id, (p) => ({
      ...p,
      textarea: { ...p.textarea, [field]: value },
    }));

  const toggleTextarea = (
    id: number,
    key: "showOnReport" | "requiredField" | "allowMultiline"
  ) =>
    updateParameter(id, (p) => ({
      ...p,
      textarea: { ...p.textarea, [key]: !p.textarea[key] },
    }));

  // Positive/Negative & Yes/No share the same shape
  const handleBinaryChange = (
    id: number,
    section: "positiveNegative" | "yesNo",
    optionId: number,
    field: "status" | "interpretation",
    value: string
  ) =>
    updateParameter(id, (p) => ({
      ...p,
      [section]: {
        ...p[section],
        options: p[section].options.map((o) =>
          o.id === optionId ? { ...o, [field]: value } : o
        ),
      },
    }));

  const toggleBinary = (
    id: number,
    section: "positiveNegative" | "yesNo",
    key: "showOnReport" | "requiredField"
  ) =>
    updateParameter(id, (p) => ({
      ...p,
      [section]: { ...p[section], [key]: !p[section][key] },
    }));

  // Set Range
  const handleRangeRowChange = (
    id: number,
    rowId: number,
    field: keyof RangeRow,
    value: string
  ) =>
    updateParameter(id, (p) => ({
      ...p,
      setRange: {
        rows: p.setRange.rows.map((r) =>
          r.id === rowId ? { ...r, [field]: value } : r
        ),
      },
    }));

  const addRangeRow = (id: number) =>
    updateParameter(id, (p) => ({
      ...p,
      setRange: {
        rows: [
          ...p.setRange.rows,
          {
            id: nextId(),
            label: "",
            from: "",
            to: "",
            status: "Normal",
            interpretation: "",
          },
        ],
      },
    }));

  const removeRangeRow = (id: number, rowId: number) =>
    updateParameter(id, (p) => ({
      ...p,
      setRange: { rows: p.setRange.rows.filter((r) => r.id !== rowId) },
    }));

  const badgeClasses = (status: StatusType) => {
    switch (status) {
      case "Normal":
        return "border border-success-300 bg-success-50 text-success-700";
      case "Borderline":
        return "border border-warning-300 bg-warning-50 text-warning-700";
      case "Abnormal":
        return "border border-danger-300 bg-danger-50 text-danger-700";
      case "Critical":
        return "border border-danger-500 bg-danger-100 text-danger-800";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameter Cards */}
      {parameters.map((param, index) => (
        <div
          key={param.id}
          className="rounded-xl border border-pneutral-200 bg-white p-5"
        >
          <div className="flex items-start gap-3">
            <div className="mt-2 flex flex-col items-center gap-2">
              <BsGripVertical size={16} className="text-secondary-300" />
              <span className="text-label-l3 font-semibold text-pneutral-400">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-5">
              {/* Name + Remove */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                    Parameter Name
                  </label>
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) =>
                      handleNameChange(param.id, e.target.value)
                    }
                    placeholder="e.g. Total Cholesterol"
                    className={inputClass}
                  />
                </div>

                {parameters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParameter(param.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-warning-500 text-warning-500 transition-colors hover:bg-warning-50"
                    title="Remove Parameter"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                )}
              </div>

              {/* Result Type Selector */}
              <div>
                <label className="mb-2 block text-label-l3 font-medium text-pneutral-700">
                  Result Type
                </label>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {resultTypes.map((type) => {
                    const active = param.resultType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          handleResultTypeChange(param.id, type)
                        }
                        className={`rounded-lg border p-2 transition-all ${
                          active
                            ? "border-secondary-700 bg-secondary-50"
                            : "border-pneutral-200 bg-white"
                        }`}
                      >
                        <p
                          className={`text-p3 font-semibold text-center ${
                            active
                              ? "text-secondary-600"
                              : "text-pneutral-900"
                          }`}
                        >
                          {type}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ---------------- Numeric ---------------- */}
              {param.resultType === "Numeric" && (
                <div className="space-y-5 rounded-xl border border-pneutral-200 bg-pneutral-50 p-4">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-success-700" />
                        <h4 className="text-p3 font-semibold text-success-800">
                          Normal Range
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={param.numeric.normalMin}
                          onChange={(e) =>
                            handleNumericChange(
                              param.id,
                              "normalMin",
                              e.target.value
                            )
                          }
                          placeholder="Min"
                          className={numericInputClass}
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={param.numeric.normalMax}
                          onChange={(e) =>
                            handleNumericChange(
                              param.id,
                              "normalMax",
                              e.target.value
                            )
                          }
                          placeholder="Max"
                          className={numericInputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-warning-500" />
                        <h4 className="text-p3 font-semibold text-warning-600">
                          Critical Values
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={param.numeric.criticalMin}
                          onChange={(e) =>
                            handleNumericChange(
                              param.id,
                              "criticalMin",
                              e.target.value
                            )
                          }
                          placeholder="Min"
                          className={criticalInputClass}
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={param.numeric.criticalMax}
                          onChange={(e) =>
                            handleNumericChange(
                              param.id,
                              "criticalMax",
                              e.target.value
                            )
                          }
                          placeholder="Max"
                          className={criticalInputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-danger-500" />
                        <h4 className="text-p3 font-semibold text-warning-600">
                          Borderline Range
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={param.numeric.borderlineMin}
                          onChange={(e) =>
                            handleNumericChange(
                              param.id,
                              "borderlineMin",
                              e.target.value
                            )
                          }
                          placeholder="Min"
                          className="h-10 w-full rounded-lg border border-danger-300 bg-white px-3 text-p2 outline-none transition-all focus:border-danger-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          value={param.numeric.borderlineMax}
                          onChange={(e) =>
                            handleNumericChange(
                              param.id,
                              "borderlineMax",
                              e.target.value
                            )
                          }
                          placeholder="Max"
                          className="h-10 w-full rounded-lg border border-danger-300 bg-white px-3 text-p2 outline-none transition-all focus:border-danger-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-success-700" />
                        <h4 className="text-p3 font-semibold text-success-800">
                          Units & Dimension
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={param.numeric.unit}
                          onChange={(e) =>
                            handleNumericChange(
                              param.id,
                              "unit",
                              e.target.value
                            )
                          }
                          placeholder="e.g. mg/dL"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={param.numeric.decimalPlaces}
                          onChange={(e) =>
                            handleNumericChange(
                              param.id,
                              "decimalPlaces",
                              e.target.value
                            )
                          }
                          placeholder="Decimals"
                          className="h-10 w-full rounded-lg border border-pneutral-300 bg-white px-3 text-p2 outline-none transition-all focus:border-secondary-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ToggleSwitch
                      checked={param.numeric.allowDecimal}
                      onChange={() => toggleNumeric(param.id, "allowDecimal")}
                      label="Allow Decimal Input"
                    />
                    <ToggleSwitch
                      checked={param.numeric.autoInterpretation}
                      onChange={() =>
                        toggleNumeric(param.id, "autoInterpretation")
                      }
                      label="Auto-flag Abnormal Result"
                    />
                    <ToggleSwitch
                      checked={param.numeric.allowNegative}
                      onChange={() =>
                        toggleNumeric(param.id, "allowNegative")
                      }
                      label="Allow Negative Values"
                    />
                    <ToggleSwitch
                      checked={param.numeric.showOnReport}
                      onChange={() =>
                        toggleNumeric(param.id, "showOnReport")
                      }
                      label="Show on Report"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- Dropdown / Select ---------------- */}
              {param.resultType === "Dropdown/Select" && (
                <div className="space-y-4 rounded-xl border border-pneutral-200 bg-pneutral-50 p-4">
                  {param.dropdown.options.map((option) => (
                    <div
                      key={option.id}
                      className={`rounded-lg border p-4 transition-all ${
                        option.isDefault
                          ? "border-secondary-500 bg-secondary-50"
                          : "border-pneutral-200 bg-white"
                      }`}
                    >
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) =>
                            handleDropdownOptionChange(
                              param.id,
                              option.id,
                              "label",
                              e.target.value
                            )
                          }
                          placeholder="Option Label"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={option.value}
                          onChange={(e) =>
                            handleDropdownOptionChange(
                              param.id,
                              option.id,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder="Option Value"
                          className={inputClass}
                        />
                        <select
                          value={option.status}
                          onChange={(e) =>
                            handleDropdownOptionChange(
                              param.id,
                              option.id,
                              "status",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        >
                          <option>Normal</option>
                          <option>Borderline</option>
                          <option>Abnormal</option>
                          <option>Critical</option>
                        </select>
                        <div
                          className={`flex h-10 w-fit items-center rounded-md px-3 text-label-l3 font-medium ${badgeClasses(
                            option.status
                          )}`}
                        >
                          {option.status}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setDropdownDefault(param.id, option.id)
                            }
                            className={`h-10 flex-1 rounded-full px-3 text-label-l3 font-medium transition ${
                              option.isDefault
                                ? "bg-secondary-700 text-white"
                                : "border border-pneutral-300 bg-white text-pneutral-600 hover:border-secondary-500"
                            }`}
                          >
                            Default
                          </button>
                          {param.dropdown.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeDropdownOption(param.id, option.id)
                              }
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-warning-500 text-warning-500 transition-colors hover:bg-warning-50"
                              title="Remove Option"
                            >
                              <HiOutlineTrash size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={option.interpretation}
                        onChange={(e) =>
                          handleDropdownOptionChange(
                            param.id,
                            option.id,
                            "interpretation",
                            e.target.value
                          )
                        }
                        placeholder="Interpretation"
                        className={`${inputClass} mt-3`}
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addDropdownOption(param.id)}
                    className="inline-flex items-center gap-2 text-p2 font-semibold text-secondary-700 transition hover:text-secondary-800"
                  >
                    <span className="text-lg leading-none">+</span>
                    Add Option
                  </button>
                </div>
              )}

              {/* ---------------- Text ---------------- */}
              {param.resultType === "Text" && (
                <div className="space-y-4 rounded-xl border border-pneutral-200 bg-pneutral-50 p-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <input
                      type="text"
                      value={param.text.placeholder}
                      onChange={(e) =>
                        handleTextChange(
                          param.id,
                          "placeholder",
                          e.target.value
                        )
                      }
                      placeholder="Placeholder Text"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={param.text.characterLimit}
                      onChange={(e) =>
                        handleTextChange(
                          param.id,
                          "characterLimit",
                          e.target.value
                        )
                      }
                      placeholder="Character Limit"
                      className={inputClass}
                    />
                  </div>
                  <input
                    type="text"
                    value={param.text.defaultValue}
                    onChange={(e) =>
                      handleTextChange(
                        param.id,
                        "defaultValue",
                        e.target.value
                      )
                    }
                    placeholder="Default Value (Optional)"
                    className={inputClass}
                  />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ToggleSwitch
                      checked={param.text.showOnReport}
                      onChange={() => toggleText(param.id, "showOnReport")}
                      label="Show on Report"
                    />
                    <ToggleSwitch
                      checked={param.text.requiredField}
                      onChange={() => toggleText(param.id, "requiredField")}
                      label="Required Field"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- Textarea ---------------- */}
              {param.resultType === "Textarea" && (
                <div className="space-y-4 rounded-xl border border-pneutral-200 bg-pneutral-50 p-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <input
                      type="text"
                      value={param.textarea.placeholder}
                      onChange={(e) =>
                        handleTextareaChange(
                          param.id,
                          "placeholder",
                          e.target.value
                        )
                      }
                      placeholder="Placeholder Text"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={param.textarea.characterLimit}
                      onChange={(e) =>
                        handleTextareaChange(
                          param.id,
                          "characterLimit",
                          e.target.value
                        )
                      }
                      placeholder="Character Limit"
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={param.textarea.defaultTemplate}
                    onChange={(e) =>
                      handleTextareaChange(
                        param.id,
                        "defaultTemplate",
                        e.target.value
                      )
                    }
                    placeholder="Default Template"
                    className="w-full resize-none rounded-lg border border-pneutral-300 bg-white px-3 py-3 text-p2 outline-none transition-all focus:border-secondary-500"
                  />
                  <input
                    type="text"
                    value={param.textarea.defaultValue}
                    onChange={(e) =>
                      handleTextareaChange(
                        param.id,
                        "defaultValue",
                        e.target.value
                      )
                    }
                    placeholder="Default Value (Optional)"
                    className={inputClass}
                  />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ToggleSwitch
                      checked={param.textarea.showOnReport}
                      onChange={() =>
                        toggleTextarea(param.id, "showOnReport")
                      }
                      label="Show on Report"
                    />
                    <ToggleSwitch
                      checked={param.textarea.requiredField}
                      onChange={() =>
                        toggleTextarea(param.id, "requiredField")
                      }
                      label="Required Field"
                    />
                    <ToggleSwitch
                      checked={param.textarea.allowMultiline}
                      onChange={() =>
                        toggleTextarea(param.id, "allowMultiline")
                      }
                      label="Allow Multiline"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- Positive / Negative & Yes / No ---------------- */}
              {(param.resultType === "Positive / Negative" ||
                param.resultType === "Yes / No") && (
                <div className="space-y-4 rounded-xl border border-pneutral-200 bg-pneutral-50 p-4">
                  {(param.resultType === "Positive / Negative"
                    ? param.positiveNegative.options
                    : param.yesNo.options
                  ).map((option) => (
                    <div
                      key={option.id}
                      className="rounded-lg border border-pneutral-200 bg-white p-3"
                    >
                      <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[90px_1fr_1fr]">
                        <p className="text-p3 font-semibold text-pneutral-900">
                          {option.label}
                        </p>
                        <select
                          value={option.status}
                          onChange={(e) =>
                            handleBinaryChange(
                              param.id,
                              param.resultType === "Positive / Negative"
                                ? "positiveNegative"
                                : "yesNo",
                              option.id,
                              "status",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        >
                          <option>Normal</option>
                          <option>Abnormal</option>
                          <option>Borderline</option>
                        </select>
                        <input
                          type="text"
                          value={option.interpretation}
                          onChange={(e) =>
                            handleBinaryChange(
                              param.id,
                              param.resultType === "Positive / Negative"
                                ? "positiveNegative"
                                : "yesNo",
                              option.id,
                              "interpretation",
                              e.target.value
                            )
                          }
                          placeholder="Interpretation"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ToggleSwitch
                      checked={
                        param.resultType === "Positive / Negative"
                          ? param.positiveNegative.showOnReport
                          : param.yesNo.showOnReport
                      }
                      onChange={() =>
                        toggleBinary(
                          param.id,
                          param.resultType === "Positive / Negative"
                            ? "positiveNegative"
                            : "yesNo",
                          "showOnReport"
                        )
                      }
                      label="Show on Report"
                    />
                    <ToggleSwitch
                      checked={
                        param.resultType === "Positive / Negative"
                          ? param.positiveNegative.requiredField
                          : param.yesNo.requiredField
                      }
                      onChange={() =>
                        toggleBinary(
                          param.id,
                          param.resultType === "Positive / Negative"
                            ? "positiveNegative"
                            : "yesNo",
                          "requiredField"
                        )
                      }
                      label="Required Field"
                    />
                  </div>
                </div>
              )}

              {/* ---------------- Set Range ---------------- */}
              {param.resultType === "Set Range" && (
                <div className="space-y-4 rounded-xl border border-pneutral-200 bg-pneutral-50 p-4">
                  <div className="overflow-x-auto">
                    <div className="min-w-[820px]">
                      <div className="grid grid-cols-[140px_80px_80px_110px_1fr_40px] gap-2 border-b border-pneutral-200 pb-2">
                        <h4 className="text-p3 font-semibold text-pneutral-700">
                          Label
                        </h4>
                        <h4 className="text-p3 font-semibold text-pneutral-700">
                          From
                        </h4>
                        <h4 className="text-p3 font-semibold text-pneutral-700">
                          To
                        </h4>
                        <h4 className="text-p3 font-semibold text-pneutral-700">
                          Status
                        </h4>
                        <h4 className="text-p3 font-semibold text-pneutral-700">
                          Interpretation
                        </h4>
                        <div />
                      </div>

                      <div className="divide-y divide-pneutral-200">
                        {param.setRange.rows.map((row) => (
                          <div
                            key={row.id}
                            className="grid grid-cols-[140px_80px_80px_110px_1fr_40px] gap-2 py-3 items-center"
                          >
                            <input
                              type="text"
                              value={row.label}
                              onChange={(e) =>
                                handleRangeRowChange(
                                  param.id,
                                  row.id,
                                  "label",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={row.from}
                              onChange={(e) =>
                                handleRangeRowChange(
                                  param.id,
                                  row.id,
                                  "from",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={row.to}
                              onChange={(e) =>
                                handleRangeRowChange(
                                  param.id,
                                  row.id,
                                  "to",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                            />
                            <select
                              value={row.status}
                              onChange={(e) =>
                                handleRangeRowChange(
                                  param.id,
                                  row.id,
                                  "status",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                            >
                              <option>Normal</option>
                              <option>Borderline</option>
                              <option>Abnormal</option>
                              <option>Critical</option>
                            </select>
                            <input
                              type="text"
                              value={row.interpretation}
                              onChange={(e) =>
                                handleRangeRowChange(
                                  param.id,
                                  row.id,
                                  "interpretation",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                            />
                            <div className="flex justify-center">
                              {param.setRange.rows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeRangeRow(param.id, row.id)
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-full border border-warning-500 text-warning-500 transition-colors hover:bg-warning-50"
                                  title="Remove Row"
                                >
                                  <HiOutlineTrash size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addRangeRow(param.id)}
                    className="inline-flex items-center gap-2 text-p2 font-semibold text-secondary-700 transition hover:text-secondary-800"
                  >
                    <span className="text-lg leading-none">+</span>
                    Add Range Row
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add Parameter */}
      <button
        type="button"
        onClick={addParameter}
        className="flex h-11 w-1/4 items-center justify-center gap-2 rounded-full border border-dashed border-secondary-300 text-p2 font-semibold text-secondary-700 transition hover:border-secondary-500 hover:bg-secondary-50"
      >
        <span className="text-lg leading-none">+</span>
        Add Parameter
      </button>
    </div>
  );
};

export default MultiParameter;
