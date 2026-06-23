/**
 * Utility functions for parsing and validating dropdown data from API
 * 
 * This module provides a permanent, scalable solution for handling
 * dynamic dropdown fields from API responses.
 */

export interface DropdownItem {
  label: string;
  value: string;
  // Future extensibility: optional fields that won't break if missing
  disabled?: boolean;
  group?: string;
  icon?: string;
  tooltip?: string;
  metadata?: Record<string, unknown>;
}

export interface ParsedDropdownResult {
  isValid: boolean;
  data: DropdownItem[] | null;
  error: string | null;
  fallbackToTextInput: boolean;
}

/**
 * Validates if a value is a valid dropdown item structure
 */
const isValidDropdownItem = (item: unknown): item is DropdownItem => {
  if (!item || typeof item !== 'object') return false;
  
  const obj = item as Record<string, unknown>;
  
  // Required fields: label and value must be strings
  if (typeof obj.label !== 'string' || typeof obj.value !== 'string') {
    return false;
  }
  
  // Label and value cannot be empty
  if (obj.label.trim() === '' || obj.value.trim() === '') {
    return false;
  }
  
  return true;
};

/**
 * Parses and validates dropdown data from API response
 * 
 * @param dropdownField - The dropdown field from API (string | null | undefined)
 * @returns ParsedDropdownResult with validation status and parsed data
 * 
 * This function implements the permanent solution:
 * - Safely parses JSON string
 * - Validates structure (array of items with label/value)
 * - Handles all edge cases (null, invalid JSON, wrong structure)
 * - Returns clear error information for debugging
 */
export const parseDropdownField = (dropdownField: string | null | undefined): ParsedDropdownResult => {
  // Case 1: Field is null or undefined - no dropdown data
  if (dropdownField === null || dropdownField === undefined) {
    return {
      isValid: false,
      data: null,
      error: null,
      fallbackToTextInput: true
    };
  }

  // Case 2: Empty string - invalid state, fallback to text input
  if (typeof dropdownField === 'string' && dropdownField.trim() === '') {
    return {
      isValid: false,
      data: null,
      error: 'Dropdown field is empty string',
      fallbackToTextInput: true
    };
  }

  // Case 3: Attempt to parse JSON string
  let parsed: unknown;
  try {
    parsed = JSON.parse(dropdownField);
  } catch (error) {
    // Invalid JSON - fallback to text input
    return {
      isValid: false,
      data: null,
      error: `Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fallbackToTextInput: true
    };
  }

  // Case 4: Validate that parsed data is an array
  if (!Array.isArray(parsed)) {
    return {
      isValid: false,
      data: null,
      error: 'Dropdown data is not an array',
      fallbackToTextInput: true
    };
  }

  // Case 5: Empty array - fallback to text input (or could show empty dropdown)
  if (parsed.length === 0) {
    return {
      isValid: false,
      data: null,
      error: 'Dropdown array is empty',
      fallbackToTextInput: true
    };
  }

  // Case 6: Validate each item in the array
  const validatedItems: DropdownItem[] = [];
  
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    
    if (!isValidDropdownItem(item)) {
      // If any item is invalid, fallback to text input
      return {
        isValid: false,
        data: null,
        error: `Invalid dropdown item at index ${i}: missing or invalid label/value`,
        fallbackToTextInput: true
      };
    }
    
    // Add valid item (include optional fields if present)
    validatedItems.push({
      label: item.label.trim(),
      value: item.value.trim(),
      // Optional fields - safely include if present
      ...(item.disabled !== undefined && { disabled: Boolean(item.disabled) }),
      ...(item.group && { group: String(item.group) }),
      ...(item.icon && { icon: String(item.icon) }),
      ...(item.tooltip && { tooltip: String(item.tooltip) }),
      ...(item.metadata && typeof item.metadata === 'object' && { metadata: item.metadata })
    });
  }

  // Case 7: All items are valid - return parsed data
  return {
    isValid: true,
    data: validatedItems,
    error: null,
    fallbackToTextInput: false
  };
};

/**
 * Helper function to check if a reference point has valid dropdown data
 * This is a convenience wrapper around parseDropdownField
 */
export const hasValidDropdown = (dropdownField: string | null | undefined): boolean => {
  const result = parseDropdownField(dropdownField);
  return result.isValid;
};

/**
 * Helper function to get dropdown items if valid, null otherwise
 * This is a convenience wrapper for getting just the data
 */
export const getDropdownItems = (dropdownField: string | null | undefined): DropdownItem[] | null => {
  const result = parseDropdownField(dropdownField);
  return result.isValid ? result.data : null;
};


