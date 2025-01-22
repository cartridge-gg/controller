import { PropsWithChildren, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useConnectionValue } from "@/hooks/connection";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { ENDPOINT } from "@/utils/graphql";
import { ConnectionContext } from "./connection";
import { PostHogProvider } from "./posthog";
import { ControllerThemeProvider } from "./theme";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { constants, num } from "starknet";
import { BrowserRouter } from "react-router-dom";

export function Provider({ children }: PropsWithChildren) {
  const connection = useConnectionValue();
  const rpc = useCallback(() => {
    let nodeUrl;
    switch (connection.chainId) {
      case constants.StarknetChainId.SN_MAIN:
        nodeUrl = import.meta.env.VITE_RPC_MAINNET;
        break;
      case constants.StarknetChainId.SN_SEPOLIA:
        nodeUrl = import.meta.env.VITE_RPC_SEPOLIA;
        break;
      default:
        nodeUrl = connection.rpcUrl;
    }
    return { nodeUrl };
  }, [connection.rpcUrl, connection.chainId]);

  const defaultChainId = useMemo(() => {
    return num.toBigInt(connection.chainId || 0);
  }, [connection.chainId]);

  return (
    <CartridgeAPIProvider url={ENDPOINT}>
      <QueryClientProvider client={queryClient}>
        <ConnectionContext.Provider value={connection}>
          <BrowserRouter>
            <ControllerThemeProvider>
              <StarknetConfig
                explorer={voyager}
                chains={[sepolia, mainnet]}
                defaultChainId={defaultChainId}
                provider={jsonRpcProvider({ rpc })}
              >
                <PostHogProvider>{children}</PostHogProvider>
              </StarknetConfig>
            </ControllerThemeProvider>
          </BrowserRouter>
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
