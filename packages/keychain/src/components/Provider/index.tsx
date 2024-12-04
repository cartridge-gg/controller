import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ControllerThemeProvider } from "hooks/theme";
import { useConnectionValue } from "hooks/connection";
import { ConnectionProvider } from "./connection";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { ENDPOINT } from "utils/graphql";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

export function Provider({ children }: PropsWithChildren) {
  const connection = useConnectionValue();

  return (
    <CartridgeAPIProvider url={ENDPOINT}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider value={connection}>
          <ControllerThemeProvider>
            <PostHogProvider client={posthog}>{children}</PostHogProvider>
          </ControllerThemeProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </CartridgeAPIProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
    },
  },
});
