export interface AiReportInsights {
  provisionalDiagnosis: string[] | null;
  patientInterpretation: string[] | null;
  clinicalInterpretation: string[] | null;
  tips: string[] | null;
  doctorToVisit: string | null;
}

/**
 * How the backend persists the observations against a visit: one flat string per
 * field, shared by every device that opens that visit's report. The UI works in
 * bullet arrays (`AiReportInsights` above), so the two shapes are converted by
 * `@/lib/ai/aiClinicalObservation`.
 */
export interface AiClinicalObservation {
  provisionalDiagnosis: string | null;
  clinicalInterpretation: string | null;
  doctorToVisit: string | null;
  patientInterpretation: string | null;
  tips: string | null;
  /**
   * Fingerprint of the report values these observations were written from, so a device
   * reading them back can tell whether a result has been edited since. Optional because
   * a record stored without it (or by a backend that does not persist the column yet)
   * still has to deserialise -- see `toAiReportInsights`.
   */
  contentHash?: string | null;
}
