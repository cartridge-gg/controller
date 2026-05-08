// Bearer token storage and issuance for cookie-less auth.
//
// The keychain iframe cannot rely on the auth cookie when embedded in a
// third-party parent because Safari ITP partitions the cookie jar by parent
// site. Instead, the popup (running first-party at x.cartridge.gg) exchanges
// its cookie for a JWT via createBearerToken, posts the JWT to the iframe,
// and the iframe attaches it as Authorization: Bearer on every request.
//
// localStorage is automatically partitioned per parent site by both Safari
// and Chrome, so each embedding site gets its own token without extra keying.

// Intentionally NOT prefixed `@cartridge/` — keys with that prefix are bundled
// into the cross-domain encrypted snapshot (see utils/storageSnapshot.ts) and
// would follow the user across embedding sites. We want the bearer token to
// stay scoped to its parent-site-partitioned localStorage, so each embedding
// site requires its own popup-auth.
const STORAGE_KEY = "cartridge.bearerToken";

export function setBearerToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // localStorage may be unavailable in private browsing modes.
  }
}

export function getBearerToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearBearerToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Calls createBearerToken in the popup, where the cookie is first-party.
// Returns null on failure so the popup can still complete (the iframe will
// fall back to whatever auth path it can — useful in non-Safari contexts).
export async function issueBearerToken(): Promise<string | null> {
  const apiUrl = import.meta.env.VITE_CARTRIDGE_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/query`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "mutation { createBearerToken }" }),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: { createBearerToken?: string };
      errors?: unknown;
    };

    if (json.errors || !json.data?.createBearerToken) return null;
    return json.data.createBearerToken;
  } catch {
    return null;
  }
}
