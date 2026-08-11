import type { AiClinicalObservation, AiReportInsights } from "@/types/aiInsights";
import type { AiTestFinding } from "@/lib/ai/labReportPrompt";

// djb2 -- not cryptographic. It only has to change when the values printed on the report
// change, so an observation stored from the old values can be recognised as stale.
const hashString = (input: string): string => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
};

/**
 * Fingerprint of exactly the report data the model reasons over, stored alongside the
 * observation so any device can tell whether the saved text still describes the current
 * values. Deliberately NOT including the patient's visit history: that is supporting
 * context fetched separately (getPatientHealthSnapshot) and can come back empty when
 * that call fails, which would flip the fingerprint and force a pointless regeneration.
 */
export const buildObservationContentHash = (testFindings: AiTestFinding[]): string =>
  hashString(JSON.stringify(testFindings));

// Bullets are stored one per line. A newline is the only separator that survives the
// round trip intact: the bullets themselves contain commas, semicolons and full stops,
// so any punctuation delimiter would re-split a single bullet into fragments when it is
// read back on another device.
const BULLET_SEPARATOR = "\n";

const toStoredText = (lines: string[] | null | undefined): string | null => {
  if (!Array.isArray(lines)) return null;
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(BULLET_SEPARATOR) : null;
};

const toBullets = (text: string | null | undefined): string[] | null => {
  if (typeof text !== "string") return null;
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : null;
};

/** UI shape -> the flat, per-visit shape the backend stores. */
export const toAiClinicalObservation = (
  insights: AiReportInsights,
  contentHash: string
): AiClinicalObservation => ({
  provisionalDiagnosis: toStoredText(insights.provisionalDiagnosis),
  clinicalInterpretation: toStoredText(insights.clinicalInterpretation),
  doctorToVisit: insights.doctorToVisit?.trim() || null,
  patientInterpretation: toStoredText(insights.patientInterpretation),
  tips: toStoredText(insights.tips),
  contentHash,
});

/**
 * Stored shape -> UI shape. Returns null when there is effectively nothing stored, so a
 * missing record and a record whose fields are all blank both fall through to
 * generation instead of printing an empty AI card on the report.
 */
export const toAiReportInsights = (
  observation: AiClinicalObservation | null | undefined
): AiReportInsights | null => {
  if (!observation) return null;

  const insights: AiReportInsights = {
    provisionalDiagnosis: toBullets(observation.provisionalDiagnosis),
    patientInterpretation: toBullets(observation.patientInterpretation),
    clinicalInterpretation: toBullets(observation.clinicalInterpretation),
    tips: toBullets(observation.tips),
    doctorToVisit: observation.doctorToVisit?.trim() || null,
  };

  const hasContent = Object.values(insights).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );
  return hasContent ? insights : null;
};
