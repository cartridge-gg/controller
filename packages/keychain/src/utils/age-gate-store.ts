import type { IdentityContextValue } from "@/components/identity/provider";

export type AgeGateStatus = IdentityContextValue["ageGateStatus"];

/**
 * Synchronous mirror of the age-gate status for non-React consumers — namely
 * the headless execute path in `utils/connection/execute.ts`, which can't read
 * React context. The source of truth stays in `IdentityProvider`, which keeps
 * this in sync via `useSyncAgeGateStore`.
 *
 * NOT a security boundary: anything in the iframe runtime is user-alterable, so
 * this only gates UX/compliance. Real enforcement belongs server-side.
 *
 * Default mirrors "no age gate configured" (allowed).
 */
let ageGateStatus: AgeGateStatus = {
  isPending: false,
  isBlocked: false,
  isAllowed: true,
};

export function setAgeGateStatus(status: AgeGateStatus): void {
  ageGateStatus = status;
}

export function getAgeGateStatus(): AgeGateStatus {
  return ageGateStatus;
}
