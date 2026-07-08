export interface AiReportInsights {
  provisionalDiagnosis: string[] | null;
  patientInterpretation: string[] | null;
  clinicalInterpretation: string[] | null;
  tips: string[] | null;
  doctorToVisit: string | null;
}
