const IP_PROVIDERS = [
  "https://api.ipify.org?format=json",
  "https://ipinfo.io/json",
];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (
  url: string,
  retries: number = MAX_RETRIES,
): Promise<string | null> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const { ip } = await res.json();
      if (ip) {
        return ip;
      }
      throw new Error("No IP in response");
    } catch {
      if (attempt < retries) {
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }
  return null;
};

/**
 * Get the client's public IP address
 * Tries multiple providers with retries before failing
 */
export const getClientIp = async (): Promise<string> => {
  for (const provider of IP_PROVIDERS) {
    const ip = await fetchWithRetry(provider);
    if (ip) {
      return ip;
    }
  }
  throw new Error("Failed to fetch client IP from all providers");
};

/**
 * Get the country code for the client's IP address (e.g. "US").
 * In production, reads from Vercel's x-vercel-ip-country header via /api/geo.
 * Falls back to ipinfo.io for local development.
 * Returns null if detection fails — callers should treat this as "unknown".
 */
/**
 * IP-based geolocation fallback for when browser geolocation is denied
 * (e.g. cross-origin iframes in Brave, mobile WebViews).
 * Returns country code and region code in the same format as reverseGeocodeLocation.
 */
export async function getIpGeo(): Promise<{
  countryCode: string | null;
  regionCode: string | null;
}> {
  try {
    const res = await fetch("https://ipinfo.io/json");
    if (!res.ok) return { countryCode: null, regionCode: null };
    const data = (await res.json()) as {
      country?: string;
      region?: string;
      loc?: string;
    };

    const countryCode = data.country?.toUpperCase() ?? null;

    // ipinfo.io doesn't return ISO region codes directly, but the
    // BigDataCloud reverse-geocode endpoint does. If we have coordinates
    // from ipinfo.io (loc: "lat,lng"), use them to get a proper region code.
    let regionCode: string | null = null;
    if (data.loc && countryCode) {
      const [lat, lng] = data.loc.split(",");
      if (lat && lng) {
        try {
          const geoUrl = new URL(
            "https://api.bigdatacloud.net/data/reverse-geocode-client",
          );
          geoUrl.searchParams.set("latitude", lat);
          geoUrl.searchParams.set("longitude", lng);
          geoUrl.searchParams.set("localityLanguage", "en");
          const geoRes = await fetch(geoUrl.toString());
          if (geoRes.ok) {
            const geoData = (await geoRes.json()) as {
              principalSubdivisionCode?: string;
            };
            regionCode = geoData.principalSubdivisionCode ?? null;
          }
        } catch {
          // Region lookup failed — country-only is still useful
        }
      }
    }

    return { countryCode, regionCode };
  } catch {
    return { countryCode: null, regionCode: null };
  }
}

export async function getIpCountry(): Promise<string | null> {
  try {
    const res = await fetch("/api/geo");
    if (res.ok) {
      const data = (await res.json()) as { country?: string | null };
      if (data.country) return data.country.toUpperCase();
    }
  } catch {
    // Not on Vercel (local dev) — fall through to ipinfo
  }

  try {
    const res = await fetch("https://ipinfo.io/json");
    if (!res.ok) return null;
    const data = (await res.json()) as { country?: string };
    return data.country?.toUpperCase() ?? null;
  } catch {
    return null;
  }
}
