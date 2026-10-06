import { TestReferancePoint } from '@/types/test/testlist';

// Radiology tests are identified by category, or by name for tests whose category is missing/generic
// (same rules the report print view has used since the original radiology implementation).
export const RADIOLOGY_PATTERNS = [
  /\bRADIOLOGY\b/i,
  /\bX[\s-]?RAY\b/i,
  /\bUSG\b/i,
  /\bULTRASOUND\b/i,
  /\bCT\b/i,
  /\bMRI\b/i,
  /\bPET\b/i,
  /\bMAMMO(?:GRAPHY)?\b/i,
  /\bDOPPLER\b/i,
  // ultrasound naming used by the lab's USG formats
  /\bHRUS\b/i,
  /\bSONO(?:GRAPHY|MAMMOGRAPHY)?\b/i,
  /\bTRUS\b/i,
  /\bTVS\b/i,
  /\bTIFFA\b/i,
  /\bSCAN\b/i,
];

export const isRadiologyTest = (testName?: string, testCategory?: string) => {
  if ((testCategory || '').trim().toUpperCase() === 'RADIOLOGY') return true;
  const name = (testName || '').trim();
  return !!name && RADIOLOGY_PATTERNS.some(pattern => pattern.test(name));
};

// Placeholder DETAILED REPORT reference row for radiology tests that have no report template
// configured, so the report editor (and its format library) can still be used for them.
export const createRadiologyReportPoint = (testName: string, category?: string): TestReferancePoint => ({
  id: -1,
  category: category || 'RADIOLOGY',
  testName,
  testDescription: 'DETAILED REPORT',
  units: '',
  gender: 'MF',
  minReferenceRange: 0,
  maxReferenceRange: 0,
  ageMin: 0,
  ageMax: 100,
  minAgeUnit: 'YEARS',
  maxAgeUnit: 'YEARS',
  reportJson: '',
});

export const hasDetailedReportPoint = (points: TestReferancePoint[]) =>
  points.some(point => (point.testDescription || '').toUpperCase() === 'DETAILED REPORT');
