import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { GridReportResponse } from "@/types/statisticsData";
import {
  callStatsBackend,
  refreshAccessTokenDeduped,
  secondsUntilExpiry,
} from "@/lib/stats/superAdminBackend";
import { gridReportCsvHeaderLine, gridReportRowToCsvLine } from "@/lib/stats/gridReportCsv";
import { toExportLabLabel } from "@/lib/stats/dashboardCardCsv";
import { generateCSVFilename } from "@/utils/csvUtils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Billing Report CSV export. The browser opens this URL directly (a plain
// <a download> link, no JS fetch), so it shows up in the browser's own
// Downloads straight away and keeps going in the background. Pages through
// /lab-super-admin/stats/grid and streams each page's rows out as soon as it
// arrives, so large exports never sit fully in memory on either side.
//
// Query params (all optional): labId, startDate, endDate - same as /grid.

const PAGE_SIZE = 200;

// Refresh up front if the access token expires within this window. Once the
// stream has started, response headers are already sent, so a mid-export
// refresh couldn't deliver the rotated cookies to the browser - and since
// refresh tokens rotate on use, that would silently log the user out.
const MIN_TOKEN_LIFETIME_SECONDS = 10 * 60;

type GridEnvelope = { data: GridReportResponse; message: string; status: string };

async function fetchGridPage(
  baseParams: URLSearchParams,
  page: number,
  accessToken: string
): Promise<Response> {
  const params = new URLSearchParams(baseParams);
  params.set("page", String(page));
  params.set("size", String(PAGE_SIZE));
  return callStatsBackend("grid", `?${params.toString()}`, accessToken);
}

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  let accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  let refreshedCookies: string[] = [];

  const lifetime = accessToken ? secondsUntilExpiry(accessToken) : null;
  const needsRefresh = !accessToken || (lifetime !== null && lifetime < MIN_TOKEN_LIFETIME_SECONDS);
  if (needsRefresh && refreshToken) {
    const result = await refreshAccessTokenDeduped(refreshToken);
    if (result.accessToken) {
      accessToken = result.accessToken;
      refreshedCookies = result.setCookies;
    }
  }

  if (!accessToken) {
    return NextResponse.json({ status: "error", message: "Not authenticated" }, { status: 401 });
  }

  const baseParams = new URLSearchParams();
  for (const key of ["labId", "startDate", "endDate"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value) baseParams.set(key, value);
  }

  // Fetch page 0 before committing to a 200 so auth/backend failures come
  // back as a real error status instead of a truncated CSV.
  let firstPage: GridReportResponse;
  try {
    const res = await fetchGridPage(baseParams, 0, accessToken);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return NextResponse.json(body ?? { status: "error", message: "Failed to export billing report" }, {
        status: res.status,
      });
    }
    firstPage = ((await res.json()) as GridEnvelope).data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message: "Failed to reach statistics service", error: errorMessage },
      { status: 502 }
    );
  }

  const token = accessToken;
  const encoder = new TextEncoder();
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let serialNo = 0;
        const writeRows = (rows: GridReportResponse["rows"]) => {
          const lines = (rows || []).map((row) => gridReportRowToCsvLine(row, ++serialNo));
          if (lines.length > 0) controller.enqueue(encoder.encode(lines.join("\n") + "\n"));
        };

        controller.enqueue(encoder.encode(gridReportCsvHeaderLine() + "\n"));
        writeRows(firstPage.rows);

        for (let page = 1; page < (firstPage.totalPages || 0) && !cancelled; page++) {
          const res = await fetchGridPage(baseParams, page, token);
          if (!res.ok) throw new Error(`Backend returned ${res.status} for grid page ${page}`);
          writeRows(((await res.json()) as GridEnvelope).data.rows);
        }

        if (!cancelled) controller.close();
      } catch (error) {
        // Erroring the stream makes the browser mark the download as failed
        // rather than saving a silently truncated file.
        console.error("Billing report CSV export failed:", error);
        if (!cancelled) controller.error(error);
      }
    },
    cancel() {
      // User cancelled the download in the browser - stop paging the backend.
      cancelled = true;
    },
  });

  const response = new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      // labLabel = selected lab's name or "all-labs"; re-sanitized here since it comes from the URL.
      "Content-Disposition": `attachment; filename="${generateCSVFilename(
        `billing-grid-report-${toExportLabLabel(req.nextUrl.searchParams.get("labLabel"))}`
      )}"`,
      "Cache-Control": "no-store",
    },
  });
  refreshedCookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));
  return response;
}
