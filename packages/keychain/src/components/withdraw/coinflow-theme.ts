import { useMemo } from "react";
import { MerchantStyle, type MerchantTheme } from "@coinflowlabs/react";
import { useCSSCustomProperty } from "@cartridge/controller-ui";

// Coinflow's MerchantTheme is serialized into the (cross-origin) iframe URL, so
// it needs literal colors — a `var(--x)` reference wouldn't resolve inside the
// iframe. Each drawer design token is resolved to its computed value via
// `useCSSCustomProperty` (which re-renders on theme changes), falling back to
// the dark-theme default when it can't be read (e.g. SSR).
function resolve(value: string, fallback: string): string {
  return value.trim() || fallback;
}

/**
 * Resolves the current drawer design tokens into a Coinflow `MerchantTheme`.
 * Reactive: re-renders when the underlying CSS custom properties change so the
 * iframe theme tracks the active controller theme.
 */
export function useCoinflowTheme(): MerchantTheme {
  const background = useCSSCustomProperty("--spacer-100");
  const backgroundAccent = useCSSCustomProperty("--background-200");
  const backgroundAccent2 = useCSSCustomProperty("--background-300");
  const textColor = useCSSCustomProperty("--foreground-100");
  const textColorAccent = useCSSCustomProperty("--foreground-400");
  const primary = useCSSCustomProperty("--primary-100");

  return useMemo<MerchantTheme>(
    () => ({
      fontSize: "12px",
      style: MerchantStyle.Sharp,
      background: resolve(background, "#0f1410"),
      backgroundAccent: resolve(backgroundAccent, "#1e221"),
      backgroundAccent2: resolve(backgroundAccent2, "#242824"),
      textColor: resolve(textColor, "#ffffff"),
      textColorAccent: resolve(textColorAccent, "#505050"),
      textColorAction: resolve(textColor, "#ffffff"),
      primary: resolve(primary, ""),
    }),
    [
      background,
      backgroundAccent,
      backgroundAccent2,
      textColor,
      textColorAccent,
      primary,
    ],
  );
}
