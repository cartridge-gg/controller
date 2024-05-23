import {
  ControllerColor,
  ControllerTheme,
  ControllerThemePreset,
  defaultPresets,
} from "@cartridge/controller";
import { CartridgeTheme } from "@cartridge/ui";
import { useRouter } from "next/router";
import { useContext, createContext, useMemo } from "react";

const ControllerThemeContext = createContext<ControllerThemeContext>(undefined);

type ControllerThemeContext = ControllerTheme;

export const ControllerThemeProvider = ControllerThemeContext.Provider;

export function useControllerTheme() {
  const ctx = useContext<ControllerThemeContext>(ControllerThemeContext);
  if (!ctx) {
    throw new Error("ControllerThemeProvider must be placed");
  }

  return ctx;
}

export function useControllerThemePreset() {
  const router = useRouter();

  return useMemo(() => {
    const q = router.query.theme;
    if (typeof q === "undefined") {
      return defaultPresets.cartridge;
    }

    const str = decodeURIComponent(Array.isArray(q) ? q[q.length - 1] : q);

    try {
      return JSON.parse(str) as ControllerThemePreset;
    } catch {
      return defaultPresets.cartridge;
    }
  }, [router.query.theme]);
}

export function useChakraTheme(preset: ControllerThemePreset) {
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
