import { useQuery } from "react-query";
import { getIpLocation } from "@/utils/ip";

export interface Geo {
  /** Raw country code (e.g. "US"), or null if unresolved. */
  countryCode: string | null;
  /** Raw region code (e.g. "US-CA"), or null if unresolved. */
  regionCode: string | null;
  /** Convenience: whether the client is in the United States. */
  isUS: boolean;
  /** True once the lookup has resolved (success or failure). */
  countryCodeLoaded: boolean;
  /** Whether the lookup is currently in flight. */
  isLoading: boolean;
  /** Whether the lookup failed. */
  isError: boolean;
  /** The lookup error, if any. */
  error: unknown;
}

const GEO_QUERY_KEY = ["geo", "ip-location"];

/**
 * IP-based geolocation for the current client. Fetched once per session and
 * shared across consumers via react-query (Infinity stale/cache time) so the
 * `/api/geo` lookup only runs a single time. Never throws — getIpLocation
 * resolves to null codes on failure.
 */
export function useGeoLocation(): Geo {
  const { data, isFetched, isLoading, isError, error } = useQuery({
    queryKey: GEO_QUERY_KEY,
    queryFn: getIpLocation,
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const countryCode = data?.countryCode ?? null;

  return {
    countryCode,
    regionCode: data?.regionCode ?? null,
    isUS: countryCode === "US",
    countryCodeLoaded: isFetched,
    isLoading,
    isError,
    error,
  };
}
