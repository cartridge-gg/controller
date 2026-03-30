type IpLocation = {
  countryCode: string | null;
  regionCode: string | null;
};

/**
 * Get country and region for the client's IP address.
 * In production, reads from Vercel's geo headers via /api/geo.
 * Falls back to ipinfo.io for local development (country only).
 */
export async function getIpLocation(): Promise<IpLocation> {
  try {
    const res = await fetch("/api/geo");
    if (res.ok) {
      const data = (await res.json()) as {
        country?: string | null;
        region?: string | null;
      };
      const country = data.country?.toUpperCase() ?? null;
      const region =
        country && data.region
          ? `${country}-${data.region.toUpperCase()}`
          : null;
      return { countryCode: country, regionCode: region };
    }
  } catch {
    // Not on Vercel (local dev) — fall through to ipinfo
  }

  try {
    const res = await fetch("https://ipinfo.io/json");
    if (!res.ok) return { countryCode: null, regionCode: null };
    const data = (await res.json()) as { country?: string };
    return {
      countryCode: data.country?.toUpperCase() ?? null,
      regionCode: null,
    };
  } catch {
    return { countryCode: null, regionCode: null };
  }
}
