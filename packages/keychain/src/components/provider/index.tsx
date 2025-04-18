import { useConnectionValue } from "@/hooks/connection";
import { ENDPOINT } from "@/utils/graphql";
import { Auth0Provider } from "@auth0/auth0-react";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { mainnet, sepolia } from "@starknet-react/chains";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { TurnkeyProvider } from "@turnkey/sdk-react";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { constants, num } from "starknet";
import { ConnectionContext } from "./connection";
import { PostHogProvider } from "./posthog";
import { TokensProvider } from "./tokens";
import { UpgradeProvider } from "@/components/provider/upgrade";
import { WalletsProvider } from "@/hooks/wallets";
import { UIProvider } from "./ui";

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
          <TurnkeyProvider config={turnkeyConfig}>
            <Auth0Provider {...auth0Config}>
              <WalletsProvider>
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
                          <TokensProvider>{children}</TokensProvider>
                        </StarknetConfig>
                      </BrowserRouter>
                    </UIProvider>
                  </UpgradeProvider>
                </PostHogProvider>
              </WalletsProvider>
            </Auth0Provider>
          </TurnkeyProvider>
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

const turnkeyConfig = {
  apiBaseUrl: import.meta.env.VITE_TURNKEY_BASE_URL!,
  defaultOrganizationId: import.meta.env.VITE_TURNKEY_ORGANIZATION_ID!,
  rpId: "http://localhost",
  iframeUrl: import.meta.env.VITE_TURNKEY_IFRAME_URL,
};

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN!,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: import.meta.env.VITE_ORIGIN!,
  },
};
