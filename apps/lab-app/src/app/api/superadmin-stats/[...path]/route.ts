import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// SuperAdminStatsController on the backend authenticates via a mandatory
// `Authorization` header instead of the httpOnly accessToken cookie every
// other endpoint uses. The browser can never read that cookie to build the
// header itself (that's the point of httpOnly), but this route runs on the
// Next.js server, which receives the cookie with every request regardless.
// So it re-attaches it as a Bearer header and proxies through to the backend.

const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;

type RefreshResult = { accessToken: string | null; setCookies: string[] };

// Refresh tokens are rotated server-side on every use (see api.ts), so if
// SuperAdminStats.tsx's Promise.allSettled fan-out of ~13 calls all land
// with an expired accessToken at once, they must not each independently
// hit /auth/refresh - the second call would invalidate the first's rotated
// refreshToken and fail. Dedup within this server process the same way
// utils/api.ts dedupes concurrent browser-side refreshes.
let refreshInFlight: Promise<RefreshResult> | null = null;

async function doRefresh(refreshToken: string): Promise<RefreshResult> {
  try {
    const res = await fetch(`${backendBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return { accessToken: null, setCookies: [] };
    }

    const setCookies = res.headers.getSetCookie();
    const accessTokenCookie = setCookies.find((c) => c.startsWith("accessToken="));
    const accessToken = accessTokenCookie
      ? accessTokenCookie.split(";")[0].split("=").slice(1).join("=")
      : null;

    return { accessToken, setCookies };
  } catch {
    return { accessToken: null, setCookies: [] };
  }
}

function refreshAccessTokenDeduped(refreshToken: string): Promise<RefreshResult> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh(refreshToken).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function callBackend(path: string, search: string, accessToken: string) {
  return fetch(`${backendBaseUrl}/lab-super-admin/stats/${path}${search}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}

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
    let backendRes = await callBackend(joinedPath, search, accessToken);

    // Access token was present but the backend rejected it as stale -
    // refresh once and retry, mirroring the reactive 401 handler in api.ts.
    if (backendRes.status === 401 && refreshToken && refreshedCookies.length === 0) {
      const result = await refreshAccessTokenDeduped(refreshToken);
      if (result.accessToken) {
        accessToken = result.accessToken;
        refreshedCookies = result.setCookies;
        backendRes = await callBackend(joinedPath, search, accessToken);
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
