export interface AiTestFinding {
  testName: string;
  parameter: string;
  value: string;
  unit?: string;
  normalRange?: string;
  status: "critical" | "borderline" | "normal" | "unscored";
  direction?: "high" | "low";
}

export interface AiHistoryPoint {
  testName: string;
  visitDate: string;
  value: string;
  unit?: string;
  normalRange?: string;
}

export interface AiPatientContext {
  name: string;
  age?: string;
  gender?: string;
}

export interface BuildLabReportPromptInput {
  patient: AiPatientContext;
  testFindings: AiTestFinding[];
  history: AiHistoryPoint[];
}

const SYSTEM_PROMPT =
  "You are an expert clinical assistant. Read the structured lab report data and produce a concise, structured JSON summary. " +
  "Be medically accurate, avoid speculation, and reflect uncertainty when data is insufficient. If a field cannot be determined, set it to null. " +
  "Do NOT include any prose outside JSON. Respond with valid JSON only.";

const JSON_SHAPE =
  "Return ONLY valid JSON in this exact shape and key order (no extra keys, no comments, no backticks):\n" +
  "{\n" +
  '  "provisionalDiagnosis": "Give the list of possible diagnoses.",\n' +
  '  "patientInterpretation": "Plain-language explanation in 2-4 short sentences, no jargon.",\n' +
  '  "clinicalInterpretation": "Detailed clinical reasoning: key abnormal results with brief interpretation, prioritized differentials with likelihood, pertinent positives/negatives, and immediate next tests/referrals.",\n' +
  '  "tips": "2 concise, general guidance points for patient self-care and preparation (no prescriptions), relevant to the diagnosis.",\n' +
  '  "doctorToVisit": "Most appropriate specialty (e.g., Endocrinologist)."\n' +
  "}";

export function buildLabReportPrompt({ patient, testFindings, history }: BuildLabReportPromptInput) {
  const patientLines = [
    `Name: ${patient.name || "Unknown"}`,
    patient.age ? `Age: ${patient.age}` : null,
    patient.gender ? `Gender: ${patient.gender}` : null,
  ].filter(Boolean).join("\n");

  const findingsLines = testFindings.length
    ? testFindings
        .map((f) => `- ${f.parameter} (${f.testName}): ${f.value}${f.unit ? ` ${f.unit}` : ""}, reference ${f.normalRange || "N/A"}, status: ${f.status}${f.direction ? ` (${f.direction})` : ""}`)
        .join("\n")
    : "No structured test findings available.";

  const historyLines = history.length
    ? history
        .map((h) => `- ${h.testName} on ${h.visitDate}: ${h.value}${h.unit ? ` ${h.unit}` : ""} (reference ${h.normalRange || "N/A"})`)
        .join("\n")
    : "No prior visit history available.";

  const userContent =
    `Patient:\n${patientLines}\n\n` +
    `Current Report Findings:\n${findingsLines}\n\n` +
    `Prior Visit History (for trend context):\n${historyLines}\n\n` +
    JSON_SHAPE;

  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userContent },
  ];
}
