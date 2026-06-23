# PatientReportDataFill Component Documentation

## Overview

The `PatientReportDataFill` component is a comprehensive form interface for laboratory technicians to enter and submit test results for patients. It handles reference range filtering based on patient demographics, validates input data, generates report previews, and submits completed reports to the backend.

**Location:** `src/app/(admin)/dashboard/sample/_component/Report/PatientReportDataFill.tsx`

## Component Purpose

This component provides:
- Dynamic reference range filtering based on patient gender and age
- Multiple input types (numeric, dropdown, description, detailed reports)
- Real-time validation with visual feedback
- Report preview before submission
- Support for radiology tests and detailed report editing
- Integration with test-specific component factories

## Props Interface

```typescript
interface PatientReportDataFillProps {
  selectedPatient: Patient;
  selectedTest: TestList;
  updateCollectionTable: boolean;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
}
```

### Props Description

- **`selectedPatient`**: Patient information including demographics, visit details, and test IDs
- **`selectedTest`**: The test being filled out (from TestList type)
- **`updateCollectionTable`**: Boolean flag to trigger table refresh (not directly used in component)
- **`setShowModal`**: Function to close the parent modal after successful submission
- **`setUpdateCollectionTable`**: Function to toggle table refresh state

## Data Interfaces

### Patient Interface
```typescript
interface Patient {
  visitId: number;
  patientname: string;
  gender: string;
  contactNumber: string;
  email: string;
  visitDate: string;
  visitStatus: string;
  sampleNames: string[];
  testIds: number[];
  packageIds: number[];
  dateOfBirth?: string;
}
```

### ReportData Interface
```typescript
interface ReportData {
  visit_id: string;
  testName: string;
  testCategory: string;
  patientName: string;
  referenceDescription: string;
  referenceRange: string;
  referenceAgeRange: string;
  enteredValue: string;
  unit: string;
  description: string;
  referenceRanges?: string; // Raw reference ranges JSON
  reportJson?: string; // Detailed report JSON
}
```

### ReportPayload Interface
```typescript
interface ReportPayload {
  testData: ReportData[];
  testResult: {
    testId: number;
    isFilled: boolean;
  };
}
```

## State Management

The component uses multiple `useState` hooks to manage:

1. **`loading`**: Boolean flag for loading states during data fetching
2. **`referencePoints`**: Record mapping test names to their reference point arrays
3. **`inputValues`**: Nested record storing input values by test name and index
4. **`allTests`**: Array of tests being processed (typically single test)
5. **`validationErrors`**: Record tracking validation errors by field key
6. **`showConfirmation`**: Boolean controlling confirmation modal visibility
7. **`reportPreview`**: Complete report payload ready for submission
8. **`hasMissingDescriptions`**: Boolean flag for missing reference descriptions
9. **`isSubmitting`**: Boolean flag for submission in-progress state

## Key Functions

### 1. Reference Data Filtering

**`filterReferenceData(referenceData: Record<string, TestReferancePoint[]>)`**

Filters reference points based on:
- **Gender matching**: Maps patient gender (MALE/FEMALE) to test format (M/F), includes "MF" (both), or shows if no gender specified
- **Age matching**: Converts patient age and reference ranges to months for comparison
  - Handles special case: `1 MONTH` = `12 months` (represents 0-1 year range)
  - Uses exclusive upper bounds for most ranges, inclusive for highest age range
  - Falls back to gender-only filtering if age filtering yields no results

**Key Logic:**
```typescript
// Gender mapping
MALE → M
FEMALE → F
MF → Show for both genders

// Age conversion
YEARS → months * 12
MONTHS → months (with special case for value=1)
```

### 2. Reference Data Fetching

**`fetchReferenceData()`**

- Fetches reference ranges for the selected test from the API
- Applies gender and age filtering
- Initializes empty input values for all reference points
- Handles loading states and error notifications

### 3. Input Handling

**`handleInputChange(testName: string, index: number | string, value: string)`**

- Validates numeric inputs (prevents negative values except for auto-calculated fields)
- Updates nested state structure: `inputValues[testName][index]`
- Clears validation errors when user starts typing
- Special handling for auto-calculated fields (GLOBULIN, INDIRECT BILIRUBIN, A/G RATIO, etc.)

**Auto-calculated fields that allow negative values:**
- GLOBULIN
- INDIRECT BILIRUBIN
- A/G RATIO
- MEAN BLOOD GLUCOSE
- ABSOLUTE EOSINOPHIL COUNT
- HDL CHOLESTEROL - DIRECT
- LDL CHOLESTEROL - DIRECT
- VLDL CHOLESTEROL

### 4. Form Validation

**`validateForm()`**

- Validates all required fields for non-radiology tests
- Skips validation for:
  - Radiology tests (handled separately)
  - "DETAILED REPORT" fields (don't require user input)
- Returns boolean indicating form validity
- Sets validation errors in state for UI feedback

### 5. Report Preview Generation

**`prepareReportPreview()`**

Builds the complete report payload:

1. **Radiology Tests**: Creates minimal report data with "Hard copy will be provided" message
2. **Regular Tests**: Processes each reference point based on `testDescription`:
   - **DROPDOWN types**: Stores selected value, no reference range
   - **DROPDOWN WITH DESCRIPTION**: Stores value + description text
   - **DESCRIPTION**: Stores description text as both value and description
   - **DETAILED REPORT**: Stores placeholder text
   - **Numeric fields**: Stores value, unit, and reference range

3. **Data Formatting**:
   - Capitalizes test names and categories
   - Formats reference ranges as "min - max"
   - Formats age ranges as "min unit - max unit"
   - Preserves raw `referenceRanges` and `reportJson` for downstream processing

### 6. Report Submission

**`submitReport()`**

- Submits the report preview to the backend API
- Handles success/error states with toast notifications
- Triggers table refresh via `setUpdateCollectionTable`
- Closes modal via `setShowModal(false)`
- Manages submission loading state

### 7. Preview HTML Generation

**`buildReadablePreviewHTML()`**

Creates human-readable HTML preview combining:
- **Detailed Reports**: Parses and formats structured JSON reports with sections
- **Entered Results**: Formats all entered test values with reference ranges
- Handles both structured JSON and fallback formatting

## UI Components

### Main Form Structure

1. **PatientBasicInfo**: Displays patient demographics and visit information
2. **Range Indicator Legend**: Visual guide for normal/abnormal indicators
3. **Test Input Fields**: Rendered via `TestComponentFactory` or `DetailedReportEditor`

### Status Indicators

The component provides visual feedback for test values:

- **Normal Range** (Green): Value within reference range
- **Below Normal** (Red/Yellow): Value below minimum reference
- **Above Normal** (Red): Value above maximum reference
- **No Reference** (Blue): No reference range available

### Confirmation Modal

Accessible modal with:
- **FocusTrap**: Ensures keyboard navigation stays within modal
- **Warning Banner**: Shows if reference descriptions are missing
- **Report Preview**: Displays formatted HTML preview
- **Action Buttons**: Cancel and Confirm submission

## Workflow

### 1. Component Initialization
```
User selects patient + test
  ↓
Component mounts
  ↓
useEffect triggers fetchReferenceData()
  ↓
API call to get reference ranges
  ↓
Filter by gender and age
  ↓
Initialize empty input values
  ↓
Render form fields
```

### 2. Data Entry
```
User enters values
  ↓
handleInputChange() validates and updates state
  ↓
Visual feedback (normal/abnormal indicators)
  ↓
Validation errors cleared on input
```

### 3. Report Generation
```
User clicks "Confirm"
  ↓
prepareReportPreview() called
  ↓
validateForm() checks required fields
  ↓
If valid: Build report payload
  ↓
Set reportPreview state
  ↓
Show confirmation modal with preview
```

### 4. Submission
```
User clicks "Confirm Submission"
  ↓
submitReport() called
  ↓
API call to createReportWithTestResult()
  ↓
On success:
  - Show success toast
  - Refresh collection table
  - Close modal
```

## Special Test Types

### Radiology Tests
- Skip standard validation
- Create minimal report entry
- Message: "Hard copy will be provided"
- Category formatted as "Radiology"

### Detailed Report Tests
- Uses `DetailedReportEditor` component
- Stores structured JSON in `reportJson` field
- Supports rich text editing
- Preserves JSON structure for PDF generation

## Integration Points

### External Dependencies

1. **`useLabs()`**: Context hook for current lab information
2. **`getTestReferanceRangeByTestName()`**: API service for fetching reference data
3. **`createReportWithTestResult()`**: API service for submitting reports
4. **`calculateAgeObject()`**: Utility for age calculations
5. **`formatMedicalReportToHTML()`**: Utility for report formatting
6. **`TestComponentFactory`**: Factory component for test-specific inputs
7. **`DetailedReportEditor`**: Component for detailed report editing
8. **`PatientBasicInfo`**: Component for patient information display

## Error Handling

- **API Failures**: Toast error notifications
- **Validation Errors**: Visual indicators on form fields
- **Missing Data**: Warning banners in confirmation modal
- **Loading States**: Loader component during data fetching

## Accessibility Features

- **FocusTrap**: Modal keyboard navigation
- **ARIA Labels**: Modal roles and labels
- **Keyboard Support**: Escape key to close, Enter/Space for buttons
- **Screen Reader**: Semantic HTML structure

## Important Notes for Developers

### Reference Range Filtering
- Gender codes must match: "M", "F", "MF", or empty
- Age units must be "YEARS" or "MONTHS"
- Special handling for `1 MONTH` = `12 months` (represents 0-1 year)

### Input Value Structure
- Numeric fields: `inputValues[testName][index]`
- Description fields: `inputValues[testName][${index}_description]`
- Maintain this structure when adding new input types

### Report Payload
- Must include `referenceRanges` and `reportJson` for downstream PDF/email generation
- Test names and categories are automatically formatted (capitalized)
- Age ranges formatted as "min unit - max unit"

### Auto-calculated Fields
- Negative values allowed for specific auto-calculated fields
- List is hardcoded in `handleInputChange()`
- Update list if new auto-calculated fields are added

### Detailed Reports
- `reportJson` must remain JSON-serializable
- Changes via `DetailedReportEditor` update `referencePoints` state
- JSON structure preserved for report generation

## Testing Considerations

1. **Gender Filtering**: Test with MALE, FEMALE, and edge cases
2. **Age Filtering**: Test various age ranges and unit conversions
3. **Validation**: Test required field validation and error states
4. **Radiology Tests**: Verify minimal report generation
5. **Detailed Reports**: Test JSON parsing and formatting
6. **Submission**: Test success and error scenarios
7. **Modal**: Test keyboard navigation and accessibility

## Future Enhancements

Potential improvements:
- Batch test result entry
- Auto-save draft functionality
- Enhanced validation rules
- Custom reference range overrides
- Export preview as PDF
- Historical result comparison

