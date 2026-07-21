import type { ResponsibleGamingFieldsFragment } from "@/utils/api";

export type ResponsibleGamingData = ResponsibleGamingFieldsFragment;

/**
 * Responsible-gaming reporting periods. The backend is the source of truth for
 * which values are valid; these are the values surfaced in the settings UI.
 */
export const RESPONSIBLE_GAMING_PERIODS = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
] as const;
export type ResponsibleGamingPeriod =
  (typeof RESPONSIBLE_GAMING_PERIODS)[number];

export const PERIOD_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

/**
 * The currently-enforced session duration cap, in seconds.
 *
 * A pending change (increase, decrease, or removal) does NOT take effect until
 * its cooling-off period elapses (`pendingEffectiveAt`), so the value that must
 * be respected right now is the active `sessionMaxDurationSeconds`. Returns
 * `null` when the user has not set a session cap (i.e. uncapped).
 *
 * The backend remains authoritative — this is a client-side guard so we never
 * even request a session longer than the user's own limit.
 */
export function effectiveSessionCapSeconds(
  rg?: ResponsibleGamingData | null,
): bigint | null {
  const cap = rg?.sessionMaxDurationSeconds;
  if (cap === null || cap === undefined) return null;
  return BigInt(cap);
}

/**
 * Clamp a requested session duration (seconds) to the effective cap. A `null`
 * cap means no limit, so the requested value is returned unchanged.
 */
export function clampSessionDurationSeconds(
  requestedSeconds: bigint,
  capSeconds: bigint | null,
): bigint {
  if (capSeconds === null) return requestedSeconds;
  return requestedSeconds > capSeconds ? capSeconds : requestedSeconds;
}

/** Whether a requested duration exceeds the effective cap. */
export function exceedsSessionCap(
  requestedSeconds: bigint,
  capSeconds: bigint | null,
): boolean {
  if (capSeconds === null) return false;
  return requestedSeconds > capSeconds;
}

/** Format a cent amount as a USD string, e.g. 1234 -> "$12.34". */
export function formatCents(cents?: number | null): string {
  if (cents === null || cents === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Compact, human-readable duration for a number of seconds. */
export function formatDurationSeconds(seconds?: number | null): string {
  if (seconds === null || seconds === undefined) return "No limit";
  if (seconds <= 0) return "0m";
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 1) return `${minutes}m`;
  return `${seconds}s`;
}

/**
 * Map a backend responsible-gaming error to a clear, user-facing message.
 *
 * The GraphQL fetcher throws `new Error(message)` using the first error's
 * message, so we match on both structured `extensions.code` (when present) and
 * the raw message text. Unknown errors fall back to the backend message (or a
 * generic string) so we never swallow useful detail.
 */
export function mapResponsibleGamingError(error: unknown): string {
  const raw = extractErrorMessage(error);
  const code = extractErrorCode(error);
  const haystack = `${code ?? ""} ${raw}`.toLowerCase();

  // An increase/removal is queued behind a mandatory cooling-off window.
  if (
    haystack.includes("cooling") ||
    haystack.includes("cool_off") ||
    haystack.includes("cool-off") ||
    (haystack.includes("pending") && haystack.includes("effect"))
  ) {
    return "This change is subject to a cooling-off period and will take effect later. Your current limit stays in place until then.";
  }

  // Backend rejected because a change is already queued.
  if (haystack.includes("already") && haystack.includes("pending")) {
    return "You already have a pending limit change. Please wait for it to take effect before making another change.";
  }

  // The limit would be exceeded by the current action.
  if (
    haystack.includes("deposit") &&
    (haystack.includes("limit") || haystack.includes("exceed"))
  ) {
    return "This would exceed your deposit limit for the current period.";
  }
  if (
    haystack.includes("spend") &&
    (haystack.includes("limit") || haystack.includes("exceed"))
  ) {
    return "This would exceed your spending limit for the current period.";
  }

  // Session duration above the configured cap.
  if (haystack.includes("session") && haystack.includes("duration")) {
    return "The requested session length exceeds your maximum session duration limit.";
  }

  // Invalid input.
  if (haystack.includes("period")) {
    return "Please choose a valid limit period.";
  }
  if (
    haystack.includes("invalid") ||
    haystack.includes("negative") ||
    haystack.includes("must be")
  ) {
    return "The limit value is invalid. Please enter a positive amount.";
  }

  return raw || "Something went wrong updating your limits. Please try again.";
}

function extractErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return String(error);
}

function extractErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "extensions" in error) {
    const extensions = (error as { extensions?: unknown }).extensions;
    if (extensions && typeof extensions === "object" && "code" in extensions) {
      const code = (extensions as { code?: unknown }).code;
      if (typeof code === "string") return code;
    }
  }
  return undefined;
}
