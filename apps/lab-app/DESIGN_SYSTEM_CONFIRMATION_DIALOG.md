# Confirmation Dialog Design System

## Overview
This document defines the design system for confirmation dialogs used throughout the application. All confirmation dialogs should follow these guidelines to ensure consistency and a cohesive user experience.

---

## 1. Component Structure

### Base Component: `ConfirmationDialog`
- **Location**: `src/app/(admin)/component/common/ConfirmationDialog.tsx`
- **Usage**: Import and use this component for all confirmation dialogs
- **Props**:
  - `isOpen: boolean` - Controls dialog visibility
  - `onClose: () => void` - Handler for cancel/close actions
  - `onConfirm: () => void` - Handler for confirm action
  - `title: string` - Dialog title
  - `message: string` - Main message/description
  - `confirmText?: string` - Confirm button text (default: "Confirm")
  - `cancelText?: string` - Cancel button text (default: "Cancel")
  - `isLoading?: boolean` - Loading state (default: false)
  - `children?: React.ReactNode` - Custom content section

---

## 2. Dialog Container

### Overlay
```tsx
className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
```
- **Background**: Black with 50% opacity
- **Z-index**: 50
- **Padding**: 1rem (p-4) for mobile responsiveness

### Dialog Box
```tsx
className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
```
- **Background**: White
- **Border Radius**: `rounded-xl` (0.75rem)
- **Shadow**: `shadow-2xl` (large shadow for depth)
- **Max Width**: `max-w-2xl` (672px)
- **Max Height**: 90vh with vertical scroll
- **Width**: Full width on mobile, constrained on desktop

---

## 3. Header Section

### Header Container
```tsx
className="px-6 py-4 border-b border-gray-200 relative overflow-hidden"
style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
```
- **Background**: Purple gradient (135deg, #E1C4F8 to #d1a8f5)
- **Padding**: px-6 (1.5rem horizontal), py-4 (1rem vertical)
- **Border**: Bottom border with gray-200

### Header Content
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center">
    <div className="bg-white/20 p-2 rounded-lg mr-3">
      <FaExclamationTriangle className="text-white text-lg" />
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
  </div>
  <button className="text-white/80 hover:text-white ...">
    <FaTimes className="h-4 w-4" />
  </button>
</div>
```
- **Icon Background**: White with 20% opacity, rounded-lg
- **Title**: text-lg, font-semibold, white text
- **Close Button**: White with 80% opacity, hover to full white

---

## 4. Content Section

### Content Container
```tsx
className="p-6"
```
- **Padding**: 1.5rem (p-6) on all sides

### Message Section
```tsx
<div className="flex items-start mb-6">
  <div className="flex-shrink-0 mr-4">
    <div className="bg-purple-100 p-3 rounded-full">
      <FaCheckCircle className="text-purple-500 text-xl" />
    </div>
  </div>
  <div className="flex-1">
    <p className="text-gray-700 leading-relaxed mb-4">{message}</p>
    {children && (
      <div className="mt-4 border-t border-gray-200 pt-4">
        {children}
      </div>
    )}
  </div>
</div>
```
- **Icon Circle**: Purple-100 background, rounded-full
- **Message Text**: Gray-700, relaxed line-height
- **Children Separator**: Border-top with gray-200, padding-top

---

## 5. Color-Coded Information Sections

All information sections within the dialog should use color-coded backgrounds for visual organization.

### Section Container Structure
```tsx
<div className="bg-{color}-50 p-3 rounded-lg border border-{color}-100">
  <h4 className="font-semibold text-{color}-800 mb-2">Section Title</h4>
  {/* Content */}
</div>
```

### Color Scheme

#### 1. Patient Information (Blue)
```tsx
className="bg-blue-50 p-3 rounded-lg border border-blue-100"
```
- **Background**: `bg-blue-50`
- **Border**: `border-blue-100`
- **Title Color**: `text-blue-800` or `text-blue-900`
- **Use Case**: Patient personal information, demographics

#### 2. Visit Information (Purple)
```tsx
className="bg-purple-50 p-3 rounded-lg border border-purple-100"
```
- **Background**: `bg-purple-50`
- **Border**: `border-purple-100`
- **Title Color**: `text-purple-800` or `text-purple-900`
- **Use Case**: Visit details, appointment information

#### 3. Test Information (Green)
```tsx
className="bg-green-50 p-3 rounded-lg border border-green-100"
```
- **Background**: `bg-green-50`
- **Border**: `border-green-100`
- **Title Color**: `text-green-800` or `text-green-900`
- **Use Case**: Selected tests, test lists

#### 4. Package Information (Orange)
```tsx
className="bg-orange-50 p-3 rounded-lg border border-orange-100"
```
- **Background**: `bg-orange-50`
- **Border**: `border-orange-100`
- **Title Color**: `text-orange-800` or `text-orange-900`
- **Use Case**: Selected packages, package lists

#### 5. Billing Information (Yellow)
```tsx
className="bg-yellow-50 p-3 rounded-lg border border-yellow-100"
```
- **Background**: `bg-yellow-50`
- **Border**: `border-yellow-100`
- **Title Color**: `text-yellow-800` or `text-yellow-900`
- **Use Case**: Payment details, billing amounts

#### 6. Warning/Important Notes (Yellow - Conditional)
```tsx
className="bg-yellow-50 p-3 rounded-lg border border-yellow-100"
```
- **Background**: `bg-yellow-50`
- **Border**: `border-yellow-100`
- **Title Color**: `text-yellow-800`
- **Use Case**: Warnings, important notices, missing information alerts

#### 7. Report Preview (White)
```tsx
className="bg-white p-3 rounded-lg border border-gray-200"
```
- **Background**: `bg-white`
- **Border**: `border-gray-200`
- **Title Color**: `text-gray-800`
- **Use Case**: Report previews, formatted content

---

## 6. Typography

### Section Titles
```tsx
className="font-semibold text-{color}-800 mb-2"
```
- **Font Weight**: `font-semibold` (600)
- **Color**: Matches section color (e.g., `text-blue-800`)
- **Margin Bottom**: `mb-2` (0.5rem)

### Field Labels
```tsx
className="font-medium text-gray-600"
```
- **Font Weight**: `font-medium` (500)
- **Color**: `text-gray-600`

### Field Values
```tsx
className="text-gray-900"
```
- **Color**: `text-gray-900` (darkest gray for readability)

### Grid Layout for Fields
```tsx
className="grid grid-cols-2 gap-2 text-xs"
```
- **Columns**: 2 columns on desktop
- **Gap**: 0.5rem (gap-2)
- **Font Size**: `text-xs` (0.75rem)

### List Items
```tsx
className="text-xs text-gray-700"
```
- **Font Size**: `text-xs`
- **Color**: `text-gray-700`

---

## 7. Spacing System

### Container Spacing
- **Main Container**: `space-y-4` (1rem vertical spacing between sections)
- **Section Padding**: `p-3` (0.75rem)
- **Content Padding**: `p-6` (1.5rem)

### Internal Spacing
- **Title Margin**: `mb-2` (0.5rem below title)
- **Field Gap**: `gap-2` (0.5rem between grid items)
- **List Item Spacing**: `space-y-1` (0.25rem between list items)

---

## 8. Button Styles

### Cancel Button
```tsx
className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
```
- **Background**: `bg-gray-100`
- **Hover**: `hover:bg-gray-200`
- **Text**: `text-gray-700`
- **Border**: `border-gray-200`
- **Transitions**: Smooth 200ms transitions

### Confirm Button
```tsx
className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
```
- **Background**: Purple gradient (135deg, #8B5CF6 to #7C3AED)
- **Disabled**: Gray (#9CA3AF) when loading
- **Text**: White
- **Icon**: CheckCircle icon with margin-right

### Button Container
```tsx
className="flex justify-end space-x-3"
```
- **Alignment**: Right-aligned
- **Spacing**: 0.75rem (space-x-3) between buttons

---

## 9. Data Display Patterns

### Grid Layout (Two Columns)
```tsx
<div className="grid grid-cols-2 gap-2 text-xs">
  <div>
    <span className="font-medium text-gray-600">Label:</span>
    <span className="ml-2 text-gray-900">Value</span>
  </div>
</div>
```
- Use for structured data with multiple fields
- Labels in gray-600, values in gray-900
- 0.5rem left margin between label and value

### List Layout
```tsx
<div className="max-h-32 overflow-y-auto space-y-1">
  {items.map((item) => (
    <div key={item.id} className="flex justify-between items-center text-xs">
      <span className="text-gray-700">Item Name</span>
      <span className="text-gray-900 font-medium">Value</span>
    </div>
  ))}
</div>
```
- Use for scrollable lists
- Max height with overflow scroll
- Flex layout with space-between for labels and values

### Billing Summary
```tsx
<div className="space-y-1 text-xs">
  <div className="flex justify-between">
    <span className="font-medium text-gray-600">Label:</span>
    <span className="text-gray-900 font-semibold">Value</span>
  </div>
  <div className="flex justify-between border-t border-{color}-200 pt-1 mt-1">
    <span className="font-bold text-gray-900">Total:</span>
    <span className="text-gray-900 font-bold text-base">Amount</span>
  </div>
</div>
```
- Use for financial summaries
- Border-top separator for totals
- Bold font for emphasis on totals

---

## 10. Report Preview Format

### Structure
```tsx
<div className="bg-white p-3 rounded-lg border border-gray-200">
  <h4 className="font-semibold text-gray-800 mb-2">Report Preview</h4>
  <div className="border rounded-lg overflow-hidden bg-white">
    <div className="p-4">
      {/* Formatted content */}
    </div>
  </div>
</div>
```

### Test Name Grouping
- **Test Name**: Display as header (bold, uppercase)
- **Parameters**: List below test name with indentation
- **Format**: 
  ```
  TEST NAME
    • Parameter Name: Value (Ref: Reference Range)
  ```

---

## 11. Complete Example

```tsx
import ConfirmationDialog from '@/app/(admin)/component/common/ConfirmationDialog';

<ConfirmationDialog
  isOpen={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Please review all the details below before confirming."
  confirmText="Confirm"
  cancelText="Cancel"
  isLoading={isLoading}
>
  <div className="space-y-4 text-sm">
    {/* Patient Information */}
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
      <h4 className="font-semibold text-blue-800 mb-2">Patient Information</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="font-medium text-gray-600">Name:</span>
          <span className="ml-2 text-gray-900">John Doe</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Phone:</span>
          <span className="ml-2 text-gray-900">+1234567890</span>
        </div>
      </div>
    </div>

    {/* Visit Information */}
    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
      <h4 className="font-semibold text-purple-800 mb-2">Visit Information</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Visit details */}
      </div>
    </div>

    {/* Selected Tests */}
    {selectedTests.length > 0 && (
      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
        <h4 className="font-semibold text-green-800 mb-2">Selected Tests ({selectedTests.length})</h4>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {selectedTests.map((test) => (
            <div key={test.id} className="flex justify-between items-center text-xs">
              <span className="text-gray-700">{test.name}</span>
              <span className="text-gray-900 font-medium">₹{test.price}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Billing Information */}
    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
      <h4 className="font-semibold text-yellow-800 mb-2">Billing Information</h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Total Amount:</span>
          <span className="text-gray-900 font-semibold">₹1000.00</span>
        </div>
        <div className="flex justify-between border-t border-yellow-200 pt-1 mt-1">
          <span className="font-bold text-gray-900">Net Amount:</span>
          <span className="text-gray-900 font-bold text-base">₹1000.00</span>
        </div>
      </div>
    </div>
  </div>
</ConfirmationDialog>
```

---

## 12. Best Practices

### ✅ Do's
- Always use the `ConfirmationDialog` component
- Use color-coded sections for different information types
- Maintain consistent spacing (`space-y-4` for sections, `p-3` for section padding)
- Use `text-xs` for field values in grids
- Include section titles with proper color coding
- Show loading states on the confirm button
- Use conditional rendering for optional sections
- Group related information in the same color section

### ❌ Don'ts
- Don't create custom modal implementations
- Don't mix color schemes (stick to the defined colors)
- Don't use different spacing values
- Don't skip section borders
- Don't use different font sizes without reason
- Don't forget to handle loading states
- Don't display empty sections

---

## 13. Accessibility

- Dialog has proper ARIA attributes (`role="dialog"`, `aria-modal="true"`)
- Close button is keyboard accessible
- Buttons have proper disabled states
- Focus management is handled by the component
- Color contrast meets WCAG AA standards

---

## 14. Responsive Design

- Dialog is responsive with `p-4` padding on mobile
- Max width constraints ensure readability on large screens
- Grid layouts adapt to smaller screens
- Scrollable sections prevent content overflow

---

## Version
**Last Updated**: 2024
**Component Version**: 1.0

---

## Notes
- All color values use Tailwind CSS classes
- Gradient values are defined inline for the header and confirm button
- The design system ensures visual consistency across all confirmation dialogs
- Custom content should follow the section structure defined above

