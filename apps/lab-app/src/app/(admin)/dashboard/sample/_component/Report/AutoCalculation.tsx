import { TestReferancePoint } from '@/types/test/testlist';

export interface AutoCalculationResult {
  updatedInputs: Record<string | number, string>;
  differentialValidation?: {
    total: number;
    type: string;
    message: string;
    calculation: string;
  } | null;
}

export class AutoCalculation {

  /**
   * Helper to find index by description with multiple matching patterns
   */
  private static findIndexByDescription(
    referenceData: TestReferancePoint[], 
    searchTerms: string[],
    exactMatch: boolean = false
  ): number {
    return referenceData.findIndex(point => {
      const description = point.testDescription?.toUpperCase() || '';
      return searchTerms.some(term => {
        const upperTerm = term.toUpperCase();
        if (exactMatch) {
          return description === upperTerm;
        }
        return description.includes(upperTerm) || upperTerm.includes(description);
      });
    });
  }

  /**
   * Helper to get numeric value from inputs
   */
  private static getNumericValue(inputs: Record<string | number, string>, index: number): number | null {
    const val = inputs[index];
    if (!val || isNaN(Number(val))) return null;
    return parseFloat(val);
  }

  /**
   * Helper to set value in inputs
   */
  private static setValue(inputs: Record<string | number, string>, index: number, value: string) {
    inputs[index] = value;
  }

  /**
   * Calculate auto fields for any test
   */
  static calculate(testName: string, inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
    const updatedInputs = { ...inputs };
    const testNameUpper = testName.toUpperCase();

    if (testNameUpper.includes('COMPLETE BLOOD COUNT') || testNameUpper.includes('CBC')) {
      return this.calculateCBC(updatedInputs, referenceData);
    }

    if (testNameUpper.includes('LIVER FUNCTION TEST') || testNameUpper.includes('LFT')) {
      return this.calculateLFT(updatedInputs, referenceData);
    }

    if (testNameUpper.includes('LIPID PROFILE') || testNameUpper.includes('LPT')) {
      return this.calculateLPT(updatedInputs, referenceData);
    }

    if (testNameUpper.includes('HB A1 C') || testNameUpper.includes('GLYCOSYLATED') || testNameUpper.includes('HBA1C')) {
      return this.calculateHbA1c(updatedInputs, referenceData);
    }

    if (testNameUpper.includes('AEC')) {
      return this.calculateAEC(updatedInputs, referenceData);
    }

    return { updatedInputs };
  }

  /**
   * CBC Auto-calculations - Only differential count validation
   */
  private static calculateCBC(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
    const updatedInputs = { ...inputs };

    const differentialFields = ['NEUTROPHILS', 'LYMPHOCYTES', 'EOSINOPHILS', 'MONOCYTES', 'BASOPHILS'];
    let total = 0;
    let hasValues = false;
    const fieldValues: { [key: string]: number } = {};
    const calculationParts: string[] = [];

    referenceData.forEach((point, index) => {
      const pointDescription = point.testDescription?.toUpperCase() || '';
      const matchingField = differentialFields.find(field =>
        pointDescription.includes(field)
      );

      if (matchingField) {
        const fieldValue = inputs[index];
        if (fieldValue && !isNaN(Number(fieldValue))) {
          const numValue = Number(fieldValue);
          total += numValue;
          fieldValues[matchingField] = numValue;
          calculationParts.push(numValue.toString());
          hasValues = true;
        }
      }
    });

    let differentialValidation = null;

    if (hasValues) {
      const filledFieldsCount = Object.keys(fieldValues).length;
      const totalFields = 5;
      const calculationString = calculationParts.join('+');

      if (filledFieldsCount === totalFields) {
        if (total > 100) {
          differentialValidation = {
            type: 'error',
            message: `Differential count: ${calculationString} = ${total} (greater than 100)`,
            total,
            calculation: calculationString
          };
        } else if (total === 100) {
          differentialValidation = {
            type: 'success',
            message: `Differential count: ${calculationString} = ${total} (perfect)`,
            total,
            calculation: calculationString
          };
        } else {
          differentialValidation = {
            type: 'error',
            message: `Differential count: ${calculationString} = ${total} (less than 100)`,
            total,
            calculation: calculationString
          };
        }
      }
    }

    return {
      updatedInputs,
      differentialValidation
    };
  }

  /**
   * LFT Auto-calculations
   */
  private static calculateLFT(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
    const updatedInputs = { ...inputs };

    const totalProteinIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'TOTAL PROTEIN');
    const albuminIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'ALBUMIN' || p.testDescription?.toUpperCase().includes('ALBUMIN'));
    const globulinIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'GLOBULIN' || p.testDescription?.toUpperCase().includes('GLOBULIN'));
    const agRatioIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'A/G RATIO' || p.testDescription?.toUpperCase().includes('A/G RATIO'));
    const totalBilirubinIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'TOTAL BILIRUBIN' || p.testDescription?.toUpperCase().includes('TOTAL BILIRUBIN'));
    const directBilirubinIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'DIRECT BILIRUBIN' || p.testDescription?.toUpperCase().includes('DIRECT BILIRUBIN'));
    const indirectBilirubinIdx = referenceData.findIndex(p => 
      p.testDescription?.toUpperCase() === 'INDIRECT BILIRUBIN' ||
      p.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN')
    );

    const totalProteinRaw = inputs[totalProteinIdx] || '';
    const albuminRaw = inputs[albuminIdx] || '';
    const totalBilirubinRaw = inputs[totalBilirubinIdx] || '';
    const directBilirubinRaw = inputs[directBilirubinIdx] || '';

    // Calculate Globulin = Total Protein - Albumin
    if (globulinIdx >= 0 && totalProteinIdx >= 0 && albuminIdx >= 0) {
      const totalProtein = this.getNumericValue(inputs, totalProteinIdx);
      const albumin = this.getNumericValue(inputs, albuminIdx);
      if (totalProtein !== null && albumin !== null && totalProteinRaw !== '' && albuminRaw !== '') {
        const globulin = totalProtein - albumin;
        this.setValue(updatedInputs, globulinIdx, globulin.toFixed(2));
      }
    }

    // Calculate A/G Ratio = Albumin / Globulin
    if (agRatioIdx >= 0 && albuminIdx >= 0 && globulinIdx >= 0) {
      const albumin = this.getNumericValue(inputs, albuminIdx);
      const globulin = this.getNumericValue(inputs, globulinIdx);
      if (albumin !== null && globulin !== null && globulin > 0 && totalProteinRaw !== '' && albuminRaw !== '') {
        const agRatio = albumin / globulin;
        this.setValue(updatedInputs, agRatioIdx, agRatio.toFixed(2));
      }
    }

    // Calculate Indirect Bilirubin = Total Bilirubin - Direct Bilirubin
    if (indirectBilirubinIdx >= 0 && totalBilirubinIdx >= 0 && directBilirubinIdx >= 0) {
      const totalBilirubin = this.getNumericValue(inputs, totalBilirubinIdx);
      const directBilirubin = this.getNumericValue(inputs, directBilirubinIdx);
      const hasBothBiliInputs = totalBilirubinRaw !== '' && directBilirubinRaw !== '';
      
      if (hasBothBiliInputs && totalBilirubin !== null && directBilirubin !== null) {
        const indirectBilirubin = totalBilirubin - directBilirubin;
        this.setValue(updatedInputs, indirectBilirubinIdx, indirectBilirubin.toFixed(2));
      } else {
        if (inputs[indirectBilirubinIdx] !== '') {
          this.setValue(updatedInputs, indirectBilirubinIdx, '');
        }
      }
    }

    return { updatedInputs };
  }

  /**
   * LPT Auto-calculations
   */
  private static calculateLPT(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
    const updatedInputs = { ...inputs };

    const findIndexByDescription = (description: string) => {
      return referenceData.findIndex(p => 
        p.testDescription?.toUpperCase().includes(description.toUpperCase())
      );
    };

    const totalCholesterolIndex = findIndexByDescription('TOTAL CHOLESTEROL');
    const triglyceridesIndex = findIndexByDescription('TRIGLYCERIDES');
    const hdlCholesterolIndex = findIndexByDescription('HDL CHOLESTEROL - DIRECT');
    const ldlCholesterolIndex = findIndexByDescription('LDL CHOLESTEROL - DIRECT');
    const vldlCholesterolIndex = findIndexByDescription('VLDL CHOLESTEROL');

    let finalTotalIdx = totalCholesterolIndex;
    let finalHdlIdx = hdlCholesterolIndex;
    let finalLdlIdx = ldlCholesterolIndex;

    if (totalCholesterolIndex === -1) {
      finalTotalIdx = referenceData.findIndex(p => 
        p.testDescription?.toUpperCase().includes('CHOLESTEROL') && 
        !p.testDescription?.toUpperCase().includes('HDL') &&
        !p.testDescription?.toUpperCase().includes('LDL') &&
        !p.testDescription?.toUpperCase().includes('VLDL')
      );
    }

    if (hdlCholesterolIndex === -1) {
      finalHdlIdx = referenceData.findIndex(p => 
        p.testDescription?.toUpperCase().includes('HDL')
      );
    }

    if (ldlCholesterolIndex === -1) {
      finalLdlIdx = referenceData.findIndex(p => 
        p.testDescription?.toUpperCase().includes('LDL')
      );
    }

    const totalCholesterol = parseFloat(inputs[finalTotalIdx] || '0') || 0;
    const triglycerides = parseFloat(inputs[triglyceridesIndex] || '0') || 0;
    const hdlCholesterol = parseFloat(inputs[finalHdlIdx] || '0') || 0;

    const calculatedHDL = totalCholesterol > 0 ? (totalCholesterol * 2) / 5 : 0;
    const calculatedLDL = totalCholesterol > 0 && hdlCholesterol > 0 ? totalCholesterol - hdlCholesterol : 0;
    const calculatedVLDL = triglycerides > 0 ? triglycerides / 5 : 0;

    if (finalHdlIdx >= 0 && totalCholesterol > 0) {
      const newValue = calculatedHDL.toFixed(2);
      const currentValue = (inputs[finalHdlIdx] || '').trim();
      if (parseFloat(currentValue) !== parseFloat(newValue)) {
        this.setValue(updatedInputs, finalHdlIdx, newValue);
      }
    } else if (finalHdlIdx >= 0 && inputs[finalHdlIdx] !== '') {
      this.setValue(updatedInputs, finalHdlIdx, '');
    }

    if (finalLdlIdx >= 0 && totalCholesterol > 0 && hdlCholesterol > 0) {
      const newValue = Math.max(0, calculatedLDL).toFixed(2);
      const currentValue = (inputs[finalLdlIdx] || '').trim();
      if (parseFloat(currentValue) !== parseFloat(newValue)) {
        this.setValue(updatedInputs, finalLdlIdx, newValue);
      }
    } else if (finalLdlIdx >= 0 && inputs[finalLdlIdx] !== '') {
      this.setValue(updatedInputs, finalLdlIdx, '');
    }

    if (vldlCholesterolIndex >= 0 && triglycerides > 0) {
      const newValue = calculatedVLDL.toFixed(2);
      const currentValue = (inputs[vldlCholesterolIndex] || '').trim();
      if (parseFloat(currentValue) !== parseFloat(newValue)) {
        this.setValue(updatedInputs, vldlCholesterolIndex, newValue);
      }
    } else if (vldlCholesterolIndex >= 0 && inputs[vldlCholesterolIndex] !== '') {
      this.setValue(updatedInputs, vldlCholesterolIndex, '');
    }

    return { updatedInputs };
  }

  /**
   * HbA1c Auto-calculations
   */
  private static calculateHbA1c(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
    const updatedInputs = { ...inputs };

    const hba1cIdx = this.findIndexByDescription(referenceData, ['HBA1C', 'GLYCOSYLATED']);
    const meanGlucoseIdx = this.findIndexByDescription(referenceData, ['MEAN BLOOD GLUCOSE', 'MEAN GLUCOSE']);

    if (meanGlucoseIdx >= 0 && hba1cIdx >= 0) {
      const hba1c = this.getNumericValue(inputs, hba1cIdx);
      const hba1cRaw = inputs[hba1cIdx] || '';
      if (hba1c !== null && hba1c > 0 && hba1cRaw !== '') {
        const meanGlucose = (hba1c * 28.7) - 46.7;
        this.setValue(updatedInputs, meanGlucoseIdx, meanGlucose.toFixed(1));
      }
    }

    return { updatedInputs };
  }

  /**
   * AEC Auto-calculations
   */

private static calculateAEC(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
  const updatedInputs = { ...inputs };

  // Find indices using MORE SPECIFIC logic
  let eosinophilIdx = -1;
  let totalCountIdx = -1;
  let absEosIdx = -1;

  referenceData.forEach((point, index) => {
    const desc = point.testDescription?.toUpperCase() || '';
    
    // Find Eosinophil Count (exclude Absolute Eosinophil Count)
    if ((desc === 'EOSINOPHIL COUNT' || desc.includes('EOSINOPHIL COUNT')) && !desc.includes('ABSOLUTE')) {
      eosinophilIdx = index;
    }
    
    // Find Total Count
    if (desc.includes('TOTAL COUNT') || desc === 'TOTAL WBC' || desc === 'TOTAL COUNT/ W.B.C') {
      totalCountIdx = index;
    }
    
    // Find Absolute Eosinophil Count (must contain both ABSOLUTE and EOSINOPHIL)
    if (desc.includes('ABSOLUTE') && desc.includes('EOSINOPHIL')) {
      absEosIdx = index;
    }
  });

  // Only proceed if all three fields exist
  if (absEosIdx >= 0 && eosinophilIdx >= 0 && totalCountIdx >= 0) {
    // Get raw values from inputs
    const eosinophilRaw = inputs[eosinophilIdx] || '';
    const totalCountRaw = inputs[totalCountIdx] || '';
    
    // Parse to numbers
    const eosinophilCount = parseFloat(eosinophilRaw);
    const totalCount = parseFloat(totalCountRaw);

    // EXACT same logic as the old AECComponent:
    // Calculate only if BOTH values exist and are greater than 0
    if (eosinophilRaw !== '' && totalCountRaw !== '' && 
        !isNaN(eosinophilCount) && !isNaN(totalCount) && 
        eosinophilCount > 0 && totalCount > 0) {
      
      // EXACT formula from old component: (totalCount * eosinophilCount) / 100
      const calculatedAbsEos = (totalCount * eosinophilCount) / 100;
      
      // Round to 0 decimal places (same as old component with .toFixed(0))
      const newValue = Math.round(calculatedAbsEos).toString();
      
      // Get current value at the absolute eosinophil index
      const currentValue = inputs[absEosIdx] || '';
      
      // Only update if the value has changed (prevents unnecessary re-renders)
      if (currentValue !== newValue) {
        this.setValue(updatedInputs, absEosIdx, newValue);
      }
    } else {
      // If either source field is empty or invalid, clear the auto-calculated field
      const currentValue = inputs[absEosIdx] || '';
      if (currentValue !== '') {
        this.setValue(updatedInputs, absEosIdx, '');
      }
    }
  }

  return { updatedInputs };
}

  /**
   * Check if a field is auto-calculated
   */
  static isAutoCalculatedField(testDescription: string): boolean {
    const desc = testDescription?.toUpperCase() || '';

     if (desc.includes('ABSOLUTE') && desc.includes('EOSINOPHIL')) {
    return true;
  }
    const otherAutoFields = [
    'GLOBULIN',
    'S.GLOBULIN',
    'INDIRECT BILIRUBIN',
    'A/G RATIO',
    'A/G',
    'MEAN BLOOD GLUCOSE',
    'MEAN GLUCOSE',
    'HDL CHOLESTEROL - DIRECT',
    'HDL CHOLESTEROL',
    'LDL CHOLESTEROL - DIRECT',
    'LDL CHOLESTEROL',
    'VLDL CHOLESTEROL',
    'VLDL'
  ];
    return otherAutoFields.some(field => desc.includes(field.toUpperCase()));
}
}

export default AutoCalculation;













// import { TestReferancePoint } from '@/types/test/testlist';

// export interface AutoCalculationResult {
//   updatedInputs: Record<string | number, string>;
//   differentialValidation?: {
//     total: number;
//     type: string;
//     message: string;
//     calculation: string;
//   } | null;
// }

// export class AutoCalculation {

//   /**
//    * Helper to find index by description with multiple matching patterns
//    */
//   private static findIndexByDescription(
//     referenceData: TestReferancePoint[], 
//     searchTerms: string[],
//     exactMatch: boolean = false
//   ): number {
//     return referenceData.findIndex(point => {
//       const description = point.testDescription?.toUpperCase() || '';
//       return searchTerms.some(term => {
//         const upperTerm = term.toUpperCase();
//         if (exactMatch) {
//           return description === upperTerm;
//         }
//         return description.includes(upperTerm) || upperTerm.includes(description);
//       });
//     });
//   }

//   /**
//    * Helper to get numeric value from inputs
//    */
//   private static getNumericValue(inputs: Record<string | number, string>, index: number): number | null {
//     const val = inputs[index];
//     if (!val || isNaN(Number(val))) return null;
//     return parseFloat(val);
//   }

//   /**
//    * Helper to set value in inputs
//    */
//   private static setValue(inputs: Record<string | number, string>, index: number, value: string) {
//     inputs[index] = value;
//   }

//   /**
//    * Calculate auto fields for any test
//    */
//   static calculate(testName: string, inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
//     const updatedInputs = { ...inputs };
//     const testNameUpper = testName.toUpperCase();

//     if (testNameUpper.includes('COMPLETE BLOOD COUNT') || testNameUpper.includes('CBC')) {
//       return this.calculateCBC(updatedInputs, referenceData);
//     }

//     if (testNameUpper.includes('LIVER FUNCTION TEST') || testNameUpper.includes('LFT')) {
//       return this.calculateLFT(updatedInputs, referenceData);
//     }

//     if (testNameUpper.includes('LIPID PROFILE') || testNameUpper.includes('LPT')) {
//       return this.calculateLPT(updatedInputs, referenceData);
//     }

//     if (testNameUpper.includes('HB A1 C') || testNameUpper.includes('GLYCOSYLATED') || testNameUpper.includes('HBA1C')) {
//       return this.calculateHbA1c(updatedInputs, referenceData);
//     }

//     if (testNameUpper.includes('AEC')) {
//       return this.calculateAEC(updatedInputs, referenceData);
//     }

//     return { updatedInputs };
//   }

//   /**
//    * CBC Auto-calculations - Only differential count validation
//    */
//   private static calculateCBC(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
//     const updatedInputs = { ...inputs };

//     const differentialFields = ['NEUTROPHILS', 'LYMPHOCYTES', 'EOSINOPHILS', 'MONOCYTES', 'BASOPHILS'];
//     let total = 0;
//     let hasValues = false;
//     const fieldValues: { [key: string]: number } = {};
//     const calculationParts: string[] = [];

//     referenceData.forEach((point, index) => {
//       const pointDescription = point.testDescription?.toUpperCase() || '';
//       const matchingField = differentialFields.find(field =>
//         pointDescription.includes(field)
//       );

//       if (matchingField) {
//         const fieldValue = inputs[index];
//         if (fieldValue && !isNaN(Number(fieldValue))) {
//           const numValue = Number(fieldValue);
//           total += numValue;
//           fieldValues[matchingField] = numValue;
//           calculationParts.push(numValue.toString());
//           hasValues = true;
//         }
//       }
//     });

//     let differentialValidation = null;

//     if (hasValues) {
//       const filledFieldsCount = Object.keys(fieldValues).length;
//       const totalFields = 5;
//       const calculationString = calculationParts.join('+');

//       if (filledFieldsCount === totalFields) {
//         if (total > 100) {
//           differentialValidation = {
//             type: 'error',
//             message: `Differential count: ${calculationString} = ${total} (greater than 100)`,
//             total,
//             calculation: calculationString
//           };
//         } else if (total === 100) {
//           differentialValidation = {
//             type: 'success',
//             message: `Differential count: ${calculationString} = ${total} (perfect)`,
//             total,
//             calculation: calculationString
//           };
//         } else {
//           differentialValidation = {
//             type: 'error',
//             message: `Differential count: ${calculationString} = ${total} (less than 100)`,
//             total,
//             calculation: calculationString
//           };
//         }
//       }
//     }

//     return {
//       updatedInputs,
//       differentialValidation
//     };
//   }

//   /**
//    * LFT Auto-calculations
//    */
//   private static calculateLFT(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
//     const updatedInputs = { ...inputs };

//     const totalProteinIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'TOTAL PROTEIN');
//     const albuminIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'ALBUMIN' || p.testDescription?.toUpperCase().includes('ALBUMIN'));
//     const globulinIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'GLOBULIN' || p.testDescription?.toUpperCase().includes('GLOBULIN'));
//     const agRatioIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'A/G RATIO' || p.testDescription?.toUpperCase().includes('A/G RATIO'));
//     const totalBilirubinIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'TOTAL BILIRUBIN' || p.testDescription?.toUpperCase().includes('TOTAL BILIRUBIN'));
//     const directBilirubinIdx = referenceData.findIndex(p => p.testDescription?.toUpperCase() === 'DIRECT BILIRUBIN' || p.testDescription?.toUpperCase().includes('DIRECT BILIRUBIN'));
//     const indirectBilirubinIdx = referenceData.findIndex(p => 
//       p.testDescription?.toUpperCase() === 'INDIRECT BILIRUBIN' ||
//       p.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN')
//     );

//     const totalProteinRaw = inputs[totalProteinIdx] || '';
//     const albuminRaw = inputs[albuminIdx] || '';
//     const totalBilirubinRaw = inputs[totalBilirubinIdx] || '';
//     const directBilirubinRaw = inputs[directBilirubinIdx] || '';

//     // Calculate Globulin = Total Protein - Albumin
//     if (globulinIdx >= 0 && totalProteinIdx >= 0 && albuminIdx >= 0) {
//       const totalProtein = this.getNumericValue(inputs, totalProteinIdx);
//       const albumin = this.getNumericValue(inputs, albuminIdx);
//       if (totalProtein !== null && albumin !== null && totalProteinRaw !== '' && albuminRaw !== '') {
//         const globulin = totalProtein - albumin;
//         this.setValue(updatedInputs, globulinIdx, globulin.toFixed(2));
//       }
//     }

//     // Calculate A/G Ratio = Albumin / Globulin
//     if (agRatioIdx >= 0 && albuminIdx >= 0 && globulinIdx >= 0) {
//       const albumin = this.getNumericValue(inputs, albuminIdx);
//       const globulin = this.getNumericValue(inputs, globulinIdx);
//       if (albumin !== null && globulin !== null && globulin > 0 && totalProteinRaw !== '' && albuminRaw !== '') {
//         const agRatio = albumin / globulin;
//         this.setValue(updatedInputs, agRatioIdx, agRatio.toFixed(2));
//       }
//     }

//     // Calculate Indirect Bilirubin = Total Bilirubin - Direct Bilirubin
//     if (indirectBilirubinIdx >= 0 && totalBilirubinIdx >= 0 && directBilirubinIdx >= 0) {
//       const totalBilirubin = this.getNumericValue(inputs, totalBilirubinIdx);
//       const directBilirubin = this.getNumericValue(inputs, directBilirubinIdx);
//       const hasBothBiliInputs = totalBilirubinRaw !== '' && directBilirubinRaw !== '';
      
//       if (hasBothBiliInputs && totalBilirubin !== null && directBilirubin !== null) {
//         const indirectBilirubin = totalBilirubin - directBilirubin;
//         this.setValue(updatedInputs, indirectBilirubinIdx, indirectBilirubin.toFixed(2));
//       } else {
//         if (inputs[indirectBilirubinIdx] !== '') {
//           this.setValue(updatedInputs, indirectBilirubinIdx, '');
//         }
//       }
//     }

//     return { updatedInputs };
//   }

//   /**
//    * LPT Auto-calculations
//    */
//   private static calculateLPT(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
//     const updatedInputs = { ...inputs };

//     const findIndexByDescription = (description: string) => {
//       return referenceData.findIndex(p => 
//         p.testDescription?.toUpperCase().includes(description.toUpperCase())
//       );
//     };

//     const totalCholesterolIndex = findIndexByDescription('TOTAL CHOLESTEROL');
//     const triglyceridesIndex = findIndexByDescription('TRIGLYCERIDES');
//     const hdlCholesterolIndex = findIndexByDescription('HDL CHOLESTEROL - DIRECT');
//     const ldlCholesterolIndex = findIndexByDescription('LDL CHOLESTEROL - DIRECT');
//     const vldlCholesterolIndex = findIndexByDescription('VLDL CHOLESTEROL');

//     let finalTotalIdx = totalCholesterolIndex;
//     let finalHdlIdx = hdlCholesterolIndex;
//     let finalLdlIdx = ldlCholesterolIndex;

//     if (totalCholesterolIndex === -1) {
//       finalTotalIdx = referenceData.findIndex(p => 
//         p.testDescription?.toUpperCase().includes('CHOLESTEROL') && 
//         !p.testDescription?.toUpperCase().includes('HDL') &&
//         !p.testDescription?.toUpperCase().includes('LDL') &&
//         !p.testDescription?.toUpperCase().includes('VLDL')
//       );
//     }

//     if (hdlCholesterolIndex === -1) {
//       finalHdlIdx = referenceData.findIndex(p => 
//         p.testDescription?.toUpperCase().includes('HDL')
//       );
//     }

//     if (ldlCholesterolIndex === -1) {
//       finalLdlIdx = referenceData.findIndex(p => 
//         p.testDescription?.toUpperCase().includes('LDL')
//       );
//     }

//     const totalCholesterol = parseFloat(inputs[finalTotalIdx] || '0') || 0;
//     const triglycerides = parseFloat(inputs[triglyceridesIndex] || '0') || 0;
//     const hdlCholesterol = parseFloat(inputs[finalHdlIdx] || '0') || 0;

//     const calculatedHDL = totalCholesterol > 0 ? (totalCholesterol * 2) / 5 : 0;
//     const calculatedLDL = totalCholesterol > 0 && hdlCholesterol > 0 ? totalCholesterol - hdlCholesterol : 0;
//     const calculatedVLDL = triglycerides > 0 ? triglycerides / 5 : 0;

//     if (finalHdlIdx >= 0 && totalCholesterol > 0) {
//       const newValue = calculatedHDL.toFixed(2);
//       const currentValue = (inputs[finalHdlIdx] || '').trim();
//       if (parseFloat(currentValue) !== parseFloat(newValue)) {
//         this.setValue(updatedInputs, finalHdlIdx, newValue);
//       }
//     } else if (finalHdlIdx >= 0 && inputs[finalHdlIdx] !== '') {
//       this.setValue(updatedInputs, finalHdlIdx, '');
//     }

//     if (finalLdlIdx >= 0 && totalCholesterol > 0 && hdlCholesterol > 0) {
//       const newValue = Math.max(0, calculatedLDL).toFixed(2);
//       const currentValue = (inputs[finalLdlIdx] || '').trim();
//       if (parseFloat(currentValue) !== parseFloat(newValue)) {
//         this.setValue(updatedInputs, finalLdlIdx, newValue);
//       }
//     } else if (finalLdlIdx >= 0 && inputs[finalLdlIdx] !== '') {
//       this.setValue(updatedInputs, finalLdlIdx, '');
//     }

//     if (vldlCholesterolIndex >= 0 && triglycerides > 0) {
//       const newValue = calculatedVLDL.toFixed(2);
//       const currentValue = (inputs[vldlCholesterolIndex] || '').trim();
//       if (parseFloat(currentValue) !== parseFloat(newValue)) {
//         this.setValue(updatedInputs, vldlCholesterolIndex, newValue);
//       }
//     } else if (vldlCholesterolIndex >= 0 && inputs[vldlCholesterolIndex] !== '') {
//       this.setValue(updatedInputs, vldlCholesterolIndex, '');
//     }

//     return { updatedInputs };
//   }

//   /**
//    * HbA1c Auto-calculations
//    */
//   private static calculateHbA1c(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
//     const updatedInputs = { ...inputs };

//     const hba1cIdx = this.findIndexByDescription(referenceData, ['HBA1C', 'GLYCOSYLATED']);
//     const meanGlucoseIdx = this.findIndexByDescription(referenceData, ['MEAN BLOOD GLUCOSE', 'MEAN GLUCOSE']);

//     if (meanGlucoseIdx >= 0 && hba1cIdx >= 0) {
//       const hba1c = this.getNumericValue(inputs, hba1cIdx);
//       const hba1cRaw = inputs[hba1cIdx] || '';
//       if (hba1c !== null && hba1c > 0 && hba1cRaw !== '') {
//         const meanGlucose = (hba1c * 28.7) - 46.7;
//         this.setValue(updatedInputs, meanGlucoseIdx, meanGlucose.toFixed(1));
//       }
//     }

//     return { updatedInputs };
//   }

//   /**
//    * AEC Auto-calculations
//    */
//   private static calculateAEC(inputs: Record<string | number, string>, referenceData: TestReferancePoint[]): AutoCalculationResult {
//     const updatedInputs = { ...inputs };

//     const eosinophilIdx = this.findIndexByDescription(referenceData, ['EOSINOPHIL COUNT', 'EOSINOPHILS']);
//     const totalCountIdx = this.findIndexByDescription(referenceData, ['TOTAL COUNT', 'TOTAL COUNT/ W.B.C', 'TOTAL WBC']);
//     const absEosIdx = this.findIndexByDescription(referenceData, ['ABSOLUTE EOSINOPHIL COUNT', 'ABSOLUTE EOSINOPHILS']);

//     if (absEosIdx >= 0 && eosinophilIdx >= 0 && totalCountIdx >= 0) {
//       const eosinophil = this.getNumericValue(inputs, eosinophilIdx);
//       const totalCount = this.getNumericValue(inputs, totalCountIdx);
//       const eosinophilRaw = inputs[eosinophilIdx] || '';
//       const totalCountRaw = inputs[totalCountIdx] || '';
      
//       if (eosinophil !== null && totalCount !== null && eosinophil > 0 && totalCount > 0 && 
//           eosinophilRaw !== '' && totalCountRaw !== '') {
//         const absEos = (totalCount * eosinophil) / 100;
//         this.setValue(updatedInputs, absEosIdx, absEos.toFixed(0));
//       }
//     }

//     return { updatedInputs };
//   }

//   /**
//    * Check if a field is auto-calculated
//    */
//   static isAutoCalculatedField(testDescription: string): boolean {
//     const desc = testDescription?.toUpperCase() || '';
//     const autoFields = [
//       'GLOBULIN',
//       'S.GLOBULIN',
//       'INDIRECT BILIRUBIN',
//       'A/G RATIO',
//       'A/G',
//       'MEAN BLOOD GLUCOSE',
//       'MEAN GLUCOSE',
//       'ABSOLUTE EOSINOPHIL COUNT',
//       'ABSOLUTE EOSINOPHILS',
//       'HDL CHOLESTEROL - DIRECT',
//       'HDL CHOLESTEROL',
//       'LDL CHOLESTEROL - DIRECT',
//       'LDL CHOLESTEROL',
//       'VLDL CHOLESTEROL',
//       'VLDL'
//     ];
//     return autoFields.some(field => desc.includes(field));
//   }
// }

// export default AutoCalculation;