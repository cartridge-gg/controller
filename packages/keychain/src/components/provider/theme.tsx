import { ColorMode } from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui-next";
import { ChakraProvider, useColorMode } from "@chakra-ui/react";
import { useConnection } from "@/hooks/connection";
import { useChakraTheme } from "@/hooks/theme";
import { PropsWithChildren, useEffect, useMemo } from "react";
import { ControllerThemeContext } from "@/context/theme";
import { useSearchParams } from "react-router-dom";

export function ControllerThemeProvider({ children }: PropsWithChildren) {
  const { theme } = useConnection();

  useThemeEffect({ theme, assetUrl: "" });
  const chakraTheme = useChakraTheme(theme);

  return (
    <ControllerThemeContext.Provider value={theme}>
      <ChakraProvider theme={chakraTheme}>
        <ChakraTheme>{children}</ChakraTheme>
      </ChakraProvider>
    </ControllerThemeContext.Provider>
  );
}

function ChakraTheme({ children }: PropsWithChildren) {
  const [searchParams] = useSearchParams();
  const colorMode = useMemo(
    () => (searchParams.get("colorMode") as ColorMode) ?? "dark",
    [searchParams],
  );
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode(colorMode);
  }, [setColorMode, colorMode]);

  return children;
}
