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
