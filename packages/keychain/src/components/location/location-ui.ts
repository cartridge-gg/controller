import type { LocationGateOptions } from "@cartridge/controller";
import { STATE_PATHS } from "./us-state-paths";

export function getSupportedUSStates(
  gate?: LocationGateOptions | null,
): string[] {
  const allStates = Object.keys(STATE_PATHS);
  const allowed = new Set(
    (gate?.allowed ?? []).map((code) => code.trim().toUpperCase()),
  );
  const blocked = new Set(
    (gate?.blocked ?? []).map((code) => code.trim().toUpperCase()),
  );
  const hasAllowlist = allowed.size > 0;
  const supportsAllUSStates = !hasAllowlist || allowed.has("US");

  if (blocked.has("US")) return [];

  return allStates.filter(
    (state) =>
      (supportsAllUSStates || allowed.has(state)) && !blocked.has(state),
  );
}

type BrowserHelp = {
  name: string;
  url: string;
};

export function getLocationPermissionHelp(userAgent: string): BrowserHelp {
  if (/Edg\//i.test(userAgent)) {
    return {
      name: "Microsoft Edge",
      url: "https://support.microsoft.com/en-us/microsoft-edge/location-and-privacy-in-microsoft-edge-31b5d154-0b1b-90ef-e389-7c7d4ffe7b04",
    };
  }
  if (/Firefox|FxiOS/i.test(userAgent)) {
    return {
      name: "Firefox",
      url: "https://support.mozilla.org/en-US/kb/does-firefox-share-my-location-websites",
    };
  }
  if (/Chrome|CriOS|Chromium/i.test(userAgent)) {
    return {
      name: "Chrome",
      url: "https://support.google.com/chrome/answer/142065?hl=en",
    };
  }
  if (/Safari/i.test(userAgent)) {
    return {
      name: "Safari",
      url: "https://support.apple.com/guide/safari/customize-settings-per-website-ibrw7f78f7fe/mac",
    };
  }
  return {
    name: "your browser",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API#security_considerations",
  };
}
