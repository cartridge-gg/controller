import { PropsWithChildren, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useConnectionValue } from "hooks/connection";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { ENDPOINT } from "utils/graphql";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { ConnectionContext } from "./connection";
import { ControllerThemeProvider } from "./theme";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { sepolia, mainnet, Address } from "@starknet-react/chains";
import { constants, num } from "starknet";
import { STRK_CONTRACT_ADDRESS } from "@cartridge/utils";

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
    console.log(nodeUrl);
    return { nodeUrl };
  }, [connection.rpcUrl, connection.chainId]);

  const config = useCallback(() => {
    switch (connection.chainId) {
      case constants.StarknetChainId.SN_MAIN:
        return {
          explorer: voyager,
          chains: [mainnet],
          provider: jsonRpcProvider({ rpc }),
        };
      case constants.StarknetChainId.SN_SEPOLIA:
        return {
          explorer: voyager,
          chains: [sepolia],
          provider: jsonRpcProvider({ rpc }),
        };
      default:
        return {
          explorer: undefined,
          chains: [
            {
              id: num.toBigInt(connection.chainId || 0),
              network: "slot",
              name: "Slot",
              nativeCurrency: {
                address: STRK_CONTRACT_ADDRESS as Address,
                name: "Stark",
                symbol: "STRK",
                decimals: 18,
              },
              testnet: true,
              rpcUrls: {
                default: {
                  http: [connection.rpcUrl || ""],
                },
                public: {
                  http: [connection.rpcUrl || ""],
                },
              },
              explorers: {
                worldexplorer: [""],
              },
            },
          ],
          provider: jsonRpcProvider({ rpc }),
        };
    }
  }, [connection.chainId, rpc]);

  const { explorer, chains, provider } = config();

  return (
    <CartridgeAPIProvider url={ENDPOINT}>
      <QueryClientProvider client={queryClient}>
        <ConnectionContext.Provider value={connection}>
          <ControllerThemeProvider>
            <StarknetConfig
              explorer={explorer}
              chains={chains}
              provider={provider}
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
