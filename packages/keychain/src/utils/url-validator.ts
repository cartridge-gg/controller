import { LOGOUT_QUERY_NAME } from "@cartridge/controller";

/**
 * Validates a redirect URL to prevent XSS and open redirect attacks.
 *
 * This validator is designed for the standalone auth flow where we want to
 * support redirecting to external game domains (e.g., lootsurvivor.io)
 * after authentication, while blocking dangerous attack vectors.
 *
 * @param redirectUrl - The URL to validate (from redirect_url parameter)
 * @returns Object with isValid boolean and optional error message
 */
export function validateRedirectUrl(redirectUrl: string): {
  isValid: boolean;
  error?: string;
} {
  // Check for empty or undefined
  if (!redirectUrl || redirectUrl.trim() === "") {
    return { isValid: false, error: "Redirect URL is empty" };
  }

  // Try to parse as URL
  let url: URL;
  try {
    url = new URL(redirectUrl);
  } catch (e) {
    return {
      isValid: false,
      error: `Invalid URL format: ${e}`,
    };
  }

  // CRITICAL: Block dangerous protocols that can execute JavaScript
  const allowedProtocols = ["http:", "https:"];
  if (!allowedProtocols.includes(url.protocol)) {
    return {
      isValid: false,
      error: `Protocol "${url.protocol}" is not allowed. Only http: and https: are supported.`,
    };
  }

  // CRITICAL: Ensure URL has a valid hostname
  // This blocks edge cases like "javascript:alert(1)" being parsed as a URL
  if (!url.hostname || url.hostname === "") {
    return {
      isValid: false,
      error: "URL must have a valid hostname",
    };
  }

  // Additional validation: Block localhost in production
  // Allow localhost only for development (when current origin is also localhost)
  if (typeof window !== "undefined") {
    const isCurrentHostLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const isRedirectLocal =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";

    // If we're NOT on localhost but trying to redirect to localhost, block it
    if (!isCurrentHostLocal && isRedirectLocal) {
      return {
        isValid: false,
        error: "Cannot redirect to localhost from production",
      };
    }
  }

  // URL is safe to redirect to
  return { isValid: true };
}

// Schemes that can execute script (or read local files) when assigned to
// `window.location.href`. These are always blocked, even for native deep-link
// redirects. Custom app schemes (e.g. cagecalls://open) are NOT in this list.
const DANGEROUS_REDIRECT_PROTOCOLS = [
  "javascript:",
  "data:",
  "vbscript:",
  "blob:",
  "file:",
];

/**
 * Validates a standalone redirect target, allowing native custom-scheme deep
 * links (e.g. `cagecalls://open`, `cartridge-session://session`) that the
 * http-only {@link validateRedirectUrl} would reject, while still blocking
 * dangerous script-executing schemes.
 *
 * http/https targets keep the stricter hostname/localhost rules of
 * {@link validateRedirectUrl}.
 */
export function validateStandaloneRedirectUrl(redirectUrl: string): {
  isValid: boolean;
  error?: string;
} {
  if (!redirectUrl || redirectUrl.trim() === "") {
    return { isValid: false, error: "Redirect URL is empty" };
  }

  let url: URL;
  try {
    url = new URL(redirectUrl);
  } catch (e) {
    return { isValid: false, error: `Invalid URL format: ${e}` };
  }

  const protocol = url.protocol.toLowerCase();

  // CRITICAL: never navigate to a script/file-executing scheme, regardless of
  // whether the target claims to be a native deep link.
  if (DANGEROUS_REDIRECT_PROTOCOLS.includes(protocol)) {
    return {
      isValid: false,
      error: `Protocol "${url.protocol}" is not allowed.`,
    };
  }

  // Web targets keep the http-only hostname/localhost checks.
  if (protocol === "http:" || protocol === "https:") {
    return validateRedirectUrl(redirectUrl);
  }

  // Native custom-scheme deep link: allowed for mobile callbacks.
  return { isValid: true };
}

/** Set a query parameter on web URLs and native custom-scheme deep links. */
export function setQueryParam(
  rawUrl: string,
  key: string,
  value: string,
): string {
  const url = new URL(rawUrl);
  url.searchParams.set(key, value);
  return url.toString();
}

/**
 * Safely redirects to a standalone target (web origin or native custom scheme),
 * blocking dangerous script-executing schemes.
 *
 * @param redirectUrl - The URL to redirect to
 * @param options.logout - Append the logout signal so the app clears its local
 *   session state (see LOGOUT_QUERY_NAME)
 * @returns true if the redirect was performed, false if blocked
 */
export function safeStandaloneRedirect(
  redirectUrl: string,
  options?: { logout?: boolean },
): boolean {
  const validation = validateStandaloneRedirectUrl(redirectUrl);

  if (!validation.isValid) {
    console.error(
      `Blocked unsafe redirect: ${validation.error}`,
      `URL: ${redirectUrl}`,
    );
    return false;
  }

  const finalUrl = options?.logout
    ? setQueryParam(redirectUrl, LOGOUT_QUERY_NAME, "1")
    : redirectUrl;

  window.location.href = finalUrl;
  return true;
}

/**
 * Safely redirects to a validated URL.
 * If validation fails, logs error and does not redirect.
 *
 * @param redirectUrl - The URL to redirect to
 * @param addLastUsedConnector - Whether to add lastUsedConnector=controller query param
 * @returns true if redirect was performed, false if blocked
 */
export function safeRedirect(
  redirectUrl: string,
  addLastUsedConnector = false,
): boolean {
  const validation = validateRedirectUrl(redirectUrl);

  if (!validation.isValid) {
    console.error(
      `Blocked unsafe redirect: ${validation.error}`,
      `URL: ${redirectUrl}`,
    );
    return false;
  }

  // Add parameters to indicate successful standalone auth flow
  let finalUrl = redirectUrl;
  if (addLastUsedConnector) {
    try {
      const url = new URL(redirectUrl);
      // Add lastUsedConnector for backwards compatibility
      url.searchParams.set("lastUsedConnector", "controller");
      // Add dedicated parameter to indicate standalone auth flow completion
      // This is more reliable than lastUsedConnector which can be set by other frameworks
      url.searchParams.set("controller_standalone", "1");
      finalUrl = url.toString();
    } catch (error) {
      console.error("Failed to add redirect parameters:", error);
      // Continue with original URL if adding param fails
    }
  }

  // Safe to redirect
  window.location.href = finalUrl;
  return true;
}
