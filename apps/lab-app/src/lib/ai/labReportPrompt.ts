export interface AiTestFinding {
  testName: string;
  parameter: string;
  value: string;
  unit?: string;
  normalRange?: string;
  status: "critical" | "borderline" | "normal" | "unscored";
  direction?: "high" | "low";
  // Qualitative result (Positive/Negative, Reactive/Non-reactive, Present/Absent,
  // colour, appearance, ...) with no numeric reference range to score against. The
  // reported value is still clinically meaningful, so it is handed to the model.
  qualitative?: boolean;
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
  "You are an expert clinical assistant. Read the structured lab report data and produce a short, point-wise, structured JSON summary. " +
  "Be medically accurate, avoid speculation, and reflect uncertainty when data is insufficient. If a field cannot be determined, set it to null. " +
  "Every finding listed under 'Current Report Findings' IS present in this report — treat each one as real, reported data. " +
  "Never claim results are missing, unavailable, or unscored when findings are listed; base your analysis strictly on the values given and do not invent values that are absent. " +
  "Qualitative findings (e.g. Positive/Negative, Reactive/Non-reactive, Present/Absent, colour, appearance) carry no numeric reference range but are still valid results — interpret them, never dismiss them as absent. " +
  "Every bullet must be a single short sentence, maximum 15 words, plain and direct — no compound sentences, no hedging filler, no repeating the field name. " +
  "Never write a paragraph. Never merge multiple ideas into one bullet. " +
  "Be rigid and deterministic: given the same or clinically equivalent lab values, always produce the same conclusions, the same bullet count, and the same phrasing style — do not introduce stylistic variation, synonyms, or reordering between runs. " +
  "Use standard, conservative clinical terminology consistently across reports. " +
  "Do NOT include any prose outside JSON. Respond with valid JSON only.";

const JSON_SHAPE =
  "Return ONLY valid JSON in this exact shape and key order (no extra keys, no comments, no backticks). " +
  "Every array field must contain short bullet strings (max 15 words each, no trailing period unless it's an abbreviation):\n" +
  "{\n" +
  '  "provisionalDiagnosis": ["Up to 3 bullets, most likely diagnosis first, ordered by likelihood."],\n' +
  '  "patientInterpretation": ["Up to 2 bullets, plain language, no jargon."],\n' +
  '  "clinicalInterpretation": ["Up to 4 bullets: key abnormal result(s), most likely differential, and the single next test/referral. One idea per bullet."],\n' +
  '  "tips": ["Exactly 2 bullets: general self-care/preparation guidance relevant to the diagnosis, no prescriptions."],\n' +
  '  "doctorToVisit": "Single most appropriate specialty as a plain string (e.g., Endocrinologist)."\n' +
  "}\n" +
  "If a lab report shows no significant abnormalities, keep provisionalDiagnosis and clinicalInterpretation to 1-2 bullets stating findings are within normal limits.\n" +
  "If the report contains only qualitative results (e.g. a urine pregnancy test reported Positive/Negative, or Reactive/Non-reactive, Present/Absent) with no numeric reference ranges, still populate tips and doctorToVisit based on that result and the test type — never leave every field null. Base provisionalDiagnosis and patientInterpretation on the qualitative result itself (e.g. a positive pregnancy test), and set clinicalInterpretation to null only if no numeric result exists to interpret.";

export function buildLabReportPrompt({ patient, testFindings, history }: BuildLabReportPromptInput) {
  const patientLines = [
    `Name: ${patient.name || "Unknown"}`,
    patient.age ? `Age: ${patient.age}` : null,
    patient.gender ? `Gender: ${patient.gender}` : null,
  ].filter(Boolean).join("\n");

  const findingsLines = testFindings.length
    ? testFindings
        .map((f) =>
          f.qualitative
            ? `- ${f.parameter} (${f.testName}): ${f.value} [qualitative result — no numeric reference range]`
            : `- ${f.parameter} (${f.testName}): ${f.value}${f.unit ? ` ${f.unit}` : ""}, reference ${f.normalRange || "N/A"}, status: ${f.status}${f.direction ? ` (${f.direction})` : ""}`
        )
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
