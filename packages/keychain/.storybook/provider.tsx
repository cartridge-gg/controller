import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  cartridge,
  publicProvider,
} from "@starknet-react/core";
import { BrowserRouter } from "react-router-dom";
import { ConnectionContext } from "../src/components/provider/connection";
import { UIProvider } from "../src/components/provider/ui";
import {
  MockUpgradeProvider,
  StoryParameters,
  useMockedConnection,
} from "./mock";
import { TokensProvider } from "../src/components/provider/tokens";
import { PostHogProvider } from "../src/components/provider/posthog";
import { WalletsProvider } from "../src/hooks/wallets";
import { FeatureProvider } from "../src/hooks/features";
import { NavigationProvider } from "../src/context/navigation";

export function Provider({
  children,
  parameters,
}: { parameters: StoryParameters } & PropsWithChildren) {
  const connection = useMockedConnection(parameters);

  return (
    <StarknetConfig
      chains={[mainnet]}
      explorer={cartridge}
      provider={publicProvider()}
    >
      <BrowserRouter>
        <NavigationProvider>
          <FeatureProvider>
            <QueryClientProvider client={queryClient}>
              <ConnectionContext.Provider value={connection}>
                <WalletsProvider>
                  <PostHogProvider>
                    <MockUpgradeProvider controller={connection.controller}>
                      <UIProvider>
                        <TokensProvider>{children}</TokensProvider>
                      </UIProvider>
                    </MockUpgradeProvider>
                  </PostHogProvider>
                </WalletsProvider>
              </ConnectionContext.Provider>
            </QueryClientProvider>
          </FeatureProvider>
        </NavigationProvider>
      </BrowserRouter>
    </StarknetConfig>
  );
}

const queryClient = new QueryClient();
