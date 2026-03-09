import { isIframe } from "@cartridge/ui/utils";

type RedirectParamName = "redirect_url" | "redirect_uri" | "callback_uri";

export type RedirectDebugProperties = {
  keychainPathname?: string;
  keychainSearchKeys?: string;
  keychainIsIframe: boolean;
  redirectParamName?: RedirectParamName;
  redirectPresent: boolean;
  redirectLiteralNull: boolean;
  redirectValueLength?: number;
  redirectProtocol?: string;
  redirectHostname?: string;
  redirectOrigin?: string;
  redirectOriginIsNull?: boolean;
  redirectHasQuery?: boolean;
  redirectHasHash?: boolean;
  redirectParseError?: string;
};

const REDIRECT_PARAM_NAMES: RedirectParamName[] = [
  "redirect_url",
  "redirect_uri",
  "callback_uri",
];

export function getRedirectDebugProperties(): RedirectDebugProperties {
  if (typeof window === "undefined") {
    return {
      keychainIsIframe: false,
      redirectPresent: false,
      redirectLiteralNull: false,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const redirectEntry = REDIRECT_PARAM_NAMES.map((name) => ({
    name,
    value: searchParams.get(name),
  })).find((entry) => entry.value);

  const properties: RedirectDebugProperties = {
    keychainPathname: window.location.pathname,
    keychainSearchKeys:
      [...new Set(searchParams.keys())].sort().join(",") || undefined,
    keychainIsIframe: isIframe(),
    redirectParamName: redirectEntry?.name,
    redirectPresent: Boolean(redirectEntry?.value),
    redirectLiteralNull: redirectEntry?.value === "null",
    redirectValueLength: redirectEntry?.value?.length,
  };

  if (!redirectEntry?.value) {
    return properties;
  }

  try {
    const parsed = new URL(redirectEntry.value);
    properties.redirectProtocol = parsed.protocol || undefined;
    properties.redirectHostname = parsed.hostname || undefined;
    properties.redirectOrigin = parsed.origin || undefined;
    properties.redirectOriginIsNull = parsed.origin === "null";
    properties.redirectHasQuery = parsed.search.length > 0;
    properties.redirectHasHash = parsed.hash.length > 0;
  } catch (error) {
    properties.redirectParseError =
      error instanceof Error ? error.message : String(error);
  }

  return properties;
}
