import { PropsWithChildren, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useConnectionValue } from "@/hooks/connection";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { ENDPOINT } from "@/utils/graphql";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { ConnectionContext } from "./connection";
import { ControllerThemeProvider } from "./theme";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { constants, num } from "starknet";

export function Provider({ children }: PropsWithChildren) {
  const connection = useConnectionValue();
  const rpc = useCallback(() => {
    let nodeUrl;
    switch (connection.chainId) {
      case constants.StarknetChainId.SN_MAIN:
        nodeUrl = process.env.NEXT_PUBLIC_RPC_MAINNET;
        break;
      case constants.StarknetChainId.SN_SEPOLIA:
        nodeUrl = process.env.NEXT_PUBLIC_RPC_SEPOLIA;
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
          <ControllerThemeProvider>
            <StarknetConfig
              explorer={voyager}
              chains={[sepolia, mainnet]}
              defaultChainId={defaultChainId}
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
