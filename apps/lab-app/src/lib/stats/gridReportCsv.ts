// Billing Report helpers. The CSV itself is built by the backend
// (/lab-super-admin/stats/grid/download); api/superadmin-stats/grid-export post-processes it below.

// Backend sends a visit's tests as one comma-separated string ("CBC, Lipid Profile").
export const splitTestNames = (testNames?: string | null): string[] =>
  (testNames || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

// Columns the backend CSV includes but the downloaded file shouldn't.
const DROPPED_COLUMNS = new Set(["Lab ID", "Created At"]);
const DOCTOR_COLUMN = "Doctor Name";

const toCsvCell = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

// Streaming transform for the backend's /grid/download CSV: drops DROPPED_COLUMNS
// (matched by header name, so column order on the backend doesn't matter) and shows
// "N/A" for a blank doctor. Quote-aware, so commas/newlines inside cells are safe,
// and holds only the current record in memory, so large exports stay streaming.
export function createGridCsvTransform(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let record: string[] = [];
  let cell = "";
  let inQuotes = false;
  let pendingQuote = false; // saw a `"` inside quotes - either an escape or the closing quote
  let header: string[] | null = null;
  let keep: boolean[] = [];
  let doctorIndex = -1;

  const flushRecord = (): string => {
    record.push(cell);
    const fields = record;
    record = [];
    cell = "";

    if (!header) {
      header = fields.map((name) => name.trim());
      keep = header.map((name) => !DROPPED_COLUMNS.has(name));
      doctorIndex = header.indexOf(DOCTOR_COLUMN);
    } else if (doctorIndex >= 0 && ["", "null"].includes((fields[doctorIndex] ?? "").trim())) {
      fields[doctorIndex] = "N/A";
    }
    return fields.filter((_, i) => keep[i] !== false).map(toCsvCell).join(",") + "\n";
  };

  const process = (text: string): string => {
    let out = "";
    for (const ch of text) {
      if (pendingQuote) {
        pendingQuote = false;
        if (ch === '"') {
          cell += '"';
          continue;
        }
        inQuotes = false; // it was the closing quote; handle ch normally below
      }
      if (inQuotes) {
        if (ch === '"') pendingQuote = true;
        else cell += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        record.push(cell);
        cell = "";
      } else if (ch === "\n") {
        out += flushRecord();
      } else if (ch !== "\r") {
        cell += ch;
      }
    }
    return out;
  };

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const out = process(decoder.decode(chunk, { stream: true }));
      if (out) controller.enqueue(encoder.encode(out));
    },
    flush(controller) {
      let out = process(decoder.decode());
      if (pendingQuote) inQuotes = false;
      if (cell !== "" || record.length > 0) out += flushRecord();
      if (out) controller.enqueue(encoder.encode(out));
    },
  });
}
