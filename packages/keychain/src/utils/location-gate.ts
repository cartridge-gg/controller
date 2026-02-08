import type {
  LocationCoordinates,
  LocationGateOptions,
} from "@cartridge/controller";

type GeocodeResult = {
  countryCode?: string | null;
  regionCode?: string | null;
  regionName?: string | null;
};

const US_STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

const normalizeCode = (value?: string | null) =>
  value ? value.trim().toUpperCase() : undefined;

const normalizeState = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length === 2) {
    return trimmed.toUpperCase();
  }
  return US_STATE_NAME_TO_CODE[trimmed.toLowerCase()];
};

const normalizeGateOptions = (options: LocationGateOptions) => {
  const allowedCountries = new Set(
    (options.allowedCountries ?? [])
      .map((code) => normalizeCode(code))
      .filter((code): code is string => !!code),
  );
  const allowedRegions = new Set(
    (options.allowedRegions ?? [])
      .map((code) => normalizeCode(code))
      .filter((code): code is string => !!code),
  );
  const allowedStates = new Set(
    (options.allowedStates ?? [])
      .map((code) => normalizeState(code))
      .filter((code): code is string => !!code),
  );

  return { allowedCountries, allowedRegions, allowedStates };
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

export function evaluateLocationGate({
  gate,
  geo,
}: {
  gate: LocationGateOptions;
  geo: GeocodeResult;
}) {
  const { allowedCountries, allowedRegions, allowedStates } =
    normalizeGateOptions(gate);

  if (
    allowedCountries.size === 0 &&
    allowedRegions.size === 0 &&
    allowedStates.size === 0
  ) {
    return { allowed: true };
  }

  const countryCode = normalizeCode(geo.countryCode);
  const regionCode = normalizeCode(geo.regionCode);
  const regionName = geo.regionName;

  if (allowedRegions.size > 0 || allowedStates.size > 0) {
    let allowed = false;
    let stateCode: string | undefined;

    if (regionCode) {
      if (allowedRegions.has(regionCode)) {
        allowed = true;
      } else {
        const parts = regionCode.split("-");
        if (parts.length > 1) {
          stateCode = parts[parts.length - 1];
        }
      }
    }

    if (!allowed && regionName) {
      stateCode = stateCode ?? normalizeState(regionName);
    }

    if (!allowed && stateCode && allowedStates.has(stateCode)) {
      allowed = true;
    }

    return {
      allowed,
      reason: allowed ? undefined : "Location not eligible",
    };
  }

  if (allowedCountries.size > 0) {
    const allowed = !!countryCode && allowedCountries.has(countryCode);
    return {
      allowed,
      reason: allowed ? undefined : "Location not eligible",
    };
  }

  return { allowed: true };
}
