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

  const controllerTheme = useMemo(
    () => ({
      id: preset.id,
      name: preset.name,
      icon: preset.icon,
      cover: preset.cover,
      colorMode: (router.query.colorMode as ColorMode) ?? "dark",
    }),
    [preset, router.query],
  );
  const connection = useConnectionValue();

  return (
    <ChakraProvider theme={chakraTheme}>
      <CartridgeAPIProvider url={ENDPOINT}>
        <QueryClientProvider client={queryClient}>
          <ControllerThemeProvider value={controllerTheme}>
            <ConnectionProvider value={connection}>
              <PostHogProvider client={posthog}>{children}</PostHogProvider>
            </ConnectionProvider>
          </ControllerThemeProvider>
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
