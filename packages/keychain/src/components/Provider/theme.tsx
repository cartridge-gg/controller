import { toArray } from "@cartridge/controller";
import {
  defaultTheme,
  controllerConfigs,
  ColorMode,
  ControllerTheme,
} from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui-next";
import { ChakraProvider, useColorMode } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";
import { ControllerThemeContext, useChakraTheme } from "hooks/theme";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useMemo } from "react";

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
      val in controllerConfigs &&
      controllerConfigs[val].theme &&
      origin &&
      (origin?.startsWith("https://profile.cartridge.gg") ||
        origin?.startsWith("http://localhost") ||
        toArray(controllerConfigs[val].origin).includes(origin))
    ) {
      return controllerConfigs[val].theme;
    }

    try {
      return JSON.parse(val) as ControllerTheme;
    } catch {
      return defaultTheme;
    }
  }, [router.query.theme, origin]);
}
