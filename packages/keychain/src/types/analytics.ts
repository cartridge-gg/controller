import type { PostHogWrapper } from "@cartridge/ui/utils";

/**
 * Typed event catalog for PostHog analytics.
 *
 * Common properties (origin, chain_id, controller_version) are injected
 * automatically via posthog.register() — do NOT include them here.
 *
 * Event names are immutable once shipped — changing them breaks dashboards.
 */

// Signup / Login
interface SignupStartedProps {
  has_existing_account: boolean;
}
interface SignupMethodSelectedProps {
  method: string;
}
interface SignupCompletedProps {
  method: string;
  duration_ms: number;
}
interface SignupFailedProps {
  method: string;
  error_code: string;
}
type LoginStartedProps = Record<string, never>;
interface LoginCompletedProps {
  method: string;
  duration_ms: number;
}
interface LoginFailedProps {
  method: string;
  error_code: string;
}

// Session
interface SessionRequestedProps {
  policy_count: number;
  has_spending_limits: boolean;
  verified: boolean;
}
interface SessionApprovedProps {
  policy_count: number;
  duration_ms: number;
}
interface SessionRejectedProps {
  duration_ms: number;
}
interface SessionRegisteredProps {
  duration_ms: number;
}
interface SessionRegisterFailedProps {
  error_code: string;
}

// Transaction
interface TxRequestedProps {
  call_count: number;
}
interface TxFeeEstimatedProps {
  fee_token: string;
  duration_ms: number;
}
interface TxApprovedProps {
  call_count: number;
  duration_ms: number;
}
interface TxRejectedProps {
  duration_ms: number;
}
interface TxSubmittedProps {
  duration_ms: number;
}
interface TxFailedProps {
  error_code: string;
  stage: "estimation" | "signing" | "submission";
}

// Purchase
interface PurchaseStartedProps {
  type: string;
}
interface PurchaseMethodSelectedProps {
  method: string;
}
interface PurchaseCheckoutStartedProps {
  method: string;
}
interface PurchaseCompletedProps {
  method: string;
  duration_ms?: number;
}
interface PurchaseFailedProps {
  method: string;
  error_code: string;
  stage: string;
}

export interface AnalyticsEventMap {
  signup_started: SignupStartedProps;
  signup_method_selected: SignupMethodSelectedProps;
  signup_completed: SignupCompletedProps;
  signup_failed: SignupFailedProps;
  login_started: LoginStartedProps;
  login_completed: LoginCompletedProps;
  login_failed: LoginFailedProps;

  session_requested: SessionRequestedProps;
  session_approved: SessionApprovedProps;
  session_rejected: SessionRejectedProps;
  session_registered: SessionRegisteredProps;
  session_register_failed: SessionRegisterFailedProps;

  tx_requested: TxRequestedProps;
  tx_fee_estimated: TxFeeEstimatedProps;
  tx_approved: TxApprovedProps;
  tx_rejected: TxRejectedProps;
  tx_submitted: TxSubmittedProps;
  tx_failed: TxFailedProps;

  purchase_started: PurchaseStartedProps;
  purchase_method_selected: PurchaseMethodSelectedProps;
  purchase_checkout_started: PurchaseCheckoutStartedProps;
  purchase_completed: PurchaseCompletedProps;
  purchase_failed: PurchaseFailedProps;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

/**
 * Type-safe PostHog capture. Use this instead of posthog.capture() directly
 * to get compile-time validation of event names and properties.
 */
export function captureAnalyticsEvent<K extends AnalyticsEventName>(
  posthog: PostHogWrapper,
  event: K,
  properties: AnalyticsEventMap[K],
): void {
  try {
    posthog.capture(event, properties as Record<string, unknown>);
  } catch {
    // Analytics must never block user flows
  }
}

/**
 * Sanitize error messages for analytics — strip hex addresses and long hashes.
 */
export function sanitizeErrorCode(error: unknown): string {
  if (!error) return "unknown";
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "unknown";
  // Strip hex strings longer than 20 chars (addresses, hashes)
  return msg.replace(/0x[a-fA-F0-9]{20,}/g, "[hex]").slice(0, 200);
}
