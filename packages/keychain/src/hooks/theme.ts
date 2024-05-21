import {
  ControllerColor,
  ControllerTheme,
  ControllerThemeOptions,
  presets,
} from "@cartridge/controller";
import { CartridgeTheme } from "@cartridge/ui";
import { useRouter } from "next/router";
import { useContext, createContext, useMemo } from "react";

const ControllerThemeContext = createContext<ControllerThemeContext>(
  presets.cartridge,
);

type ControllerThemeContext = ControllerTheme;

export const ControllerThemeProvider = ControllerThemeContext.Provider;

export function useControllerTheme() {
  return useContext<ControllerThemeContext>(ControllerThemeContext);
}

export function useControllerThemeQuery() {
  const router = useRouter();

  return useMemo<ControllerThemeOptions>(() => {
    const q = router.query.theme;
    if (typeof q === "undefined") return;

    const str = decodeURIComponent(Array.isArray(q) ? q[q.length - 1] : q);

    try {
      return JSON.parse(str);
    } catch {
      return undefined;
    }
  }, [router.query.theme]);
}

export function useChakraTheme(query: ControllerThemeOptions) {
  const preset = presets[query?.preset ?? ""] ?? presets.cartridge;

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
              toThemeColor(query?.colors?.primary ?? preset?.colors?.primary) ??
              CartridgeTheme.semanticTokens.colors.brand.primary,
          },
        },
      },
    }),
    [preset, query?.colors],
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
