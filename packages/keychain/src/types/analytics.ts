import type { PostHogWrapper } from "@cartridge/controller-ui/utils";
import type { AuthOption } from "@cartridge/controller";

/**
 * Typed event catalog for PostHog analytics.
 *
 * Common properties (origin, chain_id, controller_version) are injected
 * automatically via posthog.register() — do NOT include them here.
 *
 * Event names are immutable once shipped — changing them breaks dashboards.
 */

// Signup / Login

export type SignupErrorCategory =
  | "user_canceled"
  | "popup_blocked"
  | "popup_required"
  | "network"
  | "provider_denied"
  | "username_taken"
  | "invalid_input"
  | "webauthn_unsupported"
  | "rate_limited"
  | "server"
  | "unknown";

export type SignupAuthStep =
  | "fill_form"
  | "choose_method"
  | "password_form"
  | "sms_form"
  | "pending"
  | "error";

export type SignupUsernameValidationReason =
  | "too_short"
  | "invalid_chars"
  | "taken"
  | "reserved"
  | "network"
  | "unknown";

export type SignupMethodPickerTrigger =
  | "multiple_signers"
  | "multiple_options"
  | "password_required"
  | "forced";

export type SignupEnvironmentWarning = "in_app_browser" | "unverified_domain";

interface SignupStartedProps {
  has_existing_account: boolean;
  is_in_app_browser?: boolean;
  signup_options?: AuthOption[];
}
interface SignupMethodSelectedProps {
  method: string;
  attempt_index?: number;
  previous_method?: AuthOption;
}
interface SignupCompletedProps {
  method: string;
  duration_ms: number;
  attempt_count?: number;
  methods_tried?: AuthOption[];
}
interface SignupFailedProps {
  method: string;
  error_code: string;
  error_category?: SignupErrorCategory;
}

interface SignupPageViewedProps {
  forced_action?: "signup" | "login";
  forced_auth_method?: AuthOption;
  prefill_username: boolean;
  is_in_app_browser: boolean;
  in_app_browser_name?: string;
  is_mobile: boolean;
  is_safari: boolean;
  theme_verified: boolean;
  signup_options: AuthOption[];
}
interface SignupEnvironmentWarningShownProps {
  warning_type: SignupEnvironmentWarning;
  app_name?: string;
}
interface SignupUsernameValidationFailedProps {
  reason: SignupUsernameValidationReason;
  length: number;
}
interface SignupAccountResolvedProps {
  exists: boolean;
  signer_count: number;
  signer_types: AuthOption[];
}
interface SignupMethodPickerShownProps {
  available_methods: AuthOption[];
  trigger: SignupMethodPickerTrigger;
}
interface SignupMethodPickerDismissedProps {
  selected_method?: AuthOption;
}
interface SignupMethodAttemptedProps {
  method: AuthOption;
  attempt_index: number;
  previous_method?: AuthOption;
  previous_error_category?: SignupErrorCategory;
}
interface SignupWebauthnPromptShownProps {
  needs_popup: boolean;
}
type SignupWebauthnPromptCanceledProps = Record<string, never>;
type SignupWebauthnPopupRequiredProps = Record<string, never>;
interface SignupSocialRedirectStartedProps {
  method: "google" | "discord";
}
interface SignupSocialRedirectReturnedProps {
  method: "google" | "discord";
  granted: boolean;
}
type SignupSmsOtpRequestedProps = Record<string, never>;
type SignupSmsOtpSubmittedProps = Record<string, never>;
interface SignupSmsOtpInvalidProps {
  reason: "expired" | "wrong" | "rate_limited" | "unknown";
}
type SignupPasswordFormShownProps = Record<string, never>;
interface SignupPasswordValidationFailedProps {
  reason: "too_weak" | "too_short" | "mismatch" | "unknown";
}
interface SignupExternalWalletConnectStartedProps {
  method: AuthOption;
}
interface SignupExternalWalletConnectRejectedProps {
  method: AuthOption;
}
interface SignupAbandonedProps {
  last_step: SignupAuthStep;
  methods_tried: AuthOption[];
  attempt_count: number;
  time_on_page_ms: number;
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
  signup_page_viewed: SignupPageViewedProps;
  signup_environment_warning_shown: SignupEnvironmentWarningShownProps;
  signup_username_validation_failed: SignupUsernameValidationFailedProps;
  signup_account_resolved: SignupAccountResolvedProps;
  signup_method_picker_shown: SignupMethodPickerShownProps;
  signup_method_picker_dismissed: SignupMethodPickerDismissedProps;
  signup_method_attempted: SignupMethodAttemptedProps;
  signup_webauthn_prompt_shown: SignupWebauthnPromptShownProps;
  signup_webauthn_prompt_canceled: SignupWebauthnPromptCanceledProps;
  signup_webauthn_popup_required: SignupWebauthnPopupRequiredProps;
  signup_social_redirect_started: SignupSocialRedirectStartedProps;
  signup_social_redirect_returned: SignupSocialRedirectReturnedProps;
  signup_sms_otp_requested: SignupSmsOtpRequestedProps;
  signup_sms_otp_submitted: SignupSmsOtpSubmittedProps;
  signup_sms_otp_invalid: SignupSmsOtpInvalidProps;
  signup_password_form_shown: SignupPasswordFormShownProps;
  signup_password_validation_failed: SignupPasswordValidationFailedProps;
  signup_external_wallet_connect_started: SignupExternalWalletConnectStartedProps;
  signup_external_wallet_connect_rejected: SignupExternalWalletConnectRejectedProps;
  signup_abandoned: SignupAbandonedProps;
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

export function categorizeError(
  error: unknown,
  method?: AuthOption,
): SignupErrorCategory {
  if (!error) return "unknown";
  const msg = (
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : ""
  ).toLowerCase();
  const name = error instanceof Error ? error.name : "";

  if (name === "AbortError" || /user (?:canc|reject)/i.test(msg)) {
    return "user_canceled";
  }
  if (
    method === "webauthn" &&
    (name === "NotAllowedError" ||
      /operation (?:either )?timed out|not allowed/i.test(msg))
  ) {
    return "user_canceled";
  }
  if (/popup.*(?:block|denied)/i.test(msg)) {
    return "popup_blocked";
  }
  if (/popup.*(?:required|needed)/i.test(msg)) {
    return "popup_required";
  }
  if (name === "TypeError" && /fetch|network/i.test(msg)) {
    return "network";
  }
  if (/network|offline|disconnect/i.test(msg)) {
    return "network";
  }
  if (/access[_ ]denied|consent|provider.*denied/i.test(msg)) {
    return "provider_denied";
  }
  if (/(?:username|name).*(?:taken|exists|already)/i.test(msg)) {
    return "username_taken";
  }
  if (/rate[_ ]?limit|too many|429/i.test(msg)) {
    return "rate_limited";
  }
  if (
    method === "webauthn" &&
    /(?:webauthn|passkey).*(?:unsupported|not supported)/i.test(msg)
  ) {
    return "webauthn_unsupported";
  }
  if (/invalid|required|must be/i.test(msg)) {
    return "invalid_input";
  }
  if (/5\d\d|internal server|server error/i.test(msg)) {
    return "server";
  }
  return "unknown";
}
