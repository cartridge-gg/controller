import {
  ControllerColor,
  ControllerTheme,
  ControllerThemePreset,
  defaultTheme,
} from "@cartridge/controller";
import { CartridgeTheme } from "@cartridge/ui";
import { useThemeEffect } from "@cartridge/ui-next";
import { useColorMode } from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  useContext,
  createContext,
  useMemo,
  useEffect,
  ProviderProps,
} from "react";

const ControllerThemeContext = createContext<ControllerTheme>(undefined);

export function ControllerThemeProvider({
  theme,
  value,
  children,
}: ProviderProps<ControllerTheme> & { theme: ControllerThemePreset }) {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode(value.colorMode);
  }, [setColorMode, value.colorMode]);

  useThemeEffect({ theme, assetUrl: "" });

  return (
    <ControllerThemeContext.Provider value={value}>
      {children}
    </ControllerThemeContext.Provider>
  );
}

export function useControllerTheme() {
  const ctx = useContext<ControllerTheme>(ControllerThemeContext);
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
      return defaultTheme;
    }

    const str = decodeURIComponent(Array.isArray(q) ? q[q.length - 1] : q);

    try {
      return JSON.parse(str) as ControllerThemePreset;
    } catch {
      return defaultTheme;
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
