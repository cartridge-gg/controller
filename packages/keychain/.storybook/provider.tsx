import { mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  cartridge,
  publicProvider,
} from "@starknet-react/core";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { ConnectionContext } from "../src/components/provider/connection";
import { PostHogProvider } from "../src/components/provider/posthog";
import { TokensProvider } from "../src/components/provider/tokens";
import { UIProvider } from "../src/components/provider/ui";
import { NavigationProvider } from "../src/context/navigation";
import { FeatureProvider } from "../src/hooks/features";
import { WalletsProvider } from "../src/hooks/wallets";
import {
  MockUpgradeProvider,
  StoryParameters,
  useMockedConnection,
} from "./mock";

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
