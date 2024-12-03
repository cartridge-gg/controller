import { ChakraProvider, ColorMode } from "@chakra-ui/react";
import { PropsWithChildren, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  ControllerThemeProvider,
  useChakraTheme,
  useControllerThemePreset,
} from "hooks/theme";
import { useRouter } from "next/router";
import { useConnectionValue } from "hooks/connection";
import { ConnectionProvider } from "./connection";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { ENDPOINT } from "utils/graphql";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

export function Provider({ children }: PropsWithChildren) {
  const preset = useControllerThemePreset();
  const chakraTheme = useChakraTheme(preset);
  const router = useRouter();

  const colorMode = useMemo(
    () => (router.query.colorMode as ColorMode) ?? "dark",
    [router.query.colorMode],
  );
  const controllerTheme = useMemo(
    () => ({
      name: preset.name,
      icon: preset.icon,
      cover: preset.cover,
    }),
    [preset],
  );
  const connection = useConnectionValue();

  return (
    <ChakraProvider theme={chakraTheme}>
      <CartridgeAPIProvider url={ENDPOINT}>
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider value={connection}>
            <ControllerThemeProvider
              value={controllerTheme}
              colorMode={colorMode}
              theme={preset}
            >
              <PostHogProvider client={posthog}>{children}</PostHogProvider>
            </ControllerThemeProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </CartridgeAPIProvider>
    </ChakraProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
    },
  },
});
