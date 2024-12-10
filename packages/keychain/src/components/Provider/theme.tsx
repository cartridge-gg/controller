import { ColorMode } from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui-next";
import { ChakraProvider, useColorMode } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";
import { ControllerThemeContext, useChakraTheme } from "hooks/theme";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useMemo } from "react";

export function ControllerThemeProvider({ children }: PropsWithChildren) {
  const { theme } = useConnection();

  useThemeEffect({ theme });
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
