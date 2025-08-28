// Age calculation utility functions

// Helper function to format age string with full words and proper pluralization
export const formatAgeString = (ageString: string): string => {
  if (!ageString) return '';
  
  // First normalize any existing abbreviations to full words
  const normalized = ageString
    .replace(/\byr\b/g, 'year')
    .replace(/\bmo\b/g, 'month')
    .replace(/\bday\b/g, 'day');
  
  // Then handle pluralization
  return normalized.replace(/(\d+) (year|month|day)s?/g, (match, num, unit) => {
    return `${num} ${unit}${parseInt(num) !== 1 ? 's' : ''}`;
  });
};

// Calculate age from date of birth (returns formatted string with full words)
export const calculateAge = (dob: string): string => {
  if (!dob) return '';
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
    days += lastDayOfMonth;
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Format the age string with full words and proper pluralization
  const ageParts = [];
  if (years > 0) ageParts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) ageParts.push(`${months} month${months !== 1 ? 's' : ''}`);
  if (days > 0) ageParts.push(`${days} day${days !== 1 ? 's' : ''}`);

  // Join with 'and' before the last part if there are multiple parts
  if (ageParts.length > 1) {
    const lastPart = ageParts.pop();
    return `${ageParts.join(' ')} and ${lastPart}`;
  }
  
  return ageParts.join(' ');
};

// Calculate age in years only (returns "24 yrs" format)
export const calculateAgeInYears = (dob: string): string => {
  if (!dob) return '';
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
    days += lastDayOfMonth;
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Return only years in "24 yrs" format
  return `${Math.max(0, years)} yrs`;
};

// Parse age string into years, months, days (handles both full and abbreviated formats)
export const parseAgeString = (ageString: string) => {
  if (!ageString || ageString === 'null') {
    return { years: '', months: '', days: '' };
  }

  const result = { years: '', months: '', days: '' };
  
  // Handle complex formats like "25 years 7 months and 11 days"
  // First, normalize the string by removing "and" and extra spaces
  const normalizedString = ageString.toLowerCase()
    .replace(/\s+and\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split by spaces and process each part
  const parts = normalizedString.split(' ');
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Check if this part is a number
    if (!isNaN(Number(part))) {
      const value = part;
      const nextPart = parts[i + 1]?.toLowerCase();
      
      if (nextPart?.startsWith('year') || nextPart === 'yr' || nextPart === 'y') {
        result.years = value;
      } else if (nextPart?.startsWith('month') || nextPart === 'mo' || nextPart === 'm') {
        result.months = value;
      } else if (nextPart?.startsWith('day') || nextPart === 'd') {
        result.days = value;
      }
    }
  }

  return result;
};

// Format date to DD/MM/YYYY
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Parse DD/MM/YYYY to Date object (local time, no timezone conversion)
export const parseDateInput = (input: string) => {
  const parts = input.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      // Create date in local time to avoid timezone issues
      const date = new Date(year, month, day, 12, 0, 0);
      // Check if the date is valid
      if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date;
      }
    }
  }
  return null;
};

// Format date to YYYY-MM-DD (local date, no timezone conversion)
export const formatToISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate date of birth from age details
export const calculateDOB = (years: string, months: string, days: string) => {
  const y = parseInt(years) || 0;
  const m = parseInt(months) || 0;
  const d = parseInt(days) || 0;

  if (y === 0 && m === 0 && d === 0) return '';

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  if (y > 100) {
    return '';
  }

  const dob = new Date(today);

  if (years !== '') {
    dob.setFullYear(dob.getFullYear() - y);
  }

  if (months !== '') {
    dob.setMonth(dob.getMonth() - m);
  }

  if (days !== '') {
    dob.setDate(dob.getDate() - d);
  }

  if (dob > today) {
    return formatToISODate(today);
  }

  return formatToISODate(dob);
};

// Calculate age details from date of birth
export const calculateAgeDetails = (dob: string) => {
  if (!dob) return { years: '', months: '', days: '' };

  const birthDate = new Date(dob);
  birthDate.setHours(12, 0, 0, 0);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
    days += lastDayOfMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    years: years > 0 ? years.toString() : '',
    months: months > 0 ? months.toString() : '',
    days: days > 0 ? days.toString() : ''
  };
};

// Calculate age as object with numeric values (for backward compatibility)
export const calculateAgeObject = (dob: string) => {
  if (!dob) return { years: 0, months: 0, days: 0 };

  const birthDate = new Date(dob);
  birthDate.setHours(12, 0, 0, 0);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
    days += lastDayOfMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days)
  };
};

// Validate age field values
export const validateAgeField = (field: 'years' | 'months' | 'days', value: string) => {
  let error = '';

  if (field === 'years' && value) {
    const years = parseInt(value, 10);
    if (years > 100) {
      error = 'Age cannot be more than 100 years';
    }
  } else if (field === 'months' && value) {
    const months = parseInt(value, 10);
    if (months > 12) {
      error = 'Months cannot be more than 12';
    } else if (months < 0) {
      error = 'Months cannot be negative';
    }
  } else if (field === 'days' && value) {
    const days = parseInt(value, 10);
    if (days > 31) {
      error = 'Days cannot be more than 31';
    } else if (days < 0) {
      error = 'Days cannot be negative';
    }
  }

  return error;
};

// Validate date of birth
export const validateDOB = (dob: string, dobInput: string) => {
  if (!dob) return 'Date of birth is required';

  const date = parseDateInput(dobInput);
  if (!date) return 'Invalid date format (DD/MM/YYYY)';

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (date > today) return 'Date cannot be in the future';

  const hundredYearsAgo = new Date();
  hundredYearsAgo.setHours(12, 0, 0, 0);
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
  if (date < hundredYearsAgo) return 'Date cannot be more than 100 years ago';

  return '';
};
