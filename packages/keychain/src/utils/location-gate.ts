import type {
  LocationCoordinates,
  LocationGateOptions,
} from "@cartridge/controller";

/**
 * Returns true if the location gate has any configured rules (allowed or blocked).
 */
export function hasConfiguredLocationGate(gate?: LocationGateOptions): boolean {
  return (
    !!gate &&
    ((gate.allowed?.length ?? 0) > 0 || (gate.blocked?.length ?? 0) > 0)
  );
}

type GeocodeResult = {
  countryCode?: string | null;
  regionCode?: string | null;
  regionName?: string | null;
};

export async function reverseGeocodeLocation(
  coords: LocationCoordinates,
): Promise<GeocodeResult> {
  const url = new URL(
    "https://api.bigdatacloud.net/data/reverse-geocode-client",
  );
  url.searchParams.set("latitude", coords.latitude.toString());
  url.searchParams.set("longitude", coords.longitude.toString());
  url.searchParams.set("localityLanguage", "en");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to resolve location");
  }

  const data = (await response.json()) as {
    countryCode?: string;
    principalSubdivision?: string;
    principalSubdivisionCode?: string;
  };

  return {
    countryCode: data.countryCode ?? null,
    regionCode: data.principalSubdivisionCode ?? null,
    regionName: data.principalSubdivision ?? null,
  };
}

/**
 * Splits a list of location codes into country codes and region codes.
 * Country codes are 2-letter (e.g. "US"), region codes contain a dash (e.g. "US-HI").
 */
function splitCodes(codes: string[]): {
  countries: Set<string>;
  regions: Set<string>;
} {
  const countries = new Set<string>();
  const regions = new Set<string>();
  for (const raw of codes) {
    const code = raw.trim().toUpperCase();
    if (!code) continue;
    if (code.includes("-")) {
      regions.add(code);
    } else {
      countries.add(code);
    }
  }
  return { countries, regions };
}

function matchesLocation(
  countries: Set<string>,
  regions: Set<string>,
  countryCode: string | undefined,
  regionCode: string | undefined,
): boolean {
  if (countryCode && countries.has(countryCode)) return true;
  if (regionCode && regions.has(regionCode)) return true;
  return false;
}

export function evaluateLocationGate({
  gate,
  geo,
}: {
  gate: LocationGateOptions;
  geo: GeocodeResult;
}) {
  const allowed = splitCodes(gate.allowed ?? []);
  const blocked = splitCodes(gate.blocked ?? []);

  const hasAllowlist = allowed.countries.size > 0 || allowed.regions.size > 0;
  const hasBlocklist = blocked.countries.size > 0 || blocked.regions.size > 0;

  if (!hasAllowlist && !hasBlocklist) {
    return { allowed: true };
  }

  const countryCode = geo.countryCode?.trim().toUpperCase();
  const regionCode = geo.regionCode?.trim().toUpperCase();

  // Blocked always wins
  if (
    hasBlocklist &&
    matchesLocation(blocked.countries, blocked.regions, countryCode, regionCode)
  ) {
    return { allowed: false, reason: "Location not eligible" };
  }

  // If only a blocklist is set, allow everything not blocked
  if (!hasAllowlist) {
    return { allowed: true };
  }

  // Check allowlist — allow country match even if specific regions are listed
  if (
    matchesLocation(allowed.countries, allowed.regions, countryCode, regionCode)
  ) {
    return { allowed: true };
  }

  return { allowed: false, reason: "Location not eligible" };
}
