# Test Reference System Documentation

## Overview

The Test Reference System is a comprehensive module for managing laboratory test reference ranges. It allows administrators to add, edit, update, and delete test reference points with support for various test description types, including detailed reports with structured content.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Structure](#component-structure)
3. [Data Flow](#data-flow)
4. [Adding References](#adding-references)
5. [Editing References](#editing-references)
6. [Updating References](#updating-references)
7. [Special Test Descriptions](#special-test-descriptions)
8. [Report JSON Structure](#report-json-structure)
9. [Reference Ranges](#reference-ranges)
10. [Validation Rules](#validation-rules)

---

## System Architecture

### Main Page Component: `TestReferancePoints.tsx`

**Location**: `src/app/(admin)/component/test/TestReferancePoints.tsx`

**Purpose**: Main page that displays all test reference points with search, filter, and CRUD operations.

**Key Features**:
- Paginated data fetching (700 items per page)
- Category-based grouping and expansion
- Search and filter functionality
- Export to CSV/Excel
- Modal management for add/edit operations

### Child Components

1. **TestEditReferance.tsx** - Edit existing reference
2. **AddTestReferanceNew.tsx** - Add new reference with test selection
3. **AddExistingTestReferance.tsx** - Add reference for existing test

---

## Component Structure

### 1. TestReferancePoints (Main Page)

#### State Management

```typescript
- referencePoints: TestReferancePoint[] - All fetched reference points
- loading: boolean - Loading state
- isEditModalOpen: boolean - Edit modal visibility
- editRecord: TestReferancePoint | null - Record being edited
- formData: TestReferancePoint - Form data for editing
- addModalOpen: boolean - Add new modal visibility
- existingModalOpen: boolean - Add existing modal visibility
- searchTerm: string - Search query
- currentPage: number - Current pagination page (0-based)
- expandedCategories: Record<string, boolean> - Category expansion state
- expandedRows: Record<number, boolean> - Row expansion state
```

#### Key Functions

**`fetchReferencePoints(page, size)`**
- Fetches test references from API
- Updates pagination state
- Handles errors and loading states

**`handleEditRecord(test)`**
- Sets the record to edit
- Opens edit modal
- Initializes form data

**`handleUpdate(e)`**
- Validates form data
- Converts gender "B" to "MF"
- Calls API to update reference
- Refreshes data after update

**`handleDelete(testReferenceCode)`**
- Confirms deletion
- Calls API to delete
- Refreshes data after deletion

**`handleAddNewReferanceRecord(e)`**
- Validates using Zod schema
- Converts gender "B" to "MF"
- Calls API to add new reference
- Refreshes data and closes modal

**`handleAddExistingReferanceRecord(e)`**
- Similar to add new, but for existing tests
- Pre-fills test name and category

---

## Data Flow

### Adding a New Reference

```
User clicks "Add New" button
    ↓
Opens AddTestReferanceNew modal
    ↓
User selects test from list (optional)
    ↓
User fills form fields:
  - Test Description (required)
  - Gender (required)
  - Units (optional for special types)
  - Age Range (required)
  - Reference Range (hidden for special types)
  - Report JSON (for DETAILED REPORT only)
  - Reference Ranges JSON (optional)
    ↓
User clicks "Add Reference"
    ↓
handleAddNewReferanceRecord() called
    ↓
Zod schema validation
    ↓
API call: addTestReferanceRange()
    ↓
Success: Refresh data, close modal, show toast
```

### Editing a Reference

```
User clicks Edit icon on a reference row
    ↓
handleEditRecord(test) called
    ↓
Sets editRecord and formData
    ↓
Opens TestEditReferance modal
    ↓
User modifies form fields
    ↓
User clicks "Save"
    ↓
handleFormSubmit() in TestEditReferance
    ↓
Custom validation
    ↓
handleUpdate() in parent called
    ↓
API call: updateTestReferanceRange()
    ↓
Success: Refresh data, close modal, show toast
```

### Updating a Reference

The update process is the same as editing. The key difference is:
- **Edit**: Opens modal with existing data
- **Update**: Saves changes to backend

---

## Adding References

### Method 1: Add New Reference (`AddTestReferanceNew`)

**Flow**:
1. User clicks "Add New" button in main page
2. Modal opens with `AddTestReferanceNew` component
3. Component loads available tests from API
4. User can:
   - Search and filter tests
   - Select a test (auto-fills testName and category)
   - Or manually enter test information
5. User fills required fields
6. For "DETAILED REPORT":
   - Shows `DetailedReportFormEditor`
   - Allows structured report creation
7. User submits form
8. Validation occurs (Zod schema)
9. API call to create reference
10. Data refreshes

**Key Features**:
- Test selection with search
- Category filtering
- Auto-fill test name and category
- Conditional fields based on test description
- Structured report editor for DETAILED REPORT

### Method 2: Add Existing Test Reference (`AddExistingTestReferance`)

**Flow**:
1. User clicks "Add Reference" button next to a test name
2. Modal opens with `AddExistingTestReferance` component
3. Test name and category are pre-filled
4. User fills:
   - Test Description
   - Gender
   - Age Range
   - Reference Range (if applicable)
   - Report JSON (if DETAILED REPORT)
5. User submits form
6. Validation occurs
7. API call to create reference
8. Data refreshes

**Key Features**:
- Pre-filled test information
- Faster workflow for adding multiple references to same test
- Same validation rules as Add New

---

## Editing References

### Component: `TestEditReferance`

**Flow**:
1. User clicks Edit icon on reference row
2. `handleEditRecord(test)` called in parent
3. Parent sets:
   - `editRecord = test`
   - `formData = test`
   - `isEditModalOpen = true`
4. Modal opens with `TestEditReferance` component
5. Component receives props:
   - `editRecord`: Original record
   - `formData`: Current form state
   - `handleUpdate`: Parent's update function
   - `handleChange`: Parent's change handler
6. User modifies fields
7. Component validates in real-time
8. User clicks "Save"
9. `handleFormSubmit()` validates
10. Calls `handleUpdate(e)` in parent
11. Parent calls API
12. Success: Modal closes, data refreshes

**Key Features**:
- Real-time validation
- Error display with field highlighting
- Conditional field visibility
- Report section editor for DETAILED REPORT
- Reference ranges builder

---

## Updating References

### Update Process

The update process is handled by the `handleUpdate` function in `TestReferancePoints.tsx`:

```typescript
handleUpdate(e: React.FormEvent) {
  1. Prevents default form submission
  2. Validates lab selection
  3. Validates test reference code
  4. Validates form data
  5. Prepares data:
     - Converts gender "B" to "MF"
     - Converts string numbers to floats
  6. Calls API: updateTestReferanceRange(labId, testReferenceCode, data)
  7. On success:
     - Refreshes data
     - Shows success toast
     - Closes modal
  8. On error:
     - Shows error toast
     - Keeps modal open
}
```

### Data Transformation

Before sending to API:
- Gender: "B" → "MF"
- String numbers → Float numbers
- Default age units: undefined → "YEARS"
- Report JSON: Structured object → JSON string
- Reference Ranges: Array → JSON string

---

## Special Test Descriptions

### List of Special Types

These test descriptions have special validation and UI behavior:

1. `DESCRIPTION`
2. `DROPDOWN`
3. `DROPDOWN-POSITIVE/NEGATIVE`
4. `DROPDOWN-PRESENT/ABSENT`
5. `DROPDOWN-REACTIVE/NONREACTIVE`
6. `DROPDOWN-PERCENTAGE`
7. `DROPDOWN-COMPATIBLE/INCOMPATIBLE`
8. `DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE`
9. `DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT`
10. `DETAILED REPORT`

### Special Behavior Rules

#### For All Special Types:
- **Units Field**: Optional (no required validation)
- **Min/Max Reference Range**: Hidden in UI, not validated
- **Reference Ranges Builder**: Hidden in UI

#### For DETAILED REPORT Only:
- **Report Content Editor**: Visible and required
- **Report JSON**: Required and validated
- **Structured Report Editor**: Uses Tiptap editor with table support

---

## Report JSON Structure

### For DETAILED REPORT

The `reportJson` field stores a structured JSON object:

```json
{
  "reportType": "Report Type Placeholder",
  "indication": "Indication Placeholder",
  "method": "Method/Technique Placeholder",
  "sections": [
    {
      "title": "Section Title",
      "content": "Paragraph text or array of strings",
      "contentType": "text" | "list"
    }
  ],
  "tables": [
    {
      "title": "Table Title",
      "headers": ["Header 1", "Header 2"],
      "rows": [
        ["Row 1 Cell 1", "Row 1 Cell 2"],
        ["Row 2 Cell 1", "Row 2 Cell 2"]
      ]
    }
  ],
  "impression": [
    "Impression statement 1",
    "Impression statement 2"
  ],
  "followUp": "Follow-up instructions"
}
```

### Report Editor Behavior

**In TestEditReferance**:
- Uses `DetailedReportTiptapEditor` (Tiptap-based)
- Preserves table structures
- Supports rich text editing
- Converts HTML to JSON on save

**In AddTestReferanceNew/AddExistingTestReferance**:
- Uses `DetailedReportFormEditor`
- Form-based editor for structured data
- Converts form data to JSON

---

## Reference Ranges

### Structure

Reference ranges are stored as JSON array in `referenceRanges` field:

```json
[
  {
    "Gender": "M" | "F" | "MF",
    "AgeMin": 0,
    "AgeMinUnit": "YEARS" | "MONTHS" | "WEEKS" | "DAYS",
    "AgeMax": 100,
    "AgeMaxUnit": "YEARS" | "MONTHS" | "WEEKS" | "DAYS",
    "ReferenceRange": "12.0 - 16.0 g/dL"
  }
]
```

### Reference Ranges Builder

**Features**:
- Structured tab: Visual builder with rows
- Raw tab: Direct JSON editing
- Live preview of ranges
- Add/Remove rows
- Load from existing JSON
- Apply changes to form data

**Workflow**:
1. User adds rows in structured builder
2. Fills in gender, age range, reference range
3. Clicks "Apply to JSON"
4. Converts rows to JSON string
5. Saves to `referenceRanges` field

---

## Validation Rules

### General Validation

**Required Fields** (for all types):
- `testDescription`: Required
- `gender`: Required (M, F, or MF)
- `ageMin`: Required (0-100)
- `minAgeUnit`: Defaults to "YEARS" if empty
- `maxAgeUnit`: Defaults to "YEARS" if empty

**Conditional Validation**:
- `units`: Required only for non-special types
- `minReferenceRange`: Required only for non-special types
- `maxReferenceRange`: Required only for non-special types
- `reportJson`: Required only for DETAILED REPORT

### Age Validation

- `ageMin`: Must be >= 0 and <= 100
- `ageMax`: Must be >= 0 and <= 100 (if provided)
- `ageMax` must be > `ageMin` (if both provided)

### Range Validation

- `minReferenceRange`: Must be >= 0 (if required)
- `maxReferenceRange`: Must be >= 0 (if required)
- `maxReferenceRange` must be > `minReferenceRange` (if both provided)

### DETAILED REPORT Validation

- `reportJson`: Must be valid JSON
- Must follow detailed report schema structure
- All other range validations are skipped

### DROPDOWN Types Validation

- All range validations are skipped
- Units field is optional
- Only basic fields (description, gender, age) are validated

---

## API Integration

### Service Functions

**Location**: `services/testService.ts`

**Functions Used**:
1. `getTestReferences(labId, page, size)` - Fetch paginated references
2. `addTestReferanceRange(labId, data)` - Add new reference
3. `updateTestReferanceRange(labId, testReferenceCode, data)` - Update reference
4. `deleteTestReferanceRange(labId, testReferenceCode)` - Delete reference
5. `fetchTestReferenceRangeCsv(labId)` - Export CSV
6. `getTests(labId)` - Get test list for selection

### Request/Response Format

**TestReferancePoint Type**:
```typescript
{
  id?: number;
  testReferenceCode?: string;
  category: string;
  testName: string;
  testDescription: string;
  units?: string;
  gender: "M" | "F" | "MF";
  minReferenceRange?: number;
  maxReferenceRange?: number;
  ageMin: number;
  ageMax?: number;
  minAgeUnit: "YEARS" | "MONTHS" | "WEEKS" | "DAYS";
  maxAgeUnit?: "YEARS" | "MONTHS" | "WEEKS" | "DAYS";
  reportJson?: string;
  referenceRanges?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## User Interface Features

### Main Page Features

1. **Search & Filter**:
   - Search by category, test name, or description
   - Filter toggle between search types
   - Real-time filtering

2. **Category Grouping**:
   - Tests grouped by category
   - Expandable/collapsible categories
   - Test count per category

3. **Row Expansion**:
   - Click chevron to expand row
   - Shows full report JSON details
   - Shows reference ranges details
   - Shows metadata (created/updated info)

4. **Actions**:
   - Edit: Opens edit modal
   - Delete: Confirms and deletes
   - Add Reference: Opens add existing modal

5. **Export**:
   - CSV export
   - Excel export

### Modal Features

**Edit Modal** (`TestEditReferance`):
- Color-coded sections (Green, Blue, Purple, Orange)
- Real-time validation
- Error highlighting
- Scroll to error on submit
- Report editor for DETAILED REPORT
- Reference ranges builder

**Add New Modal** (`AddTestReferanceNew`):
- Test selection interface
- Search and category filter
- Selected test preview
- Conditional fields
- Detailed report form editor

**Add Existing Modal** (`AddExistingTestReferance`):
- Pre-filled test information
- Same form structure as Add New
- Faster workflow for bulk additions

---

## Data Persistence

### Form State Management

**Parent Component** (`TestReferancePoints`):
- Manages all modals state
- Holds form data for editing
- Holds new record data for adding
- Holds existing record data for adding existing

**Child Components**:
- Receive props from parent
- Manage local validation state
- Call parent handlers on submit
- Don't directly call API

### State Flow Example (Edit)

```
Parent State:
  editRecord: { id: 1, testName: "CBC", ... }
  formData: { id: 1, testName: "CBC", ... }
    ↓
Passed to TestEditReferance as props
    ↓
User modifies formData in child
    ↓
Child calls handleChange (updates parent's formData)
    ↓
User clicks Save
    ↓
Child validates and calls handleUpdate(e)
    ↓
Parent's handleUpdate:
  - Uses formData
  - Calls API
  - Refreshes data
```

---

## Error Handling

### Validation Errors

**Display**:
- Red border on invalid fields
- Error message below field
- Summary box at top of form
- Toast notification on submit

**Types**:
- Required field errors
- Range validation errors
- Age validation errors
- JSON format errors
- Business logic errors (e.g., max > min)

### API Errors

**Handling**:
- Toast error notification
- Console logging for debugging
- Modal remains open on error
- User can retry after fixing

---

## Best Practices

### For Developers

1. **Always validate on both client and server**
2. **Use Zod schema for type safety**
3. **Handle loading states properly**
4. **Provide clear error messages**
5. **Refresh data after mutations**
6. **Use proper TypeScript types**

### For Users

1. **Select test description from dropdown when possible**
2. **Use structured builder for reference ranges**
3. **For DETAILED REPORT, use the form editor**
4. **Check validation errors before submitting**
5. **Use "Add Existing" for multiple references to same test**

---

## Common Workflows

### Workflow 1: Add New Test Reference

1. Click "Add New" button
2. Search and select test (optional)
3. Select test description type
4. Fill gender and age range
5. If not special type: Fill units and reference range
6. If DETAILED REPORT: Fill report structure
7. Optionally add reference ranges
8. Click "Add Reference"
9. System validates and saves

### Workflow 2: Edit Existing Reference

1. Find reference in list
2. Click Edit icon
3. Modify fields as needed
4. For DETAILED REPORT: Edit report sections
5. Click "Save"
6. System validates and updates

### Workflow 3: Add Multiple References to Same Test

1. Find test in list
2. Click "Add Reference" next to test name
3. Test name and category pre-filled
4. Fill remaining fields
5. Click "Add Reference"
6. Repeat for additional references

### Workflow 4: Delete Reference

1. Find reference in list
2. Click Delete icon
3. Confirm deletion
4. System deletes and refreshes

---

## Technical Details

### Gender Conversion

The UI shows "Both" (B) but the backend expects "MF":
- Input: User selects "B"
- Conversion: Component converts to "MF" before API call
- Display: Component converts "MF" to "B" for display

### Age Units Defaults

If age units are undefined:
- `minAgeUnit` defaults to "YEARS"
- `maxAgeUnit` defaults to "YEARS"
- Set automatically on form load

### Report JSON Conversion

**For DETAILED REPORT**:
- Form editor → JSON object → JSON string
- Tiptap editor → HTML → JSON object → JSON string
- On load: JSON string → JSON object → Form/Tiptap editor

### Reference Ranges Conversion

- Structured builder → Array of objects → JSON string
- Raw editor → JSON string (direct)
- On load: JSON string → Array → Structured builder

---

## Troubleshooting

### Common Issues

1. **Validation errors not clearing**:
   - Check if field name matches validation key
   - Ensure handleChangeWithValidation is used

2. **Report JSON not saving**:
   - Check if testDescription is "DETAILED REPORT"
   - Validate JSON structure
   - Check console for parsing errors

3. **Reference ranges not applying**:
   - Click "Apply to JSON" button
   - Check if rows have ReferenceRange filled
   - Validate JSON format

4. **Modal not closing after save**:
   - Check API response
   - Verify success handler
   - Check for unhandled errors

---

## Version Information

**Last Updated**: 2024
**Component Version**: 1.0
**API Version**: Compatible with current backend

---

## Notes

- All test descriptions are converted to uppercase
- Gender "B" is converted to "MF" for backend
- Age values are limited to 0-100
- Reference ranges support decimal values (step: 0.01)
- Report JSON uses Tiptap editor for DETAILED REPORT in edit mode
- Report JSON uses form editor for DETAILED REPORT in add mode
- All color-coded sections follow the design system
- Pagination uses 0-based indexing internally, 1-based for display


