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
  parameter: string;
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
  "You are an expert clinical pathologist assistant. Read structured lab report data and produce a concise, deterministic, point-wise JSON summary for a printed lab report. " +
  "Follow this method before writing any output: " +
  "(1) Read every row in FULL CURRENT REPORT FINDINGS - each one is real, reported data; never claim a result is missing, unavailable, or unscored when it is listed. " +
  "(2) Findings are grouped by test panel - look for clusters of abnormal results within the same panel or physiological system (e.g. multiple abnormal liver enzymes, multiple abnormal lipid values, multiple abnormal CBC indices) and reason about the pattern they form together, not each value in isolation. If more than one physiological system has abnormal findings (e.g. a hepatic pattern and anemia in the same report), treat them as separate patterns and make sure each clinically significant one is represented in the output, not just the most prominent one. " +
  "(3) Cross-check PRIOR VISIT HISTORY for the same test names - note whether an abnormality is new, longstanding, worsening, or improving, but only when that exact test has entries in the history; never infer a trend for a test with no history data. " +
  "(4) Rank differential diagnoses by how many abnormal findings support them, then by severity (CRITICAL outranks BORDERLINE). " +
  "(5) Qualitative results (Positive/Negative, Reactive/Non-reactive, Present/Absent, colour, appearance) carry no numeric reference range but are still valid, reportable results - interpret them, never dismiss them as absent or unscored. " +
  "(6) Only after this reasoning, compose the bullets defined below. " +
  "Be medically accurate and conservative; avoid speculation; if a field genuinely cannot be determined from the data given, set it to null - never fabricate a value to fill a field. " +
  "Every bullet must be a single short sentence, maximum 15 words, plain and direct - no compound sentences, no hedging filler, no repeating the field name, no markdown. " +
  "Never write a paragraph. Never merge multiple ideas into one bullet. " +
  "Be rigid and deterministic: given the same or clinically equivalent lab values, always produce the same conclusions, the same bullet count, and the same phrasing style - do not introduce stylistic variation, synonyms, or reordering between runs. " +
  "Use standard, conservative clinical terminology consistently across reports. " +
  "Do NOT include any prose, reasoning, or headings outside the final JSON object. Respond with valid JSON only.";

const JSON_SHAPE =
  "Return ONLY valid JSON in this exact shape and key order (no extra keys, no comments, no backticks). " +
  "Every array field must contain short bullet strings (max 15 words each, no trailing period unless it's an abbreviation):\n" +
  "{\n" +
  '  "provisionalDiagnosis": ["Up to 3 bullets. Order by (a) number of correlating abnormal findings, (b) severity. Most likely pattern first."],\n' +
  '  "patientInterpretation": ["Up to 2 bullets, plain language a patient understands, no jargon, no test codes."],\n' +
  '  "clinicalInterpretation": ["Up to 5 bullets, each a distinct role, in this order: 1) the dominant abnormal pattern or affected system, 2) severity/urgency of that pattern, 3) trend vs prior history only if history exists for an involved test, 4) any second, independently abnormal system elsewhere in this report (e.g. anemia alongside a hepatic pattern) - omit if only one system is abnormal, 5) the single most useful next test or referral. One idea per bullet; omit a role only if there is genuinely nothing to say for it, never invent content to fill it."],\n' +
  '  "tips": ["Exactly 2 bullets: general self-care/preparation guidance relevant to the diagnosis, no prescriptions."],\n' +
  '  "doctorToVisit": "Single most appropriate specialty as a plain string (e.g., Endocrinologist)."\n' +
  "}\n" +
  "If a lab report shows no significant abnormalities, keep provisionalDiagnosis and clinicalInterpretation to 1-2 bullets stating findings are within normal limits.\n" +
  "If the report contains only qualitative results (e.g. a urine pregnancy test reported Positive/Negative, or Reactive/Non-reactive, Present/Absent) with no numeric reference ranges, still populate tips and doctorToVisit based on that result and the test type - never leave every field null. Base provisionalDiagnosis and patientInterpretation on the qualitative result itself (e.g. a positive pregnancy test), and set clinicalInterpretation to null only if no numeric result exists to interpret.";

function formatFindingTag(f: AiTestFinding): string {
  if (f.qualitative) return "[QUALITATIVE]";
  if (f.status === "unscored") return "[UNSCORED]";
  if (f.status === "critical" || f.status === "borderline") {
    return `[${f.status.toUpperCase()}${f.direction ? ` ${f.direction.toUpperCase()}` : ""}]`;
  }
  return "[NORMAL]";
}

// Groups a flat, per-row list by testName while preserving first-appearance order, so
// findings/history read as panels instead of an unstructured stream - the same panel
// grouping a lab report itself uses, which is what lets the model spot a pattern (e.g.
// three abnormal liver enzymes) instead of reasoning about each row in isolation.
function groupByTestName<T extends { testName: string }>(items: T[]): Array<[string, T[]]> {
  const order: string[] = [];
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const key = item.testName || "Unspecified Test";
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(item);
  });
  return order.map((key) => [key, map.get(key)!]);
}

const parseDateSafe = (d: string) => {
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : 0;
};

export function buildLabReportPrompt({ patient, testFindings, history }: BuildLabReportPromptInput) {
  const patientLines = [
    `Name: ${patient.name || "Unknown"}`,
    patient.age ? `Age: ${patient.age}` : null,
    patient.gender ? `Gender: ${patient.gender}` : null,
  ].filter(Boolean).join("\n");

  // Pass 1: a quick abnormal-only scan so the model isn't hunting for the signal inside
  // a wall of normal rows. Critical findings are surfaced ahead of borderline ones.
  const abnormalFindings = testFindings
    .filter((f) => f.status === "critical" || f.status === "borderline")
    .sort((a, b) => (a.status === b.status ? 0 : a.status === "critical" ? -1 : 1));

  const abnormalSummaryLines = abnormalFindings.length
    ? abnormalFindings
        .map((f) => `- ${f.parameter} (${f.testName}): ${f.value}${f.unit ? ` ${f.unit}` : ""} ${formatFindingTag(f)}`)
        .join("\n")
    : "None - every scoreable result is within normal limits.";

  // Pass 2: the full findings set, grouped by test panel so correlated abnormalities
  // within the same panel (e.g. LFT, lipid profile, CBC) sit next to each other.
  const groupedFindingsLines = testFindings.length
    ? groupByTestName(testFindings)
        .map(([testName, rows]) => {
          const rowLines = rows
            .map((f) => {
              const tag = formatFindingTag(f);
              return f.qualitative
                ? `  - ${f.parameter}: ${f.value} ${tag}`
                : `  - ${f.parameter}: ${f.value}${f.unit ? ` ${f.unit}` : ""} (reference ${f.normalRange || "N/A"}) ${tag}`;
            })
            .join("\n");
          return `${testName}:\n${rowLines}`;
        })
        .join("\n\n")
    : "No structured test findings available.";

  // History grouped by test panel, then by parameter within the panel, each parameter's
  // points ordered chronologically -- a multi-parameter test (CBC, LFT, ...) reads as one
  // trend per parameter instead of interleaving unrelated parameters under one timeline.
  const historyLines = history.length
    ? groupByTestName(history)
        .map(([testName, testPoints]) => {
          const paramOrder: string[] = [];
          const byParameter = new Map<string, AiHistoryPoint[]>();
          testPoints.forEach((point) => {
            const key = point.parameter || testName;
            if (!byParameter.has(key)) {
              byParameter.set(key, []);
              paramOrder.push(key);
            }
            byParameter.get(key)!.push(point);
          });
          const paramLines = paramOrder
            .map((parameter) => {
              const sorted = [...byParameter.get(parameter)!].sort(
                (a, b) => parseDateSafe(a.visitDate) - parseDateSafe(b.visitDate)
              );
              const pointLines = sorted
                .map((h) => `    - ${h.visitDate}: ${h.value}${h.unit ? ` ${h.unit}` : ""} (reference ${h.normalRange || "N/A"})`)
                .join("\n");
              return `  ${parameter}:\n${pointLines}`;
            })
            .join("\n");
          return `${testName}:\n${paramLines}`;
        })
        .join("\n\n")
    : "No prior visit history available.";

  const userContent =
    `PATIENT\n${patientLines}\n\n` +
    `ABNORMAL FINDINGS SUMMARY (${abnormalFindings.length} of ${testFindings.length} results)\n${abnormalSummaryLines}\n\n` +
    `FULL CURRENT REPORT FINDINGS (grouped by test panel)\n${groupedFindingsLines}\n\n` +
    `PRIOR VISIT HISTORY (grouped by test, chronological - for trend context)\n${historyLines}\n\n` +
    JSON_SHAPE;

  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userContent },
  ];
}
