import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { LabPerformanceRow } from "@/types/statisticsData";
import { callStatsBackend, refreshAccessTokenDeduped } from "@/lib/stats/superAdminBackend";
import { buildLabPerformanceCsv } from "@/lib/stats/labPerformanceCsv";
import { buildExportFilename } from "@/lib/stats/dashboardCardCsv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Lab Performance Summary CSV export. Like grid-export, the browser opens this
// URL directly so the file lands in its own Downloads. /lab-performance isn't
// paginated - it takes a `limit` - so one call with a high limit covers every
// lab (the dashboard table only shows the top 6). It's a single short request,
// so the normal refresh-on-401 flow is safe here (unlike the streaming export).
//
// Query params (all optional): labId, startDate, endDate.

const ALL_LABS_LIMIT = 1000;

type LabPerformanceEnvelope = { data: LabPerformanceRow[]; message: string; status: string };

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  let accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  let refreshedCookies: string[] = [];

  if (!accessToken && refreshToken) {
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
  params.set("limit", String(ALL_LABS_LIMIT));
  const search = `?${params.toString()}`;

  try {
    let res = await callStatsBackend("lab-performance", search, accessToken);

    if (res.status === 401 && refreshToken && refreshedCookies.length === 0) {
      const result = await refreshAccessTokenDeduped(refreshToken);
      if (result.accessToken) {
        refreshedCookies = result.setCookies;
        res = await callStatsBackend("lab-performance", search, result.accessToken);
      }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return NextResponse.json(
        body ?? { status: "error", message: "Failed to export lab performance" },
        { status: res.status }
      );
    }
    const rows = ((await res.json()) as LabPerformanceEnvelope).data || [];

    const response = new NextResponse(buildLabPerformanceCsv(rows), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        // labLabel = selected lab's name or "all-labs"; re-sanitized here since it comes from the URL; the date range is the selected filter.
        "Content-Disposition": `attachment; filename="${buildExportFilename(
          "lab-performance-summary",
          req.nextUrl.searchParams.get("labLabel"),
          req.nextUrl.searchParams.get("startDate"),
          req.nextUrl.searchParams.get("endDate")
        )}"`,
        "Cache-Control": "no-store",
      },
    });
    refreshedCookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message: "Failed to reach statistics service", error: errorMessage },
      { status: 502 }
    );
  }
}
