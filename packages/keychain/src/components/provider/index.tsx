import { UpgradeProvider } from "@/components/provider/upgrade";
import { useConnectionValue } from "@/hooks/connection";
import { WalletsProvider } from "@/hooks/wallets";
import { ENDPOINT } from "@/utils/graphql";
import { Auth0Provider, Auth0ProviderOptions } from "@auth0/auth0-react";
import { mainnet, sepolia } from "@starknet-react/chains";
import {
  jsonRpcProvider,
  StarknetConfig,
  cartridge,
} from "@starknet-react/core";
import { TurnkeyProvider } from "@turnkey/sdk-react";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { constants, num } from "starknet";
import { ConnectionContext } from "./connection";
import { PostHogProvider } from "./posthog";
import { TokensProvider } from "./tokens";
import { UIProvider } from "./ui";
import { FeatureProvider } from "@/hooks/features";
import { ArcadeProvider as ProfileArcadeProvider } from "@/components/provider/arcade";
import { DataProvider as ProfileDataProvider } from "@/components/provider/data";
import { ToastProvider } from "@/context";
import { QuestProvider } from "@/context/quest";
import { IndexerAPIProvider } from "@cartridge/ui/utils/api/indexer";
import { CartridgeAPIProvider } from "@cartridge/ui/utils/api/cartridge";
import { ErrorBoundary } from "../ErrorBoundary";
import { MarketplaceClientProvider } from "@cartridge/arcade/marketplace/react";

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

  const marketplaceConfig = useMemo(
    () => ({
      chainId:
        (connection.controller?.chainId() as constants.StarknetChainId) ||
        constants.StarknetChainId.SN_MAIN,
      defaultProject: connection.project || undefined,
    }),
    [connection.controller, connection.project],
  );

  return (
    <FeatureProvider>
      <CartridgeAPIProvider url={ENDPOINT}>
        <IndexerAPIProvider credentials="omit">
          <QueryClientProvider client={queryClient}>
            <ConnectionContext.Provider value={connection}>
              <TurnkeyProvider config={turnkeyConfig}>
                <Auth0Provider {...auth0Config}>
                  <WalletsProvider>
                    <PostHogProvider>
                      <ErrorBoundary>
                        <UpgradeProvider controller={connection.controller}>
                          <UIProvider>
                            <StarknetConfig
                              explorer={cartridge}
                              chains={[sepolia, mainnet]}
                              defaultChainId={defaultChainId}
                              provider={jsonRpcProvider({ rpc })}
                            >
                              <ToastProvider>
                                <TokensProvider>
                                  <ProfileArcadeProvider>
                                    <MarketplaceClientProvider
                                      config={marketplaceConfig}
                                    >
                                      <ProfileDataProvider>
                                        <QuestProvider>
                                          {children}
                                        </QuestProvider>
                                      </ProfileDataProvider>
                                    </MarketplaceClientProvider>
                                  </ProfileArcadeProvider>
                                </TokensProvider>
                              </ToastProvider>
                            </StarknetConfig>
                          </UIProvider>
                        </UpgradeProvider>
                      </ErrorBoundary>
                    </PostHogProvider>
                  </WalletsProvider>
                </Auth0Provider>
              </TurnkeyProvider>
            </ConnectionContext.Provider>
          </QueryClientProvider>
        </IndexerAPIProvider>
      </CartridgeAPIProvider>
    </FeatureProvider>
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
  /// This doesn't matter as we never use the WebAuthn
  rpId: "http://localhost",
  iframeUrl: import.meta.env.VITE_TURNKEY_IFRAME_URL,
};

const auth0Config: Auth0ProviderOptions = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN!,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: window.location.origin,
  },
};
