/**
 * Validates a redirect URL to prevent XSS and open redirect attacks.
 *
 * This validator is designed for the standalone auth flow where we want to
 * support redirecting to external game domains (e.g., lootsurvivor.io)
 * after authentication, while blocking dangerous attack vectors.
 *
 * @param redirectUrl - The URL to validate (from redirectUrl option)
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
  } catch {
    return {
      isValid: false,
      error: "Invalid URL format",
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
