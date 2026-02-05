const COINBASE_HOST = "coinbase.com";
const COINBASE_SUBDOMAIN_SUFFIX = ".coinbase.com";

export function getSafeCoinbasePaymentUrl(
  paymentUrl?: string,
): string | undefined {
  if (!paymentUrl) {
    return undefined;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(paymentUrl);
  } catch {
    return undefined;
  }

  if (parsedUrl.protocol !== "https:") {
    return undefined;
  }

  if (parsedUrl.username || parsedUrl.password) {
    return undefined;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isCoinbaseHostname =
    hostname === COINBASE_HOST || hostname.endsWith(COINBASE_SUBDOMAIN_SUFFIX);

  if (!isCoinbaseHostname) {
    return undefined;
  }

  return parsedUrl.toString();
}
