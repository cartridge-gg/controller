const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function isLocalhostHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    LOCALHOST_HOSTNAMES.has(normalized) || normalized.endsWith(".localhost")
  );
}

/**
 * Restrict iframe targets to HTTPS in production, while still allowing local HTTP dev.
 */
export function validateKeychainIframeUrl(url: URL): void {
  if (url.username || url.password) {
    throw new Error("Invalid keychain iframe URL: credentials are not allowed");
  }

  if (url.protocol === "https:") {
    return;
  }

  if (url.protocol === "http:" && isLocalhostHostname(url.hostname)) {
    return;
  }

  throw new Error(
    "Invalid keychain iframe URL: only https:// or local http:// URLs are allowed",
  );
}

/**
 * Build a conservative allow list for iframe feature policy.
 * Local network access is only needed for localhost development.
 */
export function buildIframeAllowList(url: URL): string {
  const allowFeatures = [
    "publickey-credentials-create *",
    "publickey-credentials-get *",
    "clipboard-write",
    "payment *",
  ];

  if (isLocalhostHostname(url.hostname)) {
    allowFeatures.push("local-network-access *");
  }

  return allowFeatures.join("; ");
}
