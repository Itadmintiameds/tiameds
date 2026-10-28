'use client';

import { useId } from 'react';
import type { PrintTypeOption } from '@/utils/printType';

interface PrintTypeSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: PrintTypeOption<T>[];
  disabled?: boolean;
}

// The "Print Type" dropdown shared by the invoice and the lab report so both toolbars render
// the same control. Full width on phones, natural width from the sm breakpoint up.
const PrintTypeSelect = <T extends string>({ value, onChange, options, disabled }: PrintTypeSelectProps<T>) => {
  const selectId = useId();

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <label htmlFor={selectId} className="text-sm font-medium whitespace-nowrap">Print Type:</label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="border rounded px-2 py-1 text-sm min-w-0 flex-1 sm:flex-none sm:min-w-[220px]"
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

export default PrintTypeSelect;
