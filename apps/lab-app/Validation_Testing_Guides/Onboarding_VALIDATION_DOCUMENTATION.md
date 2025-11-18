# Onboarding Form Validation Documentation

## Overview

This document provides comprehensive validation rules for the Lab Automation System onboarding form. All validation rules are enforced both at the input level (real-time filtering) and at the validation level (on form submission).

---

## Validation Principles

1. **Alphabetic-Only String Fields**: Username and all name/location fields accept only alphabetic characters (letters), with limited special characters (spaces, hyphens, apostrophes) where appropriate. **Numbers are not allowed** in these fields.

2. **Real-Time Input Filtering**: Invalid characters are automatically stripped as the user types, preventing invalid input from being entered.

3. **Step-Wise Validation**: Validation occurs only when clicking "Next" for each step or "Complete Registration" for the final step.

4. **Clear Error Messages**: Each validation rule provides specific, actionable error messages to guide users.

---

## Field Validation Rules

### Step 1: Personal Information

#### 1. Username
- **Type**: Alphabetic only (letters only)
- **Required**: Yes
- **Min Length**: 3 characters
- **Max Length**: 30 characters
- **Allowed Characters**: `a-z`, `A-Z` (letters only, no numbers, no special characters)
- **Input Filtering**: Automatically removes all non-alphabetic characters
- **Validation Regex**: `/^[a-zA-Z]+$/`
- **Error Messages**:
  - Empty: "Username is required"
  - Too short: "Username must be at least 3 characters"
  - Too long: "Username must not exceed 30 characters"
  - Invalid characters: "Username can only contain alphabetic characters (letters only, no numbers or special characters)"

**Examples**:
- ✅ Valid: `john`, `JohnDoe`, `alice`, `ROBERT`
- ❌ Invalid: `john123` (contains numbers), `john_doe` (contains underscore), `john-doe` (contains hyphen)

---

#### 2. Email
- **Type**: Email address
- **Required**: Yes (pre-filled, disabled)
- **Format**: Standard email format (`user@domain.com`)
- **Validation Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Error Messages**:
  - Empty: "Email is required"
  - Invalid format: "Please enter a valid email address"

**Examples**:
- ✅ Valid: `user@example.com`, `john.doe@company.co.uk`
- ❌ Invalid: `user@`, `@example.com`, `user@example`

---

#### 3. Password
- **Type**: String (with complexity requirements)
- **Required**: Yes
- **Min Length**: 8 characters
- **Max Length**: 50 characters
- **Complexity Requirements**:
  - At least one lowercase letter (`a-z`)
  - At least one uppercase letter (`A-Z`)
  - At least one digit (`0-9`)
- **Validation Regex**: 
  - Lowercase: `/(?=.*[a-z])/`
  - Uppercase: `/(?=.*[A-Z])/`
  - Number: `/(?=.*\d)/`
- **Error Messages**:
  - Empty: "Password is required"
  - Too short: "Password must be at least 8 characters"
  - Too long: "Password must not exceed 50 characters"
  - Missing lowercase: "Password must contain at least one lowercase letter"
  - Missing uppercase: "Password must contain at least one uppercase letter"
  - Missing number: "Password must contain at least one number"

**Examples**:
- ✅ Valid: `Password123`, `MySecure1`, `ComplexPass9`
- ❌ Invalid: `password` (no uppercase, no number), `PASSWORD123` (no lowercase), `Password` (no number)

---

#### 4. Phone Number
- **Type**: Numeric only (digits)
- **Required**: Yes
- **Length**: Exactly 10 digits
- **Allowed Characters**: `0-9` (digits only)
- **Input Filtering**: Automatically removes all non-digit characters, limits to 10 digits
- **Validation**: Removes spaces, dashes, and plus signs before validation
- **Validation Regex**: `/^\d+$/` (after cleaning)
- **Error Messages**:
  - Empty: "Phone number is required"
  - Contains non-digits: "Phone number must contain only digits"
  - Wrong length: "Phone number must be exactly 10 digits"

**Examples**:
- ✅ Valid: `1234567890`, `9876543210`
- ❌ Invalid: `123-456-7890` (contains dashes), `+1234567890` (contains plus), `123456789` (9 digits), `12345678901` (11 digits)

---

#### 5. First Name
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**:
  - Empty: "First name is required"
  - Too short: "First name must be at least 2 characters"
  - Too long: "First name must not exceed 50 characters"
  - Invalid characters: "First name can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)"

**Examples**:
- ✅ Valid: `John`, `Mary Jane`, `Jean-Pierre`, `O'Brien`, `Mary Ann`
- ❌ Invalid: `John123` (contains numbers), `John_Doe` (contains underscore), `John@Doe` (contains @)

---

#### 6. Last Name
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**: Same as First Name

**Examples**:
- ✅ Valid: `Smith`, `Van Der Berg`, `O'Connor`, `Garcia-Lopez`
- ❌ Invalid: `Smith123` (contains numbers), `Smith_Doe` (contains underscore)

---

### Step 2: Address Information

#### 7. Address
- **Type**: Free text (allows numbers for street addresses)
- **Required**: Yes
- **Min Length**: 5 characters
- **Max Length**: 200 characters
- **Allowed Characters**: All characters (numbers allowed for street addresses)
- **Note**: Addresses may contain numbers (e.g., "123 Main Street")
- **Error Messages**:
  - Empty: "Address is required"
  - Too short: "Address must be at least 5 characters"
  - Too long: "Address must not exceed 200 characters"

**Examples**:
- ✅ Valid: `123 Main Street`, `456 Oak Avenue, Apt 5B`, `789 Pine Road`
- ❌ Invalid: `123` (too short), `A` (too short)

---

#### 8. City
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**:
  - Empty: "City is required"
  - Too short: "City must be at least 2 characters"
  - Too long: "City must not exceed 50 characters"
  - Invalid characters: "City can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)"

**Examples**:
- ✅ Valid: `New York`, `San Francisco`, `Saint-Louis`, `O'Fallon`
- ❌ Invalid: `New York123` (contains numbers), `New_York` (contains underscore)

---

#### 9. State
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**: Same as City

**Examples**:
- ✅ Valid: `California`, `New York`, `North Carolina`, `Rhode Island`
- ❌ Invalid: `CA123` (contains numbers), `New_York` (contains underscore)

---

#### 10. ZIP Code
- **Type**: Numeric only (digits)
- **Required**: Yes
- **Min Length**: 4 digits
- **Max Length**: 6 digits
- **Allowed Characters**: `0-9` (digits only)
- **Input Filtering**: Automatically removes all non-digit characters, limits to 6 digits
- **Validation Regex**: `/^\d+$/`
- **Error Messages**:
  - Empty: "ZIP code is required"
  - Contains non-digits: "ZIP code must contain only numbers"
  - Too long: "ZIP code must not exceed 6 digits"
  - Too short: "ZIP code must be at least 4 digits"

**Examples**:
- ✅ Valid: `12345`, `123456`, `1234`
- ❌ Invalid: `12345-6789` (contains dash), `ABC123` (contains letters), `123` (too short), `1234567` (too long)

---

#### 11. Country
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**:
  - Empty: "Country is required"
  - Too short: "Country must be at least 2 characters"
  - Too long: "Country must not exceed 50 characters"
  - Invalid characters: "Country can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)"

**Examples**:
- ✅ Valid: `United States`, `United Kingdom`, `South Africa`, `Côte d'Ivoire`
- ❌ Invalid: `USA123` (contains numbers), `United_States` (contains underscore)

---

### Step 3: Lab Details

#### 12. Lab Name
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 3 characters
- **Max Length**: 100 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**:
  - Empty: "Lab name is required"
  - Too short: "Lab name must be at least 3 characters"
  - Too long: "Lab name must not exceed 100 characters"
  - Invalid characters: "Lab name can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)"

**Examples**:
- ✅ Valid: `ABC Medical Laboratory`, `Smith & Associates Lab`, `O'Connor Diagnostics`
- ❌ Invalid: `ABC Lab123` (contains numbers), `Lab_One` (contains underscore)

---

#### 13. Lab Address
- **Type**: Free text (allows numbers for street addresses)
- **Required**: Yes
- **Min Length**: 5 characters
- **Max Length**: 200 characters
- **Allowed Characters**: All characters (numbers allowed for street addresses)
- **Note**: Addresses may contain numbers (e.g., "123 Main Street")
- **Error Messages**: Same as Address (Step 2)

**Examples**:
- ✅ Valid: `456 Lab Street`, `789 Medical Center Drive, Suite 200`
- ❌ Invalid: `Lab` (too short)

---

#### 14. Lab City
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**: Same as City (Step 2)

---

#### 15. Lab State
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**: Same as State (Step 2)

---

#### 16. Lab ZIP
- **Type**: Numeric only (digits)
- **Required**: Yes
- **Min Length**: 4 digits
- **Max Length**: 6 digits
- **Allowed Characters**: `0-9` (digits only)
- **Input Filtering**: Automatically removes all non-digit characters, limits to 6 digits
- **Validation Regex**: `/^\d+$/`
- **Error Messages**: Same as ZIP Code (Step 2)

---

#### 17. Lab Country
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**: Same as Country (Step 2)

---

#### 18. License Number
- **Type**: Alphabetic only (letters only)
- **Required**: Yes
- **Min Length**: 5 characters
- **Max Length**: 20 characters
- **Allowed Characters**: `a-z`, `A-Z` (letters only, no numbers, no special characters)
- **Input Filtering**: Automatically removes all non-alphabetic characters
- **Validation Regex**: `/^[a-zA-Z]+$/`
- **Error Messages**:
  - Empty: "License number is required"
  - Too short: "License number must be at least 5 characters"
  - Too long: "License number must not exceed 20 characters"
  - Invalid characters: "License number can only contain alphabetic characters (letters only, no numbers or special characters)"

**Examples**:
- ✅ Valid: `LABLICENSE`, `MedicalLicense`, `CLINICAL`
- ❌ Invalid: `LAB123` (contains numbers), `LAB-LICENSE` (contains hyphen), `LAB_LICENSE` (contains underscore)

---

#### 19. Lab Type
- **Type**: Selection from dropdown
- **Required**: Yes
- **Options**: Clinical, Research, Diagnostic, Pathology, Other
- **Error Messages**:
  - Empty: "Lab type is required"

---

#### 20. Lab Phone
- **Type**: Numeric only (digits)
- **Required**: Yes
- **Length**: Exactly 10 digits
- **Allowed Characters**: `0-9` (digits only)
- **Input Filtering**: Automatically removes all non-digit characters, limits to 10 digits
- **Validation Regex**: `/^\d+$/` (after cleaning)
- **Error Messages**: Same as Phone Number (Step 1)

---

#### 21. Lab Email
- **Type**: Email address
- **Required**: Yes
- **Format**: Standard email format (`user@domain.com`)
- **Validation Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Error Messages**: Same as Email (Step 1)

---

#### 22. Description
- **Type**: Free text (optional)
- **Required**: No
- **Max Length**: No limit (textarea)
- **Allowed Characters**: All characters
- **Note**: Optional field, no validation applied

---

#### 23. Director Name
- **Type**: Alphabetic with limited special characters
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Allowed Characters**: `a-z`, `A-Z`, spaces, hyphens (`-`), apostrophes (`'`)
- **Not Allowed**: Numbers, underscores, or other special characters
- **Input Filtering**: Automatically removes numbers and invalid special characters
- **Validation Regex**: `/^[a-zA-Z\s'-]+$/`
- **Error Messages**: Same as First Name

**Examples**:
- ✅ Valid: `Dr. John Doe`, `Dr. Mary Jane Smith`, `Dr. Jean-Pierre`
- ❌ Invalid: `Dr. John123` (contains numbers), `Dr. John_Doe` (contains underscore)

---

#### 24. Director Email
- **Type**: Email address
- **Required**: Yes
- **Format**: Standard email format (`user@domain.com`)
- **Validation Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Error Messages**: Same as Email (Step 1)

---

#### 25. Director Phone
- **Type**: Numeric only (digits)
- **Required**: Yes
- **Length**: Exactly 10 digits
- **Allowed Characters**: `0-9` (digits only)
- **Input Filtering**: Automatically removes all non-digit characters, limits to 10 digits
- **Validation Regex**: `/^\d+$/` (after cleaning)
- **Error Messages**: Same as Phone Number (Step 1)

---

#### 26. Data Privacy Agreement
- **Type**: Checkbox (boolean)
- **Required**: Yes
- **Validation**: Must be checked
- **Error Messages**:
  - Unchecked: "You must agree to the data privacy terms"

---

## Validation Summary Table

| Field | Type | Required | Min | Max | Allowed Characters | Numbers Allowed |
|-------|------|----------|-----|-----|-------------------|-----------------|
| Username | Alphabetic | Yes | 3 | 30 | `a-z`, `A-Z` | ❌ No |
| Email | Email | Yes | - | - | Email format | ✅ Yes |
| Password | Complex | Yes | 8 | 50 | All (with requirements) | ✅ Yes |
| Phone | Numeric | Yes | 10 | 10 | `0-9` | ✅ Yes (only) |
| First Name | Alphabetic | Yes | 2 | 50 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| Last Name | Alphabetic | Yes | 2 | 50 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| Address | Free text | Yes | 5 | 200 | All | ✅ Yes |
| City | Alphabetic | Yes | 2 | 50 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| State | Alphabetic | Yes | 2 | 50 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| ZIP | Numeric | Yes | 4 | 6 | `0-9` | ✅ Yes (only) |
| Country | Alphabetic | Yes | 2 | 50 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| Lab Name | Alphabetic | Yes | 3 | 100 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| Lab Address | Free text | Yes | 5 | 200 | All | ✅ Yes |
| Lab City | Alphabetic | Yes | 2 | 50 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| Lab State | Alphabetic | Yes | 2 | 50 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| Lab ZIP | Numeric | Yes | 4 | 6 | `0-9` | ✅ Yes (only) |
| Lab Country | Alphabetic | Yes | 2 | 50 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| License Number | Alphabetic | Yes | 5 | 20 | `a-z`, `A-Z` | ❌ No |
| Lab Type | Selection | Yes | - | - | Dropdown options | - |
| Lab Phone | Numeric | Yes | 10 | 10 | `0-9` | ✅ Yes (only) |
| Lab Email | Email | Yes | - | - | Email format | ✅ Yes |
| Description | Free text | No | - | - | All | ✅ Yes |
| Director Name | Alphabetic | Yes | 2 | 50 | `a-z`, `A-Z`, spaces, `-`, `'` | ❌ No |
| Director Email | Email | Yes | - | - | Email format | ✅ Yes |
| Director Phone | Numeric | Yes | 10 | 10 | `0-9` | ✅ Yes (only) |
| Data Privacy | Checkbox | Yes | - | - | Boolean | - |

---

## Implementation Details

### Real-Time Input Filtering

The form implements real-time input filtering in the `handleChange` function:

1. **Phone Numbers**: Strips all non-digit characters, limits to 10 digits
2. **ZIP Codes**: Strips all non-digit characters, limits to 6 digits
3. **Username**: Strips all non-alphabetic characters, limits to 30 characters
4. **License Number**: Strips all non-alphabetic characters, limits to 20 characters
5. **Name Fields**: Strips numbers and invalid special characters, allows only letters, spaces, hyphens, and apostrophes

### Validation Timing

- **Step 1 & 2**: Validation occurs when clicking "Next" button
- **Step 3**: Validation occurs when clicking "Complete Registration" button
- **No automatic validation**: Validation does not occur when navigating between steps

### Error Display

- Errors are displayed immediately below the respective input field
- Error messages are specific and actionable
- Errors are cleared when the user starts typing in the field
- Errors persist until the field is corrected and validated

---

## Testing Scenarios

### Valid Input Examples

```javascript
// Step 1
username: "john"
password: "Password123"
phone: "1234567890"
firstName: "John"
lastName: "Doe"

// Step 2
address: "123 Main Street"
city: "New York"
state: "New York"
zip: "12345"
country: "United States"

// Step 3
labName: "ABC Medical Laboratory"
labAddress: "456 Lab Street"
labCity: "San Francisco"
labState: "California"
labZip: "94102"
labCountry: "United States"
licenseNumber: "LABLICENSE"
labPhone: "9876543210"
labEmail: "info@lab.com"
directorName: "Dr. John Doe"
directorEmail: "director@lab.com"
directorPhone: "1234567890"
```

### Invalid Input Examples

```javascript
// Step 1 - Invalid
username: "john123"        // Contains numbers
username: "john_doe"       // Contains underscore
phone: "123-456-7890"     // Contains dashes
firstName: "John123"       // Contains numbers

// Step 2 - Invalid
city: "New York123"        // Contains numbers
zip: "12345-6789"         // Contains dash
country: "USA123"          // Contains numbers

// Step 3 - Invalid
labName: "Lab123"          // Contains numbers
licenseNumber: "LAB123"    // Contains numbers
labPhone: "+1234567890"    // Contains plus sign
```

---

## Security Considerations

1. **Input Sanitization**: All inputs are sanitized at the input level to prevent invalid data entry
2. **Server-Side Validation**: These rules should also be enforced on the server side
3. **SQL Injection Prevention**: Input filtering helps prevent injection attacks
4. **XSS Prevention**: Special characters are restricted where appropriate

---

## Maintenance Notes

- All validation rules are centralized in validation helper functions
- Regex patterns are documented and can be easily updated
- Error messages are user-friendly and specific
- Input filtering happens in real-time for better UX

---

## Version History

- **v1.0** (Current): Initial validation rules with alphabetic-only string fields
  - Username: Alphabetic only (no numbers)
  - All name/location fields: Alphabetic with limited special characters (no numbers)
  - License number: Alphabetic only (no numbers)

---

## Contact

For questions or updates to validation rules, contact the development team.

