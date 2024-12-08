import { PropsWithChildren, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useConnectionValue } from "hooks/connection";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { ENDPOINT } from "utils/graphql";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { ConnectionContext } from "./connection";
import { ControllerThemeProvider } from "./theme";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";

export function Provider({ children }: PropsWithChildren) {
  const connection = useConnectionValue();
  const rpc = useCallback(() => {
    return {
      nodeUrl: connection.rpcUrl,
    };
  }, [connection.rpcUrl]);

  return (
    <CartridgeAPIProvider url={ENDPOINT}>
      <QueryClientProvider client={queryClient}>
        <ConnectionContext.Provider value={connection}>
          <ControllerThemeProvider>
            <StarknetConfig
              explorer={voyager}
              chains={[sepolia, mainnet]}
              provider={jsonRpcProvider({ rpc })}
            >
              <PostHogProvider client={posthog}>{children}</PostHogProvider>
            </StarknetConfig>
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
