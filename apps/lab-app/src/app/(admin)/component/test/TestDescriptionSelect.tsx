'use client';
import { useMemo } from "react";
import SearchableSelect, { SearchableSelectOption } from "../common/SearchableSelect";

// Description types that drive special behaviour (hidden ranges, report editor, dropdown options).
const SPECIAL_TYPES: SearchableSelectOption[] = [
  { value: "DESCRIPTION", label: "Description" },
  { value: "NUMERIC", label: "Numeric" },
  { value: "DROPDOWN", label: "Dropdown - Yes/No" },
  { value: "DROPDOWN-POSITIVE/NEGATIVE", label: "Dropdown - Positive/Negative" },
  { value: "DROPDOWN-PRESENT/ABSENT", label: "Dropdown - Present/Absent" },
  { value: "DROPDOWN-REACTIVE/NONREACTIVE", label: "Dropdown - Reactive/Nonreactive" },
  { value: "DROPDOWN-PERCENTAGE", label: "Dropdown - Percentage" },
  { value: "DROPDOWN-COMPATIBLE/INCOMPATIBLE", label: "Dropdown - Compatible/Incompatible" },
  { value: "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE", label: "Dropdown with Description - Reactive/Nonreactive" },
  { value: "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT", label: "Dropdown with Description - Present/Absent" },
  { value: "DETAILED REPORT", label: "Detailed Report" },
];

interface TestDescriptionSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TestDescriptionSelect = ({ value, onChange, disabled }: TestDescriptionSelectProps) => {
  const options = useMemo(() => {
    // Keep a stored value selectable even if it is not one of the built-in types.
    if (value && !SPECIAL_TYPES.some(o => o.value === value)) {
      return [{ value, label: value }, ...SPECIAL_TYPES];
    }
    return SPECIAL_TYPES;
  }, [value]);

  return (
    <SearchableSelect
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder="Select test reference description"
      searchPlaceholder="Search description..."
      emptyText="No description found"
    />
  );
};

export default TestDescriptionSelect;
