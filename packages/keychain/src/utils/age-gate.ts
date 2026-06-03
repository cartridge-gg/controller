import { useConnection } from "@/hooks/connection";

/**
 * Fallback age displayed when a preset enables `ageGate` without specifying a
 * `minimumAge`. Identity verification guarantees the user is of legal age, so
 * we don't read an actual date of birth — this is for display only.
 */
const DEFAULT_MINIMUM_AGE = 18;

export function useRequireAgeVerification() {
  const { ageGate } = useConnection();
  return {
    minimumAge: ageGate?.minimumAge ?? DEFAULT_MINIMUM_AGE,
    requiresAgeVerification: !!ageGate,
  };
}
