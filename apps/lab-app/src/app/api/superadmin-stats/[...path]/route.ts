import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { callStatsBackend, refreshAccessTokenDeduped } from "@/lib/stats/superAdminBackend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Proxies to /lab-super-admin/stats/*, turning the httpOnly accessToken cookie
// into the Bearer header the backend requires (see lib/stats/superAdminBackend.ts).

async function proxy(req: NextRequest, path: string[]) {
  const cookieStore = cookies();
  let accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  let refreshedCookies: string[] = [];

  // Access token already expired and dropped by the browser - mint a fresh
  // one from the refresh token before giving up.
  if (!accessToken && refreshToken) {
    const result = await refreshAccessTokenDeduped(refreshToken);
    if (result.accessToken) {
      accessToken = result.accessToken;
      refreshedCookies = result.setCookies;
    }
  }

  if (!accessToken) {
    return NextResponse.json(
      { status: "error", message: "Not authenticated" },
      { status: 401 }
    );
  }

  const joinedPath = path.join("/");
  const search = req.nextUrl.search;

  try {
    let backendRes = await callStatsBackend(joinedPath, search, accessToken);

    // Access token was present but the backend rejected it as stale -
    // refresh once and retry, mirroring the reactive 401 handler in api.ts.
    if (backendRes.status === 401 && refreshToken && refreshedCookies.length === 0) {
      const result = await refreshAccessTokenDeduped(refreshToken);
      if (result.accessToken) {
        accessToken = result.accessToken;
        refreshedCookies = result.setCookies;
        backendRes = await callStatsBackend(joinedPath, search, accessToken);
      }
    }

    const data = await backendRes.json().catch(() => null);
    const response = NextResponse.json(data, { status: backendRes.status });
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

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
