import { PropsWithChildren, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useConnectionValue } from "@/hooks/connection";
import { TokensProvider } from "@cartridge/utils";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { ENDPOINT } from "@/utils/graphql";
import { PostHogProvider } from "./posthog";
import { UIProvider } from "./ui";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { constants, num } from "starknet";
import { BrowserRouter } from "react-router-dom";
import { ConnectionContext } from "./connection";
import { UpgradeProvider } from "@/components/provider/upgrade";

export function Provider({ children }: PropsWithChildren) {
  const connection = useConnectionValue();

  const rpc = useCallback(() => {
    let nodeUrl;
    switch (connection.controller?.chainId()) {
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
  }, [connection.rpcUrl, connection.controller]);

  const defaultChainId = useMemo(() => {
    return num.toBigInt(connection.controller?.chainId() || 0);
  }, [connection.controller]);

  return (
    <CartridgeAPIProvider url={ENDPOINT}>
      <QueryClientProvider client={queryClient}>
        <ConnectionContext.Provider value={connection}>
          <PostHogProvider>
            <UpgradeProvider controller={connection.controller}>
              <UIProvider>
                <BrowserRouter>
                  <StarknetConfig
                    explorer={voyager}
                    chains={[sepolia, mainnet]}
                    defaultChainId={defaultChainId}
                    provider={jsonRpcProvider({ rpc })}
                  >
                    <TokensProvider provider={connection.controller?.provider}>
                      {children}
                    </TokensProvider>
                  </StarknetConfig>
                </BrowserRouter>
              </UIProvider>
            </UpgradeProvider>
          </PostHogProvider>
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
