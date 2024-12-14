import { ControllerThemeContext } from "@/context/theme";
import { ControllerColor, ControllerTheme } from "@cartridge/presets";
import { CartridgeTheme } from "@cartridge/ui";
import { useContext, useMemo } from "react";

export function useControllerTheme() {
  const ctx = useContext<ControllerTheme | undefined>(ControllerThemeContext);
  if (!ctx) {
    throw new Error("ControllerThemeProvider must be placed");
  }

  return ctx;
}

export function useChakraTheme(preset: ControllerTheme) {
  return useMemo(
    () => ({
      ...CartridgeTheme,
      semanticTokens: {
        ...CartridgeTheme.semanticTokens,
        colors: {
          ...CartridgeTheme.semanticTokens.colors,
          brand: {
            ...CartridgeTheme.semanticTokens.colors.brand,
            primary:
              toThemeColor(preset?.colors?.primary) ??
              CartridgeTheme.semanticTokens.colors.brand.primary,
            primaryForeground:
              toThemeColor(preset?.colors?.primaryForeground) ??
              CartridgeTheme.semanticTokens.colors.solid.bg,
          },
        },
      },
    }),
    [preset],
  );
}

function toThemeColor(val: string | ControllerColor | undefined) {
  if (typeof val === "undefined") {
    return;
  }

  if (typeof val === "string") {
    return val;
  }

  return {
    default: val.dark,
    _light: val.light,
  };
}
