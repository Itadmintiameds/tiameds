import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  callStatsBackend,
  refreshAccessTokenDeduped,
  secondsUntilExpiry,
} from "@/lib/stats/superAdminBackend";
import { createGridCsvTransform } from "@/lib/stats/gridReportCsv";
import { buildExportFilename } from "@/lib/stats/dashboardCardCsv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Billing Report CSV export. The browser opens this URL directly (a plain
// <a download> link, no JS fetch), so it lands in the browser's own Downloads.
// The CSV itself is built by the backend in one request
// (GET /lab-super-admin/stats/grid/download) and piped straight through.
//
// Query params (all optional): labId, startDate, endDate - same as the backend.

// Refresh up front if the access token expires within this window. Once the
// download has started, response headers are already sent, so a mid-export
// refresh couldn't deliver the rotated cookies to the browser.
const MIN_TOKEN_LIFETIME_SECONDS = 2 * 60;

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

  const params = new URLSearchParams();
  for (const key of ["labId", "startDate", "endDate"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value) params.set(key, value);
  }
  const search = params.toString() ? `?${params.toString()}` : "";

  let backendRes: Response;
  try {
    backendRes = await callStatsBackend("grid/download", search, accessToken);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message: "Failed to reach statistics service", error: errorMessage },
      { status: 502 }
    );
  }

  if (!backendRes.ok || !backendRes.body) {
    const body = await backendRes.json().catch(() => null);
    return NextResponse.json(body ?? { status: "error", message: "Failed to export billing report" }, {
      status: backendRes.ok ? 502 : backendRes.status,
    });
  }

  const response = new NextResponse(backendRes.body.pipeThrough(createGridCsvTransform()), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      // labLabel = selected lab's name or "all-labs"; re-sanitized here since it comes from the URL; the date range is the selected filter.
      "Content-Disposition": `attachment; filename="${buildExportFilename(
        "billing-report",
        req.nextUrl.searchParams.get("labLabel"),
        req.nextUrl.searchParams.get("startDate"),
        req.nextUrl.searchParams.get("endDate")
      )}"`,
      "Cache-Control": "no-store",
    },
  });
  refreshedCookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));
  return response;
}
