// Server-only helpers shared by the /api/superadmin-stats/* route handlers.
//
// SuperAdminStatsController on the backend authenticates via a mandatory
// `Authorization` header instead of the httpOnly accessToken cookie every
// other endpoint uses. The browser can never read that cookie to build the
// header itself (that's the point of httpOnly), but the route handlers run on
// the Next.js server, which receives the cookie with every request regardless.
// So they re-attach it as a Bearer header and call the backend.

export const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export type RefreshResult = { accessToken: string | null; setCookies: string[] };

// Refresh tokens are rotated server-side on every use (see api.ts), so if
// SuperAdminStats.tsx's Promise.allSettled fan-out of ~13 calls all land
// with an expired accessToken at once, they must not each independently
// hit /auth/refresh - the second call would invalidate the first's rotated
// refreshToken and fail. Dedup within this server process the same way
// utils/api.ts dedupes concurrent browser-side refreshes. Lives in this
// module (not a route file) so every stats route shares the same lock.
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

export function refreshAccessTokenDeduped(refreshToken: string): Promise<RefreshResult> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh(refreshToken).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function callStatsBackend(path: string, search: string, accessToken: string) {
  return fetch(`${backendBaseUrl}/lab-super-admin/stats/${path}${search}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}

// Seconds until the JWT's `exp` claim, or null if it can't be read. Not a
// signature check - the backend still validates the token; this only decides
// whether to refresh up front.
export function secondsUntilExpiry(jwt: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.exp === "number" ? payload.exp - Math.floor(Date.now() / 1000) : null;
  } catch {
    return null;
  }
}
