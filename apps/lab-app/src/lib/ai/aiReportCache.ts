import type { AiReportInsights } from "@/types/aiInsights";
import type { AiTestFinding } from "@/lib/ai/labReportPrompt";

const STORAGE_PREFIX = "ai-report-cache:";
const MAX_ENTRIES = 100;

interface CacheEntry {
  insights: AiReportInsights;
  cachedAt: number;
}

// djb2 -- not cryptographic, just needs to change when the underlying report
// data changes so a stale key naturally falls out of the cache.
const hashString = (input: string): string => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
};

// Keyed on the report set plus the values printed on it, and deliberately NOT on the
// patient's visit history: the history is a supporting input to the prompt, not part of
// the report's identity, and it is fetched separately (getPatientHealthSnapshot) so it
// can arrive empty when that call fails. Folding it into the key would mint a second
// entry for the same report and re-run the OpenAI call the next time the report is
// opened -- exactly the duplicate spend the cache exists to prevent. The findings hash
// stays in, so editing a result still invalidates stale insights.
export const buildAiReportCacheKey = (
  reportIds: number[],
  testFindings: AiTestFinding[]
): string => {
  const sortedIds = [...reportIds].sort((a, b) => a - b).join(",");
  const payloadHash = hashString(JSON.stringify(testFindings));
  return `${STORAGE_PREFIX}${sortedIds}:${payloadHash}`;
};

export const readAiReportCache = (key: string): AiReportInsights | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    return entry.insights ?? null;
  } catch {
    return null;
  }
};

export const writeAiReportCache = (key: string, insights: AiReportInsights): void => {
  try {
    const entry: CacheEntry = { insights, cachedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
    evictOldEntriesIfNeeded();
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) -- caching is
    // best-effort, so just skip it.
  }
};

const evictOldEntriesIfNeeded = (): void => {
  const entries: Array<{ key: string; cachedAt: number }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
    try {
      const entry = JSON.parse(localStorage.getItem(key) || "{}") as CacheEntry;
      entries.push({ key, cachedAt: entry.cachedAt ?? 0 });
    } catch {
      entries.push({ key, cachedAt: 0 });
    }
  }

  if (entries.length <= MAX_ENTRIES) return;

  entries
    .sort((a, b) => a.cachedAt - b.cachedAt)
    .slice(0, entries.length - MAX_ENTRIES)
    .forEach(({ key }) => localStorage.removeItem(key));
};
