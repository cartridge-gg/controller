import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useConnectionValue } from "hooks/connection";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { ENDPOINT } from "utils/graphql";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { ConnectionContext } from "./connection";
import { ControllerThemeProvider } from "./theme";

export function Provider({ children }: PropsWithChildren) {
  const connection = useConnectionValue();

  return (
    <CartridgeAPIProvider url={ENDPOINT}>
      <QueryClientProvider client={queryClient}>
        <ConnectionContext.Provider value={connection}>
          <ControllerThemeProvider>
            <PostHogProvider client={posthog}>{children}</PostHogProvider>
          </ControllerThemeProvider>
        </ConnectionContext.Provider>
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
