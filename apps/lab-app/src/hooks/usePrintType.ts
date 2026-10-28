import { useState } from 'react';
import { DEFAULT_PRINT_TYPE, isLetterheadPrintType, showsLabHeader } from '@/utils/printType';
import type { PrintType } from '@/utils/printType';

// The Print Type choice for a printable document. Plain component state on purpose: the choice is
// per open modal and resets to plain on the next open, exactly as the invoice has always behaved.
// Generic so the invoice can keep its extra 'letterhead-dept' / 'plain-dept' values.
export const usePrintType = <T extends string = PrintType>(initialPrintType: T = DEFAULT_PRINT_TYPE as T) => {
  const [printType, setPrintType] = useState<T>(initialPrintType);

  return {
    printType,
    setPrintType,
    isLetterhead: isLetterheadPrintType(printType),
    showLabHeader: showsLabHeader(printType),
  };
};
