const ALLOWED_IFRAME_PROTOCOLS = new Set(["http:", "https:"]);

const parseOrigin = (value: string, label: string): string => {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`Invalid ${label}: "${value}"`);
  }

  if (!ALLOWED_IFRAME_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error(
      `Invalid ${label} protocol "${parsedUrl.protocol}". Only http: and https: are allowed.`,
    );
  }

  return parsedUrl.origin;
};

export const resolveChildOrigin = (
  url: URL,
  configuredOrigin?: string,
): string => {
  const urlOrigin = parseOrigin(url.toString(), "keychain URL");
  if (!configuredOrigin) {
    return urlOrigin;
  }

  const expectedOrigin = parseOrigin(configuredOrigin, "keychain origin");
  if (expectedOrigin !== urlOrigin) {
    throw new Error(
      `Keychain URL origin mismatch. Expected "${expectedOrigin}" but received "${urlOrigin}".`,
    );
  }

  return expectedOrigin;
};
