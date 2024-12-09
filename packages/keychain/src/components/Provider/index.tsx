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
import { sepolia, mainnet, Chain } from "@starknet-react/chains";
import { constants, num } from "starknet";
import { STRK_CONTRACT_ADDRESS } from "@cartridge/utils";

export function Provider({ children }: PropsWithChildren) {
  const connection = useConnectionValue();
  const rpc = useCallback(
    (chain: Chain) => {
      let nodeUrl;
      switch (num.toHex(chain.id)) {
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
    },
    [connection.rpcUrl],
  );

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
              id: connection.chainId
                ? BigInt(parseInt(connection.chainId, 16))
                : BigInt(0),
              network: "slot",
              name: "Slot",
              nativeCurrency: {
                address: STRK_CONTRACT_ADDRESS,
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
