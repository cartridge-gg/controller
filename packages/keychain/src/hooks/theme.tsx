import {
  ControllerColor,
  ControllerTheme,
  defaultTheme,
  toArray,
} from "@cartridge/controller";
import { CartridgeTheme } from "@cartridge/ui";
import { useThemeEffect } from "@cartridge/ui-next";
import { ChakraProvider, ColorMode, useColorMode } from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  useContext,
  createContext,
  useMemo,
  useEffect,
  PropsWithChildren,
} from "react";
import { verifiedConfigs } from "@cartridge/controller";
import { useConnection } from "./connection";

const ControllerThemeContext = createContext<ControllerTheme>(undefined);

export function ControllerThemeProvider({ children }: PropsWithChildren) {
  const preset = useControllerThemePreset();
  const controllerTheme = useMemo(
    () => ({
      name: preset.name,
      icon: preset.icon,
      cover: preset.cover,
    }),
    [preset],
  );

  useThemeEffect({ theme: preset, assetUrl: "" });
  const chakraTheme = useChakraTheme(preset);

  return (
    <ControllerThemeContext.Provider value={controllerTheme}>
      <ChakraProvider theme={chakraTheme}>
        <ChakraTheme>{children}</ChakraTheme>
      </ChakraProvider>
    </ControllerThemeContext.Provider>
  );
}

function ChakraTheme({ children }: PropsWithChildren) {
  const router = useRouter();
  const colorMode = useMemo(
    () => (router.query.colorMode as ColorMode) ?? "dark",
    [router.query.colorMode],
  );
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode(colorMode);
  }, [setColorMode, colorMode]);
  return children;
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
  const { origin } = useConnection();

  return useMemo(() => {
    const themeParam = router.query.theme;
    if (typeof themeParam === "undefined") {
      return defaultTheme;
    }
    const val = decodeURIComponent(
      Array.isArray(themeParam)
        ? themeParam[themeParam.length - 1]
        : themeParam,
    );

    if (
      typeof val === "string" &&
      val in verifiedConfigs &&
      verifiedConfigs[val].theme &&
      (origin?.startsWith("http://localhost") ||
        toArray(verifiedConfigs[val].origin).includes(origin))
    ) {
      return verifiedConfigs[val].theme;
    }

    try {
      return JSON.parse(val) as ControllerTheme;
    } catch {
      return defaultTheme;
    }
  }, [router.query.theme, origin]);
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
